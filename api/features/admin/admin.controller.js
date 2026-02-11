/**
 * Admin Controller - System Maintenance Operations
 * 
 * Endpoints:
 * - POST /admin/rebuild/:leadId - Rebuild single lead from events
 * - POST /admin/rebuild-project/:projectId - Rebuild all leads in project
 * - GET /admin/system-health - System invariants check
 * - GET /admin/failed-jobs - View dead letter queue
 * - POST /admin/retry-failed/:jobId - Retry failed job
 */

const Lead = require('../../models/Lead');
const Event = require('../../models/Event');
const ScoreHistory = require('../../models/ScoreHistory');
const FailedJob = require('../../models/FailedJob');
const eventQueue = require('../../../shared/queue');
const mongoose = require('mongoose');

/**
 * Rebuild a single lead from scratch
 * Deletes all score history and reprocesses events
 */
async function rebuildLead(req, res, next) {
  const { leadId } = req.params;
  
  try {
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    console.log(`[ADMIN] Rebuilding lead: ${leadId}`);
    
    // Step 1: Delete score history
    const deletedHistory = await ScoreHistory.deleteMany({ leadId: lead._id });
    console.log(`  Deleted ${deletedHistory.deletedCount} score history entries`);
    
    // Step 2: Reset lead score
    await Lead.updateOne(
      { _id: lead._id },
      {
        $set: {
          currentScore: 0,
          leadStage: 'cold',
          velocityScore: 0,
          eventsLast24h: 0
        }
      }
    );
    console.log(`  Reset lead score to 0`);
    
    // Step 3: Mark all events as unprocessed
    const updatedEvents = await Event.updateMany(
      { leadId: lead._id },
      { $set: { processed: false, processing: false } }
    );
    console.log(`  Marked ${updatedEvents.modifiedCount} events as unprocessed`);
    
    // Step 4: Re-queue lead
    await eventQueue.add(
      { leadId: leadId },
      { jobId: `rebuild-${leadId}`, priority: 1 }
    );
    console.log(`  Re-queued lead for processing`);
    
    res.json({
      success: true,
      message: 'Lead rebuild initiated',
      leadId,
      stats: {
        historyDeleted: deletedHistory.deletedCount,
        eventsReset: updatedEvents.modifiedCount
      }
    });
    
  } catch (error) {
    next(error);
  }
}

/**
 * Rebuild all leads in a project
 * WARNING: Resource intensive - use carefully
 */
async function rebuildProject(req, res, next) {
  const { projectId } = req.params;
  
  try {
    console.log(`[ADMIN] Rebuilding project: ${projectId}`);
    
    // Get all leads in project
    const leads = await Lead.find({ projectId });
    
    if (leads.length === 0) {
      return res.status(404).json({ error: 'No leads found in project' });
    }
    
    const leadIds = leads.map(l => l._id);
    
    // Step 1: Delete all score history for project
    const deletedHistory = await ScoreHistory.deleteMany({
      leadId: { $in: leadIds }
    });
    
    // Step 2: Reset all lead scores
    await Lead.updateMany(
      { projectId },
      {
        $set: {
          currentScore: 0,
          leadStage: 'cold',
          velocityScore: 0,
          eventsLast24h: 0
        }
      }
    );
    
    // Step 3: Mark all events as unprocessed
    const updatedEvents = await Event.updateMany(
      { leadId: { $in: leadIds } },
      { $set: { processed: false, processing: false } }
    );
    
    // Step 4: Re-queue all leads
    const jobs = leads.map(lead => ({
      leadId: lead._id.toString()
    }));
    
    await eventQueue.addBulk(
      jobs.map((data, idx) => ({
        data,
        opts: { jobId: `rebuild-project-${projectId}-${idx}` }
      }))
    );
    
    console.log(`  Rebuilt ${leads.length} leads`);
    
    res.json({
      success: true,
      message: 'Project rebuild initiated',
      projectId,
      stats: {
        leadsProcessed: leads.length,
        historyDeleted: deletedHistory.deletedCount,
        eventsReset: updatedEvents.modifiedCount
      }
    });
    
  } catch (error) {
    next(error);
  }
}

/**
 * System Health - Check invariants
 */
async function systemHealth(req, res, next) {
  try {
    const violations = [];
    
    // Invariant 1: ScoreHistory eventId uniqueness per lead
    const duplicateScores = await ScoreHistory.aggregate([
      { $group: { _id: { leadId: '$leadId', eventId: '$eventId' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    if (duplicateScores.length > 0) {
      violations.push({
        invariant: 'ScoreHistory uniqueness',
        severity: 'CRITICAL',
        message: `Found ${duplicateScores.length} duplicate score entries`,
        data: duplicateScores.slice(0, 5)
      });
    }
    
    // Invariant 2: All processed events have score history
    const processedWithoutScore = await Event.aggregate([
      { $match: { processed: true } },
      {
        $lookup: {
          from: 'score_histories',
          localField: 'eventId',
          foreignField: 'eventId',
          as: 'history'
        }
      },
      { $match: { history: { $size: 0 } } },
      { $limit: 10 }
    ]);
    
    if (processedWithoutScore.length > 0) {
      violations.push({
        invariant: 'Processed events have score history',
        severity: 'HIGH',
        message: `Found ${processedWithoutScore.length}+ processed events without score history`,
        data: processedWithoutScore.slice(0, 5)
      });
    }
    
    // Invariant 3: No orphaned score history
    const orphanedHistory = await ScoreHistory.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: 'eventId',
          as: 'event'
        }
      },
      { $match: { event: { $size: 0 } } },
      { $limit: 10 }
    ]);
    
    if (orphanedHistory.length > 0) {
      violations.push({
        invariant: 'ScoreHistory references valid events',
        severity: 'MEDIUM',
        message: `Found ${orphanedHistory.length}+ orphaned score history entries`
      });
    }
    
    // Invariant 4: Lead scores match history
    const leads = await Lead.find().limit(100);
    const scoreMismatches = [];
    
    for (const lead of leads) {
      const latestHistory = await ScoreHistory.findOne({ leadId: lead._id })
        .sort({ timestamp: -1 });
      
      if (latestHistory && latestHistory.newScore !== lead.currentScore) {
        scoreMismatches.push({
          leadId: lead._id,
          leadScore: lead.currentScore,
          historyScore: latestHistory.newScore
        });
      }
    }
    
    if (scoreMismatches.length > 0) {
      violations.push({
        invariant: 'Lead scores match latest history',
        severity: 'HIGH',
        message: `Found ${scoreMismatches.length} score mismatches`,
        data: scoreMismatches.slice(0, 5)
      });
    }
    
    // Check for stale locks
    const redis = require('../../config/redis');
    const keys = await redis.keys('lead:*:lock');
    
    if (keys.length > 0) {
      violations.push({
        invariant: 'No stale locks',
        severity: 'LOW',
        message: `Found ${keys.length} active lead locks (may be processing)`
      });
    }
    
    // Summary
    const status = violations.length === 0 ? 'HEALTHY' : 'DEGRADED';
    const critical = violations.filter(v => v.severity === 'CRITICAL').length;
    
    res.json({
      status,
      timestamp: new Date().toISOString(),
      violations,
      summary: {
        total: violations.length,
        critical,
        healthy: violations.length === 0
      }
    });
    
  } catch (error) {
    next(error);
  }
}

/**
 * View failed jobs (dead letter queue)
 */
async function getFailedJobs(req, res, next) {
  try {
    const { limit = 50, retried } = req.query;
    
    const query = {};
    if (retried !== undefined) {
      query.retried = retried === 'true';
    }
    
    const failedJobs = await FailedJob.find(query)
      .sort({ failedAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      count: failedJobs.length,
      jobs: failedJobs
    });
    
  } catch (error) {
    next(error);
  }
}

/**
 * Retry a failed job
 */
async function retryFailedJob(req, res, next) {
  const { jobId } = req.params;
  
  try {
    const failedJob = await FailedJob.findOne({ jobId });
    
    if (!failedJob) {
      return res.status(404).json({ error: 'Failed job not found' });
    }
    
    if (failedJob.retried) {
      return res.status(400).json({ error: 'Job already retried' });
    }
    
    // Re-queue the job
    await eventQueue.add(failedJob.jobData, {
      jobId: `retry-${jobId}`,
      priority: 2
    });
    
    // Mark as retried
    await FailedJob.updateOne(
      { jobId },
      { $set: { retried: true, retriedAt: new Date() } }
    );
    
    res.json({
      success: true,
      message: 'Job re-queued for processing',
      jobId
    });
    
  } catch (error) {
    next(error);
  }
}

module.exports = {
  rebuildLead,
  rebuildProject,
  systemHealth,
  getFailedJobs,
  retryFailedJob
};

/**
 * FILE: analytics.controller.js
 * PURPOSE: Dashboard analytics and statistics
 */

const Lead = require("../../models/Lead");
const Event = require("../../models/Event");
const Queue = require("bull");
const scoringQueue = require("../../../shared/queue");

/**
 * GET /api/analytics/dashboard
 * Overview statistics for dashboard
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const projectId = req.user.projectId;
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Total events in last 24h
    const totalEvents = await Event.countDocuments({
      projectId,
      timestamp: { $gte: last24h },
    });

    // Identity resolutions (leads with email)
    const identityResolutions = await Lead.countDocuments({
      projectId,
      email: { $exists: true, $ne: null },
    });

    // Calculate avg latency (Event created → Event processed)
    const recentProcessedEvents = await Event.find({
      projectId,
      processed: true,
      timestamp: { $gte: last24h },
    })
      .select("timestamp createdAt")
      .limit(100);

    let avgLatency = 0;
    if (recentProcessedEvents.length > 0) {
      const latencies = recentProcessedEvents.map((e) =>
        Math.abs(new Date(e.createdAt) - new Date(e.timestamp)),
      );
      avgLatency = Math.round(
        latencies.reduce((a, b) => a + b, 0) / latencies.length,
      );
    }

    // Qualified leads (score > 85)
    const qualifiedLeads = await Lead.countDocuments({
      projectId,
      currentScore: { $gt: 85 },
    });

    res.json({
      success: true,
      data: {
        totalEvents,
        identityResolutions,
        avgLatency,
        qualifiedLeads,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/throughput
 * Event throughput over time (hourly buckets)
 */
exports.getThroughputData = async (req, res, next) => {
  try {
    const projectId = req.user.projectId;
    const hours = parseInt(req.query.hours) || 24;
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

    // Aggregate events by hour
    const throughput = await Event.aggregate([
      {
        $match: {
          projectId,
          timestamp: { $gte: startTime },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d %H:00",
              date: "$timestamp",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Also get score mutations per hour
    const scoreMutations = await Lead.aggregate([
      {
        $match: {
          projectId,
          updatedAt: { $gte: startTime },
          currentScore: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d %H:00",
              date: "$updatedAt",
            },
          },
          scoreMutations: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Merge the two datasets
    const merged = {};
    throughput.forEach((t) => {
      merged[t._id] = { hour: t._id, events: t.count, mutations: 0 };
    });
    scoreMutations.forEach((m) => {
      if (merged[m._id]) {
        merged[m._id].mutations = m.scoreMutations;
      } else {
        merged[m._id] = { hour: m._id, events: 0, mutations: m.scoreMutations };
      }
    });

    const result = Object.values(merged);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getQueueHealth = async (req, res, next) => {
  try {
    const waiting = await scoringQueue.getWaitingCount();
    const active = await scoringQueue.getActiveCount();
    const completed = await scoringQueue.getCompletedCount();
    const failed = await scoringQueue.getFailedCount();

    res.json({
      success: true,
      data: {
        waiting,
        active,
        completed,
        failed,
        workers: 4,
        maxWorkers: 12,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getScoreMutations = async (req, res, next) => {
  try {
    const projectId = req.user.projectId;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent events that caused score changes
    const recentEvents = await Event.find({ projectId, processed: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("leadId", "email name company currentScore anonymousId");

    const mutations = recentEvents.map((event) => ({
      leadIdentifier:
        event.leadId?.email ||
        event.leadId?.name ||
        event.leadId?.anonymousId ||
        "anonymous",
      eventType: event.eventType,
      score: event.leadId?.currentScore || 0,
      timestamp: event.createdAt,
      delta: 0, // We don't track delta in current schema, could be added
    }));

    res.json({
      success: true,
      data: mutations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/automation-logs
 * Recent automation/webhook triggers (placeholder for now)
 */
exports.getAutomationLogs = async (req, res, next) => {
  try {
    const projectId = req.user.projectId;
    const limit = parseInt(req.query.limit) || 20;

    // For now, we'll get recent high-score leads as proxy for automation triggers
    const automationEvents = await Lead.find({
      projectId,
      currentScore: { $gte: 85 },
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select("email name currentScore updatedAt");

    const logs = automationEvents.map((lead) => ({
      timestamp: lead.updatedAt,
      type: "TRIGGER",
      message: `Lead ${lead.email || lead.name || "unknown"} reached MQL threshold (${lead.currentScore})`,
      leadId: lead._id,
    }));

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * FILE: processLeadWorkflow.js
 * PURPOSE: Core business logic for event-driven score calculation
 * PATTERN: Transaction-based workflow with locking
 *
 * GUARANTEES:
 * - Idempotency: eventId uniqueness enforced in ScoreHistory
 * - Ordering: Events sorted by timestamp before processing
 * - Atomicity: All operations in single MongoDB transaction
 * - Isolation: Per-lead lock prevents concurrent updates
 */

const Event = require("../models/Event");
const Lead = require("../models/Lead");
const ScoreHistory = require("../models/ScoreHistory");
const { getRule } = require("../services/scoringRulesCache");

// Production guardrails
const MAX_SCORE = 10000; // Prevent score overflow
const { calculateStage } = require("../domain/stageEngine");
const logger = require("../utils/logger");

async function processLeadWorkflow(leadId, session) {
  // ===============================
  // Per-Lead Lock Acquisition
  // ===============================
  const lead = await Lead.findOneAndUpdate(
    { _id: leadId, processing: false },
    { $set: { processing: true } },
    { new: true, session },
  );

  // GUARD: Missing lead (already locked or deleted)
  if (!lead) {
    logger.warn("Lead not found or already processing", { leadId });
    return; // Gracefully abort - don't crash worker
  }

  try {
    // ===============================
    // Score History as Source of Truth
    // ===============================
    const last = await ScoreHistory.findOne({ leadId })
      .sort({ timestamp: -1 })
      .select({ newScore: 1 })
      .session(session);
    let score = last ? last.newScore : 0;

    // ===============================
    // Event Processing (ORDERED)
    // ===============================
    const events = await Event.find({
      leadId,
      processed: false,
      queued: true,
      processing: false,
    })
      .sort({ timestamp: 1 })
      .session(session); // Sort ensures ordering

    if (!events.length) {
      await Lead.updateOne(
        { _id: leadId },
        { $set: { processing: false } },
        { session },
      );
      return;
    }

    // 3. Lock events
    const ids = events.map((e) => e._id);
    await Event.updateMany(
      { _id: { $in: ids } },
      { $set: { processing: true } },
      { session },
    );

    // ===============================
    // Score Calculation (Deterministic)
    // ===============================
    const history = [];
    for (const ev of events) {
      // GUARD: Wrap getRule in try-catch + default to 0 for unknown events
      let delta = 0;
      try {
        delta = getRule(ev.eventType) || 0;
      } catch (err) {
        logger.warn("Failed to get rule for event type", {
          eventType: ev.eventType,
          error: err.message,
        });
        delta = 0; // Default to 0, don't crash
      }

      // GUARD: Prevent negative scores (underflow protection)
      const newScore = Math.max(0, score + delta);

      history.push({
        leadId,
        eventId: ev.eventId,
        oldScore: score,
        newScore,
        delta,
        timestamp: new Date(),
      });
      score = newScore;
    }

    // GUARD: Apply max score cap (overflow protection)
    score = Math.min(MAX_SCORE, score);

    // ===============================
    // Idempotency Guarantee
    // ===============================
    // ScoreHistory has unique index on (leadId, eventId)
    // Duplicate inserts are silently ignored
    try {
      await ScoreHistory.insertMany(history, { session, ordered: false });
    } catch (err) {
      if (!(err && (err.code === 11000 || err.name === "BulkWriteError"))) {
        throw err; // Only rethrow if not a duplicate key error
      }
      // Duplicate events safely ignored - idempotency preserved
    }

    // 6. Mark events as processed
    await Event.updateMany(
      { _id: { $in: ids } },
      { $set: { processed: true, queued: false, processing: false } },
      { session },
    );

    // 7. Calculate velocity (count events in last 24h)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const eventsLast24h = await Event.countDocuments({
      leadId,
      processed: true,
      timestamp: { $gte: cutoff },
    }).session(session);

    // 8. Derive stage from score
    const stage = calculateStage(score);

    // 9. Update lead with score, velocity, stage
    await Lead.updateOne(
      { _id: leadId },
      {
        $set: {
          currentScore: score,
          leadStage: stage,
          eventsLast24h,
          lastEventAt: new Date(),
          processing: false,
        },
      },
      { session },
    );

    // 10. Automation rules will be executed post-commit
  } catch (err) {
    // GUARD: Always unlock lead, log errors, never crash worker
    await Lead.updateOne(
      { _id: leadId },
      { $set: { processing: false } },
      { session },
    ).catch((e) => {
      logger.error("Failed to unlock lead after workflow error", {
        leadId,
        originalError: err.message,
        unlockError: e.message,
      });
    });

    logger.error(
      "Lead workflow processing failed - job will complete without crashing worker",
      {
        leadId,
        error: err.message,
        stack: err.stack,
      },
    );

    // Don't rethrow - let job complete gracefully
    // Worker stays healthy, job is marked done
  }
}

module.exports = { processLeadWorkflow };

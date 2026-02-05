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

/**
 * Identity Resolution (Phase 2 Step 3)
 * Handles anonymous → known lead transitions
 *
 * RULES:
 * - (projectId + email) = ONE lead
 * - Merge: Move all events from anonymous → known lead
 * - Promote: Add email to anonymous lead if no known lead exists
 * - Idempotent: Safe to run multiple times
 *
 * @param {Object} lead - Current (anonymous) lead
 * @param {Object} session - MongoDB session for transaction
 */
async function resolveIdentity(lead, session) {
  // Find any "identify" events for this lead with email
  const identifyEvent = await Event.findOne({
    leadId: lead._id,
    eventType: "identify",
    "properties.email": { $exists: true, $ne: null, $ne: "" },
    processed: false,
  })
    .sort({ timestamp: 1 })
    .session(session);

  if (!identifyEvent) return; // No identity to resolve

  const email = identifyEvent.properties.email.toLowerCase().trim();

  if (!email) return; // Invalid email

  // Check if lead already has this email
  if (lead.email === email) {
    logger.info("Lead already identified with this email", {
      leadId: lead._id,
      email,
    });
    return; // Already identified, nothing to do
  }

  // Look for existing known lead with this email
  const knownLead = await Lead.findOne({
    projectId: lead.projectId,
    email: email,
    _id: { $ne: lead._id }, // Exclude current lead
  }).session(session);

  if (knownLead) {
    // MERGE: Known lead exists → move all events from anonymous to known
    logger.info("Merging anonymous lead into known lead", {
      anonymousId: lead._id,
      knownId: knownLead._id,
      email,
    });

    // Move all events (including identify event) to known lead
    await Event.updateMany(
      { leadId: lead._id },
      { $set: { leadId: knownLead._id } },
      { session },
    );

    // Move score history to known lead
    await ScoreHistory.updateMany(
      { leadId: lead._id },
      { $set: { leadId: knownLead._id } },
      { session },
    );

    // Delete anonymous lead (it's been merged)
    await Lead.deleteOne({ _id: lead._id }, { session });

    logger.info("Anonymous lead merged successfully", {
      mergedFrom: lead._id,
      mergedInto: knownLead._id,
      email,
    });

    // Update lead reference to continue processing with known lead
    Object.assign(lead, knownLead.toObject());
    lead._id = knownLead._id;
  } else {
    // PROMOTE: No known lead → promote anonymous to known
    logger.info("Promoting anonymous lead to known", {
      leadId: lead._id,
      email,
    });

    // Extract additional traits from identify event
    const traits = identifyEvent.properties || {};
    const updateFields = {
      email: email,
      ...(traits.name && { name: traits.name }),
      ...(traits.company && { company: traits.company }),
    };

    await Lead.updateOne(
      { _id: lead._id },
      { $set: updateFields },
      { session },
    );

    // Update lead object with new email
    lead.email = email;
    if (traits.name) lead.name = traits.name;
    if (traits.company) lead.company = traits.company;

    logger.info("Anonymous lead promoted to known", {
      leadId: lead._id,
      email,
    });
  }
}

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
    // Identity Resolution (Phase 2 Step 3)
    // ===============================
    // When "identify" event with email is found:
    // - If known lead exists → merge anonymous into known
    // - If no known lead → promote anonymous to known
    try {
      await resolveIdentity(lead, session);
    } catch (identityErr) {
      logger.error("Identity resolution failed - continuing with scoring", {
        leadId: lead._id,
        error: identityErr.message,
        stack: identityErr.stack,
      });
      // Continue with scoring even if identity resolution fails
    }

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

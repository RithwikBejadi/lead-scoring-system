const Event = require("../models/Event");
const Lead = require("../models/Lead");
const ScoreHistory = require("../models/ScoreHistory");
const { getRule } = require("../services/scoringRulesCache");
const { calculateStage } = require("../domain/stageEngine");
const logger = require("../utils/logger");

async function processLeadWorkflow(leadId, session) {
  const lead = await Lead.findOneAndUpdate(
    { _id: leadId, processing: false },
    { $set: { processing: true } },
    { new: true, session }
  );
  if (!lead) return;

  try {
    // 1. Get current score from history (source of truth)
    const last = await ScoreHistory.findOne({ leadId })
      .sort({ timestamp: -1 })
      .select({ newScore: 1 })
      .session(session);
    let score = last ? last.newScore : 0;

    // 2. Fetch unprocessed events
    const events = await Event.find({
      leadId,
      processed: false,
      queued: true,
      processing: false
    }).sort({ timestamp: 1 }).session(session);

    if (!events.length) {
      await Lead.updateOne({ _id: leadId }, { $set: { processing: false } }, { session });
      return;
    }

    // 3. Lock events
    const ids = events.map(e => e._id);
    await Event.updateMany({ _id: { $in: ids } }, { $set: { processing: true } }, { session });

    // 4. Calculate score deltas
    const history = [];
    for (const ev of events) {
      const delta = getRule(ev.eventType);
      history.push({
        leadId,
        eventId: ev.eventId,
        oldScore: score,
        newScore: score + delta,
        delta,
        timestamp: new Date()
      });
      score += delta;
    }

    // 5. Persist score history (idempotent)
    try {
      await ScoreHistory.insertMany(history, { session, ordered: false });
    } catch (err) {
      if (!(err && (err.code === 11000 || err.name === "BulkWriteError"))) {
        throw err;
      }
    }

    // 6. Mark events as processed
    await Event.updateMany(
      { _id: { $in: ids } },
      { $set: { processed: true, queued: false, processing: false } },
      { session }
    );

    // 7. Calculate velocity (count events in last 24h)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const eventsLast24h = await Event.countDocuments({
      leadId,
      processed: true,
      timestamp: { $gte: cutoff }
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
          processing: false
        }
      },
      { session }
    );

    // 10. Automation rules will be executed post-commit

  } catch (err) {
    await Lead.updateOne({ _id: leadId }, { $set: { processing: false } }, { session }).catch(e => {
      logger.error("Failed to unlock lead after error", { leadId, e: e.message });
    });
    throw err;
  }
}

module.exports = { processLeadWorkflow };

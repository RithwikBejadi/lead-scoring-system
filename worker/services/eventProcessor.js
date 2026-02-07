const Event = require("../models/Event");
const Lead = require("../models/Lead");
const ScoreHistory = require("../models/ScoreHistory");
const AutomationRule = require("../models/AutomationRule");
const { getRule } = require("./scoringRulesCache");
const { calculateLeadStage, calculateVelocity } = require("./leadIntelligence");
const logger = require("../utils/logger");

async function processLeadEvents(leadId, session) {
  const lead = await Lead.findOneAndUpdate(
    { _id: leadId, processing: false },
    { $set: { processing: true } },
    { new: true, session },
  );
  if (!lead) return;

  try {
    const last = await ScoreHistory.findOne({ leadId })
      .sort({ timestamp: -1 })
      .select({ newScore: 1 })
      .session(session);
    let score = last ? last.newScore : 0;

    const events = await Event.find({
      leadId,
      processed: false,
      queued: true,
      processing: false,
    })
      .sort({ timestamp: 1 })
      .session(session);

    if (!events.length) {
      await Lead.updateOne(
        { _id: leadId },
        { $set: { processing: false } },
        { session },
      );
      return;
    }

    const ids = events.map((e) => e._id);
    await Event.updateMany(
      { _id: { $in: ids } },
      { $set: { processing: true } },
      { session },
    );

    const history = [];

    for (const ev of events) {
      const delta = getRule(ev.eventType);
      history.push({
        leadId,
        eventId: ev.eventId,
        oldScore: score,
        newScore: score + delta,
        delta,
        timestamp: new Date(),
      });
      score += delta;
    }

    try {
      await ScoreHistory.insertMany(history, { session, ordered: false });
    } catch (err) {
      if (!(err && (err.code === 11000 || err.name === "BulkWriteError"))) {
        throw err;
      }
      logger.debug("Ignored duplicate-key during insertMany for ScoreHistory");
    }

    await Event.updateMany(
      { _id: { $in: ids } },
      { $set: { processed: true, queued: false, processing: false } },
      { session },
    );

    // Calculate velocity (events in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = await Event.countDocuments({
      leadId,
      timestamp: { $gte: oneDayAgo },
      processed: true,
    }).session(session);

    const velocityScore = calculateVelocity(recentEvents);
    const leadStage = calculateLeadStage(score);

    await Lead.updateOne(
      { _id: leadId },
      {
        $set: {
          currentScore: score,
          leadStage,
          velocityScore,
          eventsLast24h: recentEvents,
          lastEventAt: new Date(),
          processing: false,
        },
      },
      { session },
    );

    // Check automation rules
    await checkAutomationRules(leadId, leadStage, velocityScore, session);
  } catch (err) {
    await Lead.updateOne(
      { _id: leadId },
      { $set: { processing: false } },
      { session },
    ).catch((e) => {
      logger.error("Failed to unlock lead after error", {
        leadId,
        e: e.message,
      });
    });
    throw err;
  }
}

async function checkAutomationRules(leadId, leadStage, velocityScore, session) {
  const rules = await AutomationRule.find({
    whenStage: leadStage,
    active: true,
    minVelocity: { $lte: velocityScore },
  }).session(session);

  for (const rule of rules) {
    logger.info("Automation triggered", {
      leadId,
      rule: rule.name,
      action: rule.action,
      stage: leadStage,
      velocity: velocityScore,
    });
    // TODO: Implement actual automation actions (webhook, email, CRM integration)
  }
}

module.exports = { processLeadEvents };

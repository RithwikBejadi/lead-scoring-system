const Event = require("../models/Event");
const ScoreHistory = require("../models/ScoreHistory");
const { getScoringRules } = require("./scoringRulesCache");
const { acquireLock, releaseLock } = require("../utils/leadLock");

async function processLeadEvents(leadId, session) {
  const lead = await acquireLock(leadId, session);
  
  if (!lead) {
    console.log(`Lead locked or missing: ${leadId}`);
    return null;
  }

  const events = await Event.find({ leadId, processed: false })
    .sort({ timestamp: 1 })
    .session(session)
    .lean();

  if (!events.length) {
    console.log(`No unprocessed events for lead: ${leadId}`);
    await releaseLock(leadId, session, { currentScore: lead.currentScore });
    return null;
  }

  let currentScore = lead.currentScore || 0;
  const scoringRules = await getScoringRules();
  const scoreHistoryBatch = [];
  const eventIds = [];

  for (const ev of events) {
    const delta = scoringRules[ev.eventType] || 0;
    const oldScore = currentScore;
    currentScore += delta;

    scoreHistoryBatch.push({
      leadId,
      eventId: ev.eventId,
      oldScore,
      newScore: currentScore,
      delta,
      timestamp: new Date(),
    });

    eventIds.push(ev._id);
    console.log(`  ${ev.eventType} -> ${oldScore} + ${delta} = ${currentScore}`);
  }

  if (scoreHistoryBatch.length > 0) {
    await ScoreHistory.insertMany(scoreHistoryBatch, { session });
  }

  await Event.updateMany(
    { _id: { $in: eventIds } },
    { $set: { processed: true } },
    { session }
  );

  await releaseLock(leadId, session, { currentScore });

  console.log(`Processed ${events.length} events for lead ${leadId} | Final score: ${currentScore}`);
  
  return { eventsProcessed: events.length, finalScore: currentScore };
}

module.exports = { processLeadEvents };

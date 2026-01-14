const eventQueue = require("./queue");
const Lead = require("./models/Lead");
const Event = require("./models/Event");
const ScoreHistory = require("./models/ScoreHistory");
const ScoringRule = require("./models/ScoringRule");

console.log("Processor loaded and waiting for jobs...");

eventQueue.process(async (job) => {
  const { eventId } = job.data;
  console.log("JOB RECEIVED:", eventId);

  // lock only unprocessed event
  const event = await Event.findOne({ eventId, processed: false });
  if (!event) return;

  const lead = await Lead.findById(event.leadId);
  if (!lead) {
    console.log("ORPHAN EVENT:", eventId);
    await Event.updateOne({ _id: event._id }, { $set: { processed: true } });
    return;
  }

  const events = await Event.find({
    leadId: event.leadId,
    processed: false
  }).sort({ timestamp: 1 });

  for (const ev of events) {
    const rule = await ScoringRule.findOne({ eventType: ev.eventType });
    const delta = rule ? rule.points : 0;

    const oldScore = lead.currentScore;
    lead.currentScore += delta;

    await Lead.updateOne(
      { _id: lead._id },
      { $set: { currentScore: lead.currentScore } }
    );

    await ScoreHistory.create({
      leadId: lead._id,
      eventId: ev.eventId,
      oldScore,
      newScore: lead.currentScore,
      delta,
      timestamp: new Date()
    });

    await Event.updateOne({ _id: ev._id }, { $set: { processed: true } });

    console.log(`Processed ${ev.eventType} → +${delta}, score=${lead.currentScore}`);
  }
});

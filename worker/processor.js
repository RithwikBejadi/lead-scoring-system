const eventQueue = require("./queue");
const Lead = require("./models/Lead");
const Event = require("./models/Event");
const ScoreHistory = require("./models/ScoreHistory");

eventQueue.process(async (job) => {
  const { eventId } = job.data;

  const event = await Event.findOne({ eventId });
  if (!event || event.processed) return;

  const pendingEvents = await Event.find({
    leadId: event.leadId,
    processed: false
  }).sort({ timestamp: 1 });

  const lead = await Lead.findById(event.leadId);

  for (const ev of pendingEvents) {
    const oldScore = lead.currentScore;

    let delta = 10; //demo

    lead.currentScore += delta;
    await lead.save();

    await ScoreHistory.create({
      leadId: lead._id,
      eventId: ev.eventId,
      oldScore,
      newScore: lead.currentScore,
      delta,
      timestamp: new Date()
    });

    ev.processed = true;
    await ev.save();
  }
});

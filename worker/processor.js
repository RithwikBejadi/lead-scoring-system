const eventQueue = require("./queue");
const Lead = require("./models/Lead");
const Event = require("./models/Event");
const ScoreHistory = require("./models/ScoreHistory");
const ScoringRule = require("./models/ScoringRule");

console.log("Processor loaded and waiting for jobs...");

eventQueue.process(async (job) => {
  try {
    console.log("JOB RECEIVED:", job.data);

    const { eventId } = job.data;

    const event = await Event.findOne({ eventId });
    console.log("EVENT FOUND:", event);

    if (!event || event.processed) return;

    const pendingEvents = await Event.find({
      leadId: event.leadId,
      processed: false
    }).sort({ timestamp: 1 });

    console.log("PENDING EVENTS:", pendingEvents.length);

    const lead = await Lead.findById(event.leadId);
    console.log("PROCESSING LEAD:", lead.email);

    for (const ev of pendingEvents) {
      const oldScore = lead.currentScore;

      const rule = await ScoringRule.findOne({ eventType: ev.eventType });
      const delta = rule ? rule.points : 0;

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

      console.log(
        `Processed ${ev.eventType} (${ev.eventId}) → +${delta}, new score ${lead.currentScore}`
      );
    }
  } catch (err) {
    console.error("WORKER ERROR:", err);
    throw err;
  }
});

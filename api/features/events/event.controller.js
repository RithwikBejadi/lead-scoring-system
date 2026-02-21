const { ingestEvent } = require("./event.service");
const Event = require("../../models/Event");

async function createEvent(req, res, next) {
  try {
    const result = await ingestEvent(req.body);
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
}

async function getEvents(req, res, next) {
  try {
    const { limit = 100, eventType } = req.query;

    // Build query
    const query = { projectId: req.user.projectId };
    if (eventType) {
      query.eventType = eventType;
    }

    // Since we also want lead info, let's populate
    const events = await Event.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .populate("leadId", "email name company currentScore leadStage");

    res.json({
      success: true,
      data: events,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createEvent, getEvents };

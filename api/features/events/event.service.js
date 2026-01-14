const Event = require("../../models/Event");
const queue = require("../../config/queue");

exports.ingestEvent = async (payload) => {
  try {
    const event = await Event.create({ ...payload, processed: false });
    await queue.add({ eventId: event.eventId });
    return { status: "queued" };
  } catch (e) {
    if (e.code === 11000) return { status: "duplicate" };
    throw e;
  }
};

const queue = require("../../../../queue/eventQueue");
const Event = require("../../models/Event");

exports.ingestEvent = async (payload) => {
  try {
    const event = await Event.create({
      ...payload,
      processed: false
    });

    // 🔥 QUEUE PER LEAD — SINGLE JOB GUARANTEE
    await queue.add(
      { leadId: event.leadId },
      {
        jobId: `lead-${event.leadId}`,
        removeOnComplete: true,
        attempts: 3,
        backoff: 5000
      }
    );

    return { status: "queued" };

  } catch (e) {
    if (e.code === 11000) return { status: "duplicate" };
    throw e;
  }
};

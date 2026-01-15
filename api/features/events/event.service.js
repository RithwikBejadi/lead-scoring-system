const queue = require("../../../shared/queue");
const Event = require("../../models/Event");
const mongoose = require("mongoose");
const { validateEventPayload } = require("./event.validator");

class ValidationError extends Error {
  constructor(errors) {
    super("Validation failed");
    this.name = "ValidationError";
    this.errors = errors;
  }
}

class DuplicateEventError extends Error {
  constructor(eventId) {
    super(`Event ${eventId} already exists`);
    this.name = "DuplicateEventError";
  }
}

async function ingestEvent(payload) {
  const validation = validateEventPayload(payload);
  if (!validation.isValid) throw new ValidationError(validation.errors);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [event] = await Event.create([{
      ...payload,
      processed: false,
      queued: false,
      processing: false
    }], { session });

    await queue.add(
      { leadId: event.leadId.toString() },
      { jobId: `lead-${event.leadId}`, removeOnComplete: true, attempts: 5 }
    );

    await Event.updateOne(
      { _id: event._id },
      { $set: { queued: true } },
      { session }
    );

    await session.commitTransaction();
    return { status: "queued", eventId: event.eventId };

  } catch (err) {
    await session.abortTransaction();
    if (err.code === 11000) throw new DuplicateEventError(payload.eventId);
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = { ingestEvent, ValidationError, DuplicateEventError };

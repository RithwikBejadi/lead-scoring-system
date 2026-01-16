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

  try {
    // Try to use transactions if available (replica set)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [event] = await Event.create(
        [
          {
            ...payload,
            processed: false,
            queued: false,
            processing: false,
          },
        ],
        { session }
      );

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
      session.endSession();
      return { status: "queued", eventId: event.eventId };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err) {
    // If transactions are not supported (standalone MongoDB), use non-transactional approach
    if (err.code === 20 || err.codeName === "IllegalOperation") {
      console.log("[EventService] Falling back to non-transactional mode");

      const event = await Event.create({
        ...payload,
        processed: false,
        queued: false,
        processing: false,
      });

      await queue.add(
        { leadId: event.leadId.toString() },
        { jobId: `lead-${event.leadId}`, removeOnComplete: true, attempts: 5 }
      );

      await Event.updateOne({ _id: event._id }, { $set: { queued: true } });

      return { status: "queued", eventId: event.eventId };
    }

    if (err.code === 11000) throw new DuplicateEventError(payload.eventId);
    throw err;
  }
}

module.exports = { ingestEvent, ValidationError, DuplicateEventError };

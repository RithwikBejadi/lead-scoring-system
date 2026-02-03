const queue = require("../../../shared/queue");
const Event = require("../../models/Event");
const Lead = require("../../models/Lead");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

class ValidationError extends Error {
  constructor(errors) {
    super("Validation failed");
    this.name = "ValidationError";
    this.errors = errors;
  }
}

/**
 * Validate incoming event payload
 */
function validateIngestPayload(payload) {
  const errors = [];

  if (!payload.projectId || typeof payload.projectId !== "string") {
    errors.push("projectId is required and must be a string");
  }

  if (!payload.event || typeof payload.event !== "string") {
    errors.push("event is required and must be a string");
  }

  if (!payload.anonymousId || typeof payload.anonymousId !== "string") {
    errors.push("anonymousId is required and must be a string");
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Core ingestion endpoint - auto-creates leads and queues events
 */
async function ingestEvent(payload) {
  const validation = validateIngestPayload(payload);
  if (!validation.isValid) throw new ValidationError(validation.errors);

  const { projectId, event, anonymousId, properties = {} } = payload;
  const eventId = uuidv4();

  try {
    // Step 1: Auto-create lead if not exists (upsert pattern)
    const lead = await Lead.findOneAndUpdate(
      { projectId, anonymousId },
      {
        $setOnInsert: {
          projectId,
          anonymousId,
          currentScore: 0,
          leadStage: "cold",
          status: "cold",
          eventsLast24h: 0,
          velocityScore: 0,
          processing: false,
        },
      },
      { upsert: true, new: true },
    );

    // Step 2: Create event (idempotency via unique index on projectId + eventId)
    try {
      await Event.create({
        eventId,
        projectId,
        anonymousId,
        eventType: event,
        properties,
        leadId: lead._id,
        timestamp: new Date(),
        processed: false,
        queued: false,
        processing: false,
      });
    } catch (err) {
      // Duplicate event - idempotency, silently ignore
      if (err.code === 11000) {
        return { status: "duplicate", eventId };
      }
      throw err;
    }

    // Step 3: Push to queue
    await queue.add(
      { leadId: lead._id.toString() },
      { jobId: `lead-${lead._id}`, removeOnComplete: true, attempts: 5 },
    );

    // Step 4: Mark event as queued
    await Event.updateOne({ eventId }, { $set: { queued: true } });

    return { status: "queued", eventId };
  } catch (err) {
    if (err instanceof ValidationError) throw err;

    // Log but don't crash
    console.error("[IngestService] Error ingesting event:", err.message);
    throw err;
  }
}

module.exports = { ingestEvent, ValidationError };

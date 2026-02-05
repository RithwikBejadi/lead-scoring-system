const { v4: uuidv4 } = require("uuid");
const Project = require("../projects/project.model");
const Lead = require("../../models/Lead");
const Event = require("../../models/Event");
const queue = require("../../../shared/queue");

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
  }
}

/**
 * Validate incoming event payload
 */
function validatePayload(payload) {
  const errors = [];

  if (!payload.apiKey || typeof payload.apiKey !== "string") {
    errors.push("apiKey is required");
  }

  if (!payload.event || typeof payload.event !== "string") {
    errors.push("event is required");
  }

  if (!payload.anonymousId || typeof payload.anonymousId !== "string") {
    errors.push("anonymousId is required");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }
}

/**
 * Core public ingestion endpoint
 *
 * Flow:
 * 1. Validate API key → find project
 * 2. Auto-create lead if missing
 * 3. Create event
 * 4. Queue for scoring
 * 5. Return 202 immediately
 */
async function ingestEvent(payload) {
  // Step 1: Validate payload
  validatePayload(payload);

  const { apiKey, event, anonymousId, properties = {}, sessionId } = payload;

  // Step 2: Validate API key and get project
  const project = await Project.findOne({ apiKey });

  if (!project) {
    throw new UnauthorizedError("Invalid API key");
  }

  if (!project.active) {
    throw new UnauthorizedError("Project is not active");
  }

  // Step 3: Auto-create lead if doesn't exist (upsert)
  const lead = await Lead.findOneAndUpdate(
    {
      projectId: project._id,
      anonymousId,
    },
    {
      $setOnInsert: {
        projectId: project._id,
        anonymousId,
        currentScore: 0,
        leadStage: "cold",
        status: "cold",
        eventsLast24h: 0,
        velocityScore: 0,
        processing: false,
      },
    },
    {
      upsert: true,
      new: true,
    },
  );

  // Step 4: Create event with unique ID and sessionId
  const eventId = uuidv4();
  const finalSessionId = sessionId || uuidv4(); // Generate per request if not provided

  try {
    await Event.create({
      eventId,
      projectId: project._id,
      anonymousId,
      sessionId: finalSessionId,
      eventType: event,
      properties,
      leadId: lead._id,
      timestamp: new Date(),
      processed: false,
      queued: false,
      processing: false,
    });
  } catch (err) {
    // Duplicate event - idempotency, silently return
    if (err.code === 11000) {
      return { status: "duplicate", eventId };
    }
    throw err;
  }

  // Step 5: Queue for processing
  await queue.add(
    { leadId: lead._id.toString() },
    {
      jobId: `lead-${lead._id}`,
      removeOnComplete: true,
      attempts: 5,
    },
  );

  // Step 6: Mark as queued
  await Event.updateOne({ eventId }, { $set: { queued: true } });

  // Step 7: Return immediately (202 Accepted)
  return { status: "queued" };
}

module.exports = {
  ingestEvent,
  ValidationError,
  UnauthorizedError,
};

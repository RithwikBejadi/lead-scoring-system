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
  const start = Date.now();
  // Step 1: Validate payload
  try {
    validatePayload(payload);
  } catch (err) {
    console.warn(`[API] Validation Failed: ${err.message}`);
    throw err;
  }

  const { apiKey, event, anonymousId, properties = {}, sessionId } = payload;

  // Step 2: Validate API key and get project
  let project;
  try {
    project = await Project.findOne({ apiKey });
  } catch (dbErr) {
    console.error(`[API] MongoDB Error during auth: ${dbErr.message}`);
    throw dbErr;
  }

  if (!project) {
    console.warn(`[API] Auth Failed - Invalid API Key: ${apiKey}`);
    throw new UnauthorizedError("Invalid API key");
  }

  if (!project.active) {
    console.warn(`[API] Auth Failed - Project Inactive: ${apiKey}`);
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
      console.warn(`[API] Idempotency Skip - Duplicate Event ID: ${eventId}`);
      return { status: "duplicate", eventId };
    }
    console.error(`[API] MongoDB Error during event creation: ${err.message}`);
    throw err;
  }

  // Step 5: Queue for processing
  try {
    await queue.add(
      { leadId: lead._id.toString() },
      {
        jobId: `lead-${lead._id}`,
        removeOnComplete: true,
        attempts: 5,
      },
    );
  } catch (queueErr) {
    console.error(`[API] Redis/Queue Error: ${queueErr.message}`);
    // Even if queue fails, we saved the event.
    // We might want to return 500 or 202 with warning.
    // For now, rethrow to indicate internal failure to client (or handle gracefully)
    throw queueErr;
  }

  // Step 6: Mark as queued
  await Event.updateOne({ eventId }, { $set: { queued: true } });

  console.log(
    `[API] Ingest Success - Event:${event} Lead:${lead._id} in ${Date.now() - start}ms`,
  );

  // Step 7: Return immediately (202 Accepted)
  return { status: "queued" };
}

module.exports = {
  ingestEvent,
  ValidationError,
  UnauthorizedError,
};

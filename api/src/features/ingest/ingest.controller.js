const { ingestEvent } = require("./ingest.service");
const { validateEventPayload, sanitizeProperties } = require("./ingest.schema");

/**
 * POST /api/ingest/event
 * Public ingestion endpoint - API key authenticated
 * Returns 202 Accepted or 400 for invalid input
 */
async function handleIngestEvent(req, res, next) {
  try {
    // Validate payload
    const validation = validateEventPayload(req.body);

    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    // Sanitize properties (limit depth, size)
    if (validation.data.properties) {
      validation.data.properties = sanitizeProperties(
        validation.data.properties,
      );
    }

    const result = await ingestEvent(validation.data);

    // Emit real-time socket event to all connected clients
    try {
      const io = req.app.get("io");
      if (io) {
        const payload = {
          eventType: validation.data.event,
          anonymousId: validation.data.anonymousId,
          sessionId: validation.data.sessionId || null,
          properties: validation.data.properties || {},
          timestamp: new Date().toISOString(),
          status: result.status,
        };
        io.emit("newEvent", payload);
        io.emit("scoreMutation", {
          anonymousId: validation.data.anonymousId,
          eventType: validation.data.event,
          timestamp: payload.timestamp,
        });
      }
    } catch (emitErr) {
      // Non-fatal — socket emit failure should not break ingestion
      console.warn("[Socket.IO] Failed to emit newEvent:", emitErr.message);
    }

    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { handleIngestEvent };

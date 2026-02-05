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
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { handleIngestEvent };

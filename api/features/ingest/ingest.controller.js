const { ingestEvent } = require("./ingest.service");

/**
 * POST /api/ingest/event
 * Public ingestion endpoint - API key authenticated
 * Always returns 202 Accepted
 */
async function handleIngestEvent(req, res, next) {
  try {
    const result = await ingestEvent(req.body);
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { handleIngestEvent };

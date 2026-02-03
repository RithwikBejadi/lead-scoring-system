const { ingestEvent } = require("./ingest.service");

/**
 * Controller for POST /api/ingest/event
 * Always returns 202 Accepted - never blocks on scoring
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

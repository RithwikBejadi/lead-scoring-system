const { ingestEvent } = require("./ingest.service");

/**
 * Controller for POST /api/ingest/event
 * Always returns 202 Accepted - never blocks on scoring
 */
async function handleIngestEvent(req, res, next) {
  try {
    // Inject projectId if authenticated via dashboard
    if (req.user && req.user.projectId) {
      req.body.projectId = req.user.projectId.toString();
    }
    const result = await ingestEvent(req.body);
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { handleIngestEvent };

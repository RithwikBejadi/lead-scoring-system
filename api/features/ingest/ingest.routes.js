const express = require("express");
const router = express.Router();
const { handleIngestEvent } = require("./ingest.controller");
const { ingestRateLimiter } = require("../../middleware/rateLimiter");

// POST /api/ingest/event - Public ingestion endpoint with rate limiting
router.post("/event", ingestRateLimiter, handleIngestEvent);

module.exports = router;

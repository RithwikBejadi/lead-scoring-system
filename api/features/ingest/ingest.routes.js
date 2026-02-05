const express = require("express");
const router = express.Router();
const { handleIngestEvent } = require("./ingest.controller");

// POST /api/ingest/event - Public ingestion endpoint
router.post("/event", handleIngestEvent);

module.exports = router;

/**
 * FILE: api/features/events/event.routes.js
 * PURPOSE: HTTP routes for event submission (single + batch)
 */

const router = require("express").Router();
const multer = require("multer");
const { createEvent, getEvents } = require("./event.controller");
const { batchUploadEvents } = require("./batch.controller");
const { handleIngestEvent } = require("./ingest.controller");

// Configure multer for memory storage (files stay in memory as buffers)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// GET /api/events - Fetch recent events for the dashboard
router.get("/", getEvents);

// POST /api/events/ingest - NEW ingestion endpoint (auto-creates leads)
router.post("/ingest", handleIngestEvent);

// ⚠️ DEPRECATED - Frontend must NOT use this endpoint
// POST /api/events - Single event submission (internal/legacy only)
router.post("/", createEvent);

// POST /api/events/batch - Batch upload via CSV/JSON file
router.post("/batch", upload.single("file"), batchUploadEvents);

module.exports = router;

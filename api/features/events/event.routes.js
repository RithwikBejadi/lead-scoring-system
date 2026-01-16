/**
 * FILE: api/features/events/event.routes.js
 * PURPOSE: HTTP routes for event submission (single + batch)
 */

const router = require("express").Router();
const multer = require("multer");
const { createEvent } = require("./event.controller");
const { batchUploadEvents } = require("./batch.controller");

// Configure multer for memory storage (files stay in memory as buffers)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// POST /api/events - Single event submission
router.post("/", createEvent);

// POST /api/events/batch - Batch upload via CSV/JSON file
router.post("/batch", upload.single("file"), batchUploadEvents);

module.exports = router;

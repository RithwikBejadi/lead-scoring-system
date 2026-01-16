/**
 * FILE: api/features/events/batch.controller.js
 * PURPOSE: Handle batch event uploads via CSV/JSON files
 * PATTERN: Parse file, validate events, queue all for processing
 */

const {
  ingestEvent,
  ValidationError,
  DuplicateEventError,
} = require("./event.service");
const Lead = require("../../models/Lead");

/**
 * Parse CSV content into event objects
 * Expected columns: eventType, leadId, leadEmail, timestamp, metadata
 */
function parseCSV(content) {
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const events = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split(",")
      .map((v) => v.trim().replace(/^"|"$/g, ""));
    const event = {};

    headers.forEach((header, idx) => {
      const value = values[idx];
      if (header === "eventtype" || header === "event_type")
        event.eventType = value;
      else if (header === "leadid" || header === "lead_id")
        event.leadId = value;
      else if (
        header === "leademail" ||
        header === "lead_email" ||
        header === "email"
      )
        event.leadEmail = value;
      else if (header === "timestamp")
        event.timestamp = value ? new Date(value) : new Date();
      else if (header === "metadata")
        event.metadata = value ? JSON.parse(value) : {};
    });

    // Generate unique eventId
    event.eventId = `batch-${Date.now()}-${i}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    events.push(event);
  }

  return events;
}

/**
 * POST /api/events/batch
 * Upload CSV or JSON file with multiple events
 */
async function batchUploadEvents(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const content = req.file.buffer.toString("utf-8");
  const filename = req.file.originalname.toLowerCase();

  let events = [];

  try {
    // Parse based on file type
    if (filename.endsWith(".json")) {
      const parsed = JSON.parse(content);
      events = Array.isArray(parsed) ? parsed : [parsed];
      events = events.map((e, i) => ({
        ...e,
        eventId:
          e.eventId ||
          `batch-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      }));
    } else if (filename.endsWith(".csv")) {
      events = parseCSV(content);
    } else {
      return res
        .status(400)
        .json({ error: "Unsupported file type. Use .csv or .json" });
    }
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Failed to parse file", details: err.message });
  }

  if (events.length === 0) {
    return res.status(400).json({ error: "No events found in file" });
  }

  // Process each event
  const results = {
    total: events.length,
    queued: 0,
    duplicates: 0,
    errors: [],
  };

  for (const event of events) {
    try {
      // Resolve leadId from email if needed
      if (!event.leadId && event.leadEmail) {
        let lead = await Lead.findOne({ email: event.leadEmail });
        if (!lead) {
          lead = await Lead.create({
            email: event.leadEmail,
            name: event.leadEmail.split("@")[0],
            company: "",
            currentScore: 0,
          });
        }
        event.leadId = lead._id.toString();
      }

      if (!event.leadId) {
        results.errors.push({
          eventId: event.eventId,
          error: "No leadId or leadEmail",
        });
        continue;
      }

      // Ensure timestamp is set (required by validator)
      if (!event.timestamp) {
        event.timestamp = new Date();
      }

      await ingestEvent(event);
      results.queued++;
    } catch (err) {
      if (err instanceof DuplicateEventError) {
        results.duplicates++;
      } else if (err instanceof ValidationError) {
        results.errors.push({ eventId: event.eventId, error: err.errors });
      } else {
        results.errors.push({ eventId: event.eventId, error: err.message });
      }
    }
  }

  res.status(202).json({
    status: "completed",
    ...results,
    message: `${results.queued} events queued, ${results.duplicates} duplicates skipped`,
  });
}

module.exports = { batchUploadEvents, parseCSV };

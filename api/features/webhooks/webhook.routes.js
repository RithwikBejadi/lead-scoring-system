/**
 * FILE: api/features/webhooks/webhook.routes.js
 * PURPOSE: Handle webhook events from external services
 * PATTERN: Accept events, validate signature (optional), queue for processing
 */

const router = require("express").Router();
const {
  ingestEvent,
  ValidationError,
  DuplicateEventError,
} = require("../events/event.service");
const crypto = require("crypto");

// Optional: Verify webhook signature from trusted sources
function verifySignature(req, res, next) {
  const signature = req.headers["x-webhook-signature"];
  const secret = process.env.WEBHOOK_SECRET;

  // Skip verification if no secret configured
  if (!secret) return next();

  // Skip if no signature provided
  if (!signature) {
    return res.status(401).json({ error: "Missing webhook signature" });
  }

  // Verify HMAC signature
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== `sha256=${expectedSig}`) {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  next();
}

/**
 * POST /api/webhooks/events
 * Accept events from external services (e.g., CRM, marketing tools)
 *
 * Body format:
 * {
 *   "event_type": "page_view",
 *   "lead_email": "user@example.com",
 *   "lead_id": "...", // optional if email provided
 *   "timestamp": "2024-01-01T00:00:00Z",
 *   "metadata": { ... }
 * }
 */
router.post("/events", verifySignature, async (req, res) => {
  try {
    const {
      event_type,
      eventType,
      lead_id,
      leadId,
      lead_email,
      email,
      timestamp,
      metadata,
    } = req.body;

    // Normalize field names (snake_case to camelCase)
    const normalizedPayload = {
      eventType: event_type || eventType,
      leadId: lead_id || leadId,
      leadEmail: lead_email || email,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      metadata: metadata || {},
      eventId:
        req.body.eventId ||
        `wh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    // Must have either leadId or email
    if (!normalizedPayload.leadId && !normalizedPayload.leadEmail) {
      return res.status(400).json({
        error: "Either lead_id or lead_email is required",
      });
    }

    // If no leadId, try to find by email or create new lead
    if (!normalizedPayload.leadId && normalizedPayload.leadEmail) {
      const Lead = require("../../models/Lead");
      let lead = await Lead.findOne({ email: normalizedPayload.leadEmail });

      if (!lead) {
        // Auto-create lead from webhook
        lead = await Lead.create({
          email: normalizedPayload.leadEmail,
          name: normalizedPayload.leadEmail.split("@")[0],
          company: "",
          currentScore: 0,
        });
      }
      normalizedPayload.leadId = lead._id.toString();
    }

    const result = await ingestEvent(normalizedPayload);
    res.status(202).json({
      status: "accepted",
      eventId: result.eventId,
      message: "Event queued for processing",
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: err.errors });
    }
    if (err instanceof DuplicateEventError) {
      return res
        .status(200)
        .json({ status: "duplicate", message: err.message });
    }
    console.error("[Webhook] Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

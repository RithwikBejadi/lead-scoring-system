const mongoose = require("mongoose");

function validateEventPayload(payload) {
  const errors = [];

  if (!payload.eventId || typeof payload.eventId !== "string") {
    errors.push("eventId is required and must be a string");
  }

  if (!payload.leadId) {
    errors.push("leadId is required");
  } else if (!mongoose.Types.ObjectId.isValid(payload.leadId)) {
    errors.push("leadId must be a valid ObjectId");
  }

  if (!payload.eventType || typeof payload.eventType !== "string") {
    errors.push("eventType is required and must be a string");
  }

  if (!payload.timestamp) {
    errors.push("timestamp is required");
  } else if (isNaN(new Date(payload.timestamp).getTime())) {
    errors.push("timestamp must be a valid date");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = { validateEventPayload };
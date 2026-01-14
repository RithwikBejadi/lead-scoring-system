const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  eventId: { type: String, unique: true },
  leadId: mongoose.Schema.Types.ObjectId,
  eventType: String,
  timestamp: Date,
  metadata: Object,
  processed: Boolean
});

module.exports = mongoose.model("Event", EventSchema);

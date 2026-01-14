const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  eventId: { type: String, unique: true, index: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
  eventType: { type: String, required: true },
  timestamp: { type: Date, required: true },
  metadata: Object,
  processed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);

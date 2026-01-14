const mongoose = require("mongoose");

module.exports = mongoose.model("Event", new mongoose.Schema({
  eventId: { type: String, unique: true },
  leadId: mongoose.Types.ObjectId,
  eventType: String,
  timestamp: Date,
  processed: { type: Boolean, default: false }
}));

const mongoose = require("mongoose");

module.exports = mongoose.model("ScoreHistory", new mongoose.Schema({
  leadId: mongoose.Schema.Types.ObjectId,
  eventId: String,
  oldScore: Number,
  newScore: Number,
  delta: Number,
  timestamp: Date
}));

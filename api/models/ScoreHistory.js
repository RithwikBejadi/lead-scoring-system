const mongoose = require("mongoose");

const ScoreHistorySchema = new mongoose.Schema({
  leadId: mongoose.Schema.Types.ObjectId,
  eventId: String,
  oldScore: Number,
  newScore: Number,
  delta: Number,
  timestamp: Date
});

module.exports = mongoose.model("ScoreHistory", ScoreHistorySchema);

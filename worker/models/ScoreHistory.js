const mongoose = require("mongoose");

const ScoreHistorySchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Lead",
    index: true
  },
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  oldScore: {
    type: Number,
    required: true,
    min: 0
  },
  newScore: {
    type: Number,
    required: true,
    min: 0
  },
  delta: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

ScoreHistorySchema.index({ leadId: 1, timestamp: -1 });
ScoreHistorySchema.index({ leadId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("ScoreHistory", ScoreHistorySchema);

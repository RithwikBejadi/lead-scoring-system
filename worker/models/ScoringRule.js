const mongoose = require("mongoose");

const ScoringRuleSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  points: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("ScoringRule", ScoringRuleSchema);

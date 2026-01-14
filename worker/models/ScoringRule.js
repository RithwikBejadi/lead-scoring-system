const mongoose = require("mongoose");

const ScoringRuleSchema = new mongoose.Schema({
  eventType: { type: String, unique: true },
  points: { type: Number, required: true }
});

module.exports = mongoose.model("ScoringRule", ScoringRuleSchema);

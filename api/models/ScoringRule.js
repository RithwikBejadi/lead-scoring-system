const mongoose = require("mongoose");

/**
 * ScoringRule Schema
 * Stores configurable scoring rules for different event types
 * Rules are applied when events are processed to calculate lead scores
 */
const ScoringRuleSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to get points for an event type
ScoringRuleSchema.statics.getPointsForEvent = async function (eventType) {
  const rule = await this.findOne({ eventType, active: true });
  return rule ? rule.points : 0;
};

// Static method to get all active rules
ScoringRuleSchema.statics.getActiveRules = function () {
  return this.find({ active: true });
};

module.exports = mongoose.model("ScoringRule", ScoringRuleSchema);

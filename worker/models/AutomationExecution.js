const mongoose = require("mongoose");

const automationExecutionSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Lead",
      index: true,
    },
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "AutomationRule",
    },
    dateBucket: { type: String, required: true },
    executedAt: { type: Date, default: Date.now },
    payload: { type: mongoose.Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["pending", "executed", "failed"],
      default: "executed",
    },
  },
  { timestamps: true },
);

automationExecutionSchema.index(
  { leadId: 1, ruleId: 1, dateBucket: 1 },
  { unique: true },
);

module.exports = mongoose.model(
  "AutomationExecution",
  automationExecutionSchema,
);

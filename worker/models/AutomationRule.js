const mongoose = require("mongoose");

const AutomationRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  whenStage: {
    type: String,
    enum: ["cold", "warm", "hot", "qualified"],
    required: true,
    index: true
  },
  minVelocity: {
    type: Number,
    default: 0
  },
  action: {
    type: String,
    enum: ["notify_sales", "create_crm_task", "send_email", "assign_rep"],
    required: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

AutomationRuleSchema.index({ whenStage: 1, active: 1 });

module.exports = mongoose.model("AutomationRule", AutomationRuleSchema);

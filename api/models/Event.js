const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  processed: {
    type: Boolean,
    default: false,
    index: true
  },
  queued: {
    type: Boolean,
    default: false
  },
  processing: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

EventSchema.index({ leadId: 1, processed: 1 });
EventSchema.index({ leadId: 1, timestamp: -1 });
EventSchema.index({ leadId: 1, processed: 1, queued: 1 });
EventSchema.index({ leadId: 1, processing: 1, processed: 1 });

module.exports = mongoose.model("Event", EventSchema);

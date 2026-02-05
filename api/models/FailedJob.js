const mongoose = require("mongoose");

/**
 * Failed Job Model
 * Stores jobs that failed after all retry attempts
 * Dead Letter Queue for debugging and recovery
 */
const FailedJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      index: true,
    },
    jobData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    error: {
      type: String,
      required: true,
    },
    errorStack: String,
    attempts: {
      type: Number,
      default: 0,
    },
    failedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    queueName: {
      type: String,
      default: "events",
    },
  },
  {
    timestamps: true,
  },
);

// Index for querying failed jobs
FailedJobSchema.index({ failedAt: -1 });
FailedJobSchema.index({ queueName: 1, failedAt: -1 });

module.exports = mongoose.model("FailedJob", FailedJobSchema);

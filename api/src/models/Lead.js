const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    // Anonymous tracking (required for all leads)
    anonymousId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    // User info (optional - only filled when identified)
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true, // Allow multiple nulls but unique non-nulls
    },
    company: {
      type: String,
      trim: true,
    },
    currentScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    leadStage: {
      type: String,
      enum: ["cold", "warm", "hot", "qualified"],
      default: "cold",
      index: true,
    },
    status: {
      type: String,
      enum: ["cold", "warm", "hot", "qualified"],
      default: "cold",
    },
    lastEventAt: {
      type: Date,
      index: true,
    },
    eventsLast24h: {
      type: Number,
      default: 0,
    },
    velocityScore: {
      type: Number,
      default: 0,
    },
    processing: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

LeadSchema.index({ currentScore: -1 });
LeadSchema.index({ projectId: 1, anonymousId: 1 }, { unique: true }); // Compound unique index
LeadSchema.index(
  { projectId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $type: "string" } }, // Only index string emails, ignore null/missing
  },
);

module.exports = mongoose.model("Lead", LeadSchema);

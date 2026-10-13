const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
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

module.exports = mongoose.model("Lead", LeadSchema);

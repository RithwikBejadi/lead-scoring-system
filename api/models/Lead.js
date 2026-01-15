const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  company: {
    type: String,
    trim: true
  },
  currentScore: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ["cold", "warm", "hot", "qualified"],
    default: "cold"
  },
  processing: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

LeadSchema.index({ currentScore: -1 });

module.exports = mongoose.model("Lead", LeadSchema);

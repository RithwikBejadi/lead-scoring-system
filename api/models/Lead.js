const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  name: String,
  email: String,
  company: String,
  currentScore: Number,
  status: String,
  processing: { type: Boolean, default: false, index: true }
});

module.exports = mongoose.model("Lead", LeadSchema);

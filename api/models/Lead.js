const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  name: String,
  email: String,
  company: String,
  currentScore: Number,
  status: String
});

module.exports = mongoose.model("Lead", LeadSchema);

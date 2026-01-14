const mongoose = require("mongoose");

module.exports = mongoose.model("Lead", new mongoose.Schema({
  name: String,
  email: String,
  company: String,
  currentScore: Number,
  status: String
}));

const mongoose = require("mongoose");

module.exports = mongoose.model("ScoringRule", new mongoose.Schema({
  eventType: String,
  points: Number
}));

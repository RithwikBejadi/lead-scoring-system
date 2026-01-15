require("dotenv").config();
const mongoose = require("mongoose");
require("./processor");

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB connected");
  console.log("Worker started...");
});

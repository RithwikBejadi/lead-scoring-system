require("dotenv").config();
const mongoose = require("mongoose");
const eventQueue = require("./queue");
require("./processor");

async function start() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  console.log("Worker started...");
}

start();

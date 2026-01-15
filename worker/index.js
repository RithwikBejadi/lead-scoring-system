require("dotenv").config();
const mongoose = require("mongoose");
const eventQueue = require("../shared/queue");
const { processLeadEvents } = require("./services/eventProcessor");
const { startRecoveryLoop } = require("./utils/recoverLocks");
const { waitForRules } = require("./services/scoringRulesCache");
const waitForMongoPrimary = require("./utils/waitForMongoPrimary");
const config = require("./config");

async function connectMongo() {
  while (true) {
    try {
      await mongoose.connect(process.env.MONGO_URI, config.mongodb.options);
      break;
    } catch (err) {
      console.error("Mongo connect failed, retrying in 3s...", err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

connectMongo()
  .then(async () => {
    await waitForMongoPrimary();
    console.log("Worker MongoDB connected & primary ready");
    await waitForRules();
    console.log("Scoring rules loaded - ready to process events");
    startRecoveryLoop();
  })
  .catch(err => {
    console.error("Worker startup failed", err);
    process.exit(1);
  });

eventQueue.process(config.worker.concurrency, async job => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await processLeadEvents(job.data.leadId, session);
    }, { maxCommitTimeMS: config.worker.maxJobTime });
  } finally {
    await session.endSession();
  }
});


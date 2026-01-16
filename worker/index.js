/**
 * FILE: worker/index.js
 * PURPOSE: Background worker for asynchronous event processing
 * PATTERN: Queue consumer - processes events from Redis queue
 * 
 * RESPONSIBILITIES:
 * - Consume events from queue
 * - Recalculate lead scores atomically
 * - Execute automation rules
 * - Ensure idempotency via transaction
 * 
 * RELATED:
 * - ../shared/queue (event source)
 * - workflows/processLeadWorkflow.js (business logic)
 * - domain/automationEngine.js (automation triggers)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const eventQueue = require("../shared/queue");
const { processLeadWorkflow } = require("./workflows/processLeadWorkflow");
const { executeAutomationsForLead } = require("./domain/automationEngine");
const { startRecoveryLoop } = require("./utils/recoverLocks");
const { waitForRules } = require("./services/scoringRulesCache");
const { initAutomationRules } = require("./domain/automationEngine");
const config = require("./config");

// ===============================
// MongoDB Connection with Retry
// ===============================
async function connectMongo() {
  while (true) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10
      });
      break;
    } catch (err) {
      console.error("Mongo connect failed, retrying in 3s...", err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

connectMongo()
  .then(async () => {
    console.log("Worker MongoDB connected");
    await waitForRules();
    console.log("Scoring rules loaded - ready to process events");
    await initAutomationRules();
    console.log("Automation rules loaded");
    startRecoveryLoop();
  })
  .catch(err => {
    console.error("Worker startup failed", err);
    process.exit(1);
  });

// ===============================
// Event Processing (ASYNC / WORKER)
// ===============================
eventQueue.process(config.worker.concurrency, async job => {
  const session = await mongoose.startSession();
  try {
    // Transaction ensures atomic score updates
    await session.withTransaction(async () => {
      await processLeadWorkflow(job.data.leadId, session);
    }, { maxCommitTimeMS: config.worker.maxJobTime });
  } finally {
    await session.endSession();
  }

  // Execute automations post-commit (email, webhooks, etc.)
  await executeAutomationsForLead(job.data.leadId);
});


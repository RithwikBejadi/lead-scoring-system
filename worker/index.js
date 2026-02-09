require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const eventQueue = require("../shared/queue");
const { processLeadWorkflow } = require("./workflows/processLeadWorkflow");
const { executeAutomationsForLead } = require("./domain/automationEngine");
const { startRecoveryLoop } = require("./utils/recoverLocks");
const { waitForRules } = require("./services/scoringRulesCache");
const { initAutomationRules } = require("./domain/automationEngine");
const config = require("./config");

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "worker",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.listen(PORT, () => {
  console.log(`Worker health endpoint listening on port ${PORT}`);
});

async function connectMongo() {
  while (true) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });
      break;
    } catch (err) {
      console.error("Mongo connect failed, retrying in 3s...", err.message);
      await new Promise((r) => setTimeout(r, 3000));
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
  .catch((err) => {
    console.error("Worker startup failed", err);
    process.exit(1);
  });

eventQueue.process(config.worker.concurrency, async (job) => {
  let session = null;

  try {
    session = await mongoose.startSession();

    await session.withTransaction(
      async () => {
        await processLeadWorkflow(job.data.leadId, session);
      },
      { maxCommitTimeMS: config.worker.maxJobTime },
    );
  } catch (err) {
    if (
      err.message &&
      err.message.includes("Transaction numbers are only allowed")
    ) {
      console.log("Running without transactions (standalone MongoDB)");
      await processLeadWorkflow(job.data.leadId, null);
    } else {
      throw err;
    }
  } finally {
    if (session) {
      await session.endSession();
    }
  }

  await executeAutomationsForLead(job.data.leadId);
});

const FailedJob = require("./models/FailedJob");

eventQueue.on("failed", async (job, err) => {
  console.error(
    `Job ${job.id} failed after ${job.attemptsMade} attempts:`,
    err.message,
  );

  if (job.attemptsMade >= 3) {
    try {
      await FailedJob.create({
        jobId: job.id.toString(),
        jobData: job.data,
        error: err.message,
        errorStack: err.stack,
        attempts: job.attemptsMade,
        failedAt: new Date(),
        queueName: "events",
      });
      console.log(`Job ${job.id} saved to dead letter queue`);
    } catch (dlqErr) {
      console.error("Failed to save job to dead letter queue:", dlqErr);
    }
  }
});

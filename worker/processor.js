const eventQueue = require("../queue/eventQueue");
const mongoose = require("mongoose");
const { processLeadEvents } = require("./services/eventProcessor");
const { releaseLock } = require("./utils/leadLock");

console.log("Processor loaded and waiting for jobs...");

eventQueue.process(async (job) => {
  const { leadId } = job.data;
  const session = await mongoose.startSession();

  try {
    console.log(`Processing lead: ${leadId}`);

    await session.withTransaction(async () => {
      await processLeadEvents(leadId, session);
    });

  } catch (error) {
    console.error(`Error processing lead ${leadId}:`, error.message);

    await session.withTransaction(async () => {
      await releaseLock(leadId, session);
    });

    if (job.attemptsMade < 3) throw error;

  } finally {
    await session.endSession();
  }
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing queue gracefully...");
  await eventQueue.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing queue gracefully...");
  await eventQueue.close();
  process.exit(0);
});

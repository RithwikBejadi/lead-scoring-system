const Queue = require("bull");

const eventQueue = new Queue("lead-processing", {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  },

  limiter: {
    max: 200,
    duration: 1000
  },

  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: true,
    removeOnFail: false,
    timeout: 60000
  },

  settings: {
    stalledInterval: 30000,
    maxStalledCount: 2,
    lockDuration: 30000
  }
});

// ─── Observability Hooks ────────────────────────────────

eventQueue.on("ready", () => {
  console.log("Redis queue ready");
});

eventQueue.on("stalled", job => {
  console.error(`Job stalled: ${job.id}`);
});

eventQueue.on("failed", (job, err) => {
  console.error(`Job failed ${job.id}`, err.message);
});

eventQueue.on("completed", job => {
  console.log(`Job completed: ${job.id}`);
});

eventQueue.on("error", err => {
  console.error("Queue error:", err);
});

module.exports = eventQueue;

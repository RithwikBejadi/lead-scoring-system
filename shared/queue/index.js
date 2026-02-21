const Queue = require("bull");

const queueOpts = {
  limiter: {
    max: 200,
    duration: 1000,
  },
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: true,
    removeOnFail: false,
    timeout: 60000,
  },
  settings: {
    stalledInterval: 30000,
    maxStalledCount: 2,
    lockDuration: 30000,
  },
};

let eventQueue;

if (process.env.REDIS_URL) {
  // Use connection string for Upstash TLS connection
  eventQueue = new Queue("lead-processing", process.env.REDIS_URL, {
    ...queueOpts,
    redis: {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: { rejectUnauthorized: false }, // Required for Upstash
    },
  });
} else {
  // Fallback piecemeal configuration
  eventQueue = new Queue("lead-processing", {
    ...queueOpts,
    redis: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      tls: process.env.REDIS_TLS === "true" ? {} : undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    },
  });
}

// ─── Observability Hooks ────────────────────────────────

eventQueue.on("ready", () => {
  console.log("Redis queue ready");
});

eventQueue.on("stalled", (job) => {
  console.error(`Job stalled: ${job.id}`);
});

eventQueue.on("failed", (job, err) => {
  console.error(`Job failed ${job.id}`, err.message);
});

eventQueue.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

eventQueue.on("error", (err) => {
  console.error("Queue error:", err);
});

module.exports = eventQueue;

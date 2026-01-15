const Queue = require("bull");

const eventQueue = new Queue("event-processing", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: false     // Keep failed jobs for debugging
  },
  settings: {
    lockDuration: 30000,    // 30 seconds lock
    stalledInterval: 5000,  // Check for stalled jobs every 5s
    maxStalledCount: 1      // Retry stalled jobs once
  }
});

// Event listeners for monitoring
eventQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

eventQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

eventQueue.on('stalled', (job) => {
  console.warn(`⚠️  Job ${job.id} stalled`);
});

eventQueue.on('error', (error) => {
  console.error('🚨 Queue error:', error);
});

module.exports = eventQueue;

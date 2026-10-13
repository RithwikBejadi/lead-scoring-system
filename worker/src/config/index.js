module.exports = {
  mongodb: {
    uri: process.env.MONGO_URI,
    options: {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 2,
    },
  },
  worker: {
    concurrency: parseInt(process.env.WORKER_CONCURRENCY, 10) || 1,
    lockDuration: parseInt(process.env.LOCK_DURATION, 10) || 30000,
    maxJobTime: parseInt(process.env.MAX_JOB_TIME, 10) || 60000,
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300000,
  },
  logging: {
    level: process.env.LOG_LEVEL || "INFO",
  },
};

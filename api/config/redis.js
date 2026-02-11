/**
 * FILE: config/redis.js
 * PURPOSE: Redis client configuration for rate limiting
 */

const Redis = require("ioredis");

// Robust Redis configuration (Phase 1.3)
const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  // TLS check: if explicitly true or if port is 6380 (Azure default)
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
  retryStrategy: (times) => {
    // Exponential backoff
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null, // Required for Bull compatibility (though this client is for rate limiting)
};

const redisClient = new Redis(redisConfig);

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redisClient.on("connect", () => {
  console.log("Redis connected for rate limiting");
});

module.exports = redisClient;

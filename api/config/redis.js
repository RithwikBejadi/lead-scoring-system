/**
 * FILE: config/redis.js
 * PURPOSE: Redis client configuration for rate limiting
 */

const Redis = require("ioredis");

// Robust Redis configuration (Phase 1.3)
const retryStrategy = (times) => {
  // Exponential backoff
  const delay = Math.min(times * 50, 2000);
  return delay;
};

let redisClient;

if (process.env.REDIS_URL) {
  // Use connection string directly (e.g. rediss://default:pwd@host:port)
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy,
  });
} else {
  // Fallback to legacy piecemeal env variables
  redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === "true" ? {} : undefined,
    retryStrategy,
    maxRetriesPerRequest: null,
  });
}

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redisClient.on("connect", () => {
  console.log("Redis connected for rate limiting");
});

module.exports = redisClient;

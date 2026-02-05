/**
 * FILE: config/redis.js
 * PURPOSE: Redis client configuration for rate limiting
 */

const redis = require("redis");

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redisClient.on("connect", () => {
  console.log("Redis connected for rate limiting");
});

// Connect to Redis
redisClient.connect().catch(console.error);

module.exports = redisClient;

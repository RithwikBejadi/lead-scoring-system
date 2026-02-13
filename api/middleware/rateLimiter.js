/**
 * FILE: middleware/rateLimiter.js
 * PURPOSE: Rate limiting middleware for event ingestion
 * Prevents abuse with Redis-backed token bucket
 */

const rateLimit = require("express-rate-limit");
const { RedisStore, ipKeyGenerator } = require("rate-limit-redis");
const redisClient = require("../config/redis");

/**
 * Rate limiter for event ingestion
 * 100 events per minute per API key
 */
const ingestRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per window

  // Use Redis for distributed rate limiting
  store: new RedisStore({
    sendCommand: async (...args) => redisClient.call(...args),
    prefix: "rl:ingest:",
  }),

  // Key by API key from request body
  keyGenerator: (req) => {
    return req.body?.apiKey || ipKeyGenerator(req);
  },

  // Custom response for rate limit exceeded
  handler: (req, res) => {
    const apiKey = req.body?.apiKey || "unknown";
    const ip = req.ip;
    console.warn(`[API] Rate Limit Exceeded for key:${apiKey} ip:${ip}`);

    res.status(429).json({
      error: "Rate limit exceeded",
      message: "Too many events. Please slow down.",
      retryAfter: 60, // seconds
    });
  },

  // Don't count failed requests
  skipFailedRequests: true,

  // Don't count successful requests with validation errors
  skipSuccessfulRequests: false,

  // Standard headers
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { ingestRateLimiter };

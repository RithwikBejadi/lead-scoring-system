const mongoose = require("mongoose");
const eventQueue = require("../../queue/eventQueue");
const logger = require("./logger");

let healthStatus = {
  status: "starting",
  mongodb: false,
  redis: false,
  lastCheck: null
};

async function checkHealth() {
  const status = {
    status: "healthy",
    mongodb: false,
    redis: false,
    lastCheck: new Date().toISOString()
  };

  try {
    status.mongodb = mongoose.connection.readyState === 1;
  } catch (err) {
    logger.error("MongoDB health check failed", { error: err.message });
  }

  try {
    const client = await eventQueue.client;
    await client.ping();
    status.redis = true;
  } catch (err) {
    logger.error("Redis health check failed", { error: err.message });
  }

  status.status = status.mongodb && status.redis ? "healthy" : "degraded";
  healthStatus = status;
  return status;
}

function startHealthChecks(interval = 30000) {
  setInterval(async () => {
    const health = await checkHealth();
    if (health.status !== "healthy") {
      logger.warn("System health degraded", health);
    }
  }, interval);
}

function getHealthStatus() {
  return healthStatus;
}

module.exports = { checkHealth, startHealthChecks, getHealthStatus };
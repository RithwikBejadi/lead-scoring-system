const Queue = require("bull");

const eventQueue = new Queue("event-processing", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

module.exports = eventQueue;


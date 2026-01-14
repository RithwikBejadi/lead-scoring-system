require("dotenv").config();
const Queue = require("bull");

module.exports = new Queue("event-processing", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

/**
 * FILE: app.js
 * PURPOSE: Express application configuration and middleware setup
 * 
 * SYSTEM FLOW SUMMARY:
 * 1. Client sends lead/event request → API validates & persists
 * 2. Event pushed to Redis queue (async boundary)
 * 3. Worker consumes event asynchronously
 * 4. Lead score recalculated atomically with transaction
 * 5. Intelligence computed and returned to client
 * 
 * This ensures scalability, fault isolation, and async processing.
 */

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

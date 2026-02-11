const router = require("express").Router();

const mongoose = require("mongoose");
const redisClient = require("./config/redis"); // Rate limit client

router.get("/health", async (req, res) => {
  const mongoStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const redisStatus =
    redisClient.status === "ready" ? "connected" : "disconnected";

  const status =
    mongoStatus === "connected" && redisStatus === "connected"
      ? "ok"
      : "degraded";
  const statusCode = status === "ok" ? 200 : 503;

  res.status(statusCode).json({
    status,
    mongodb: mongoStatus,
    redis: redisStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Auth routes (public)
router.use("/auth", require("./features/auth/auth.routes"));

// Feature routes
router.use("/events", require("./features/events/event.routes"));
router.use("/leads", require("./features/leads/lead.routes"));
router.use(
  "/leaderboard",
  require("./features/leaderboard/leaderboard.routes"),
);
router.use("/rules", require("./features/rules/rules.routes"));
router.use("/webhooks", require("./features/webhooks/webhook.routes"));
router.use("/ingest", require("./features/ingest/ingest.routes")); // Public ingestion
router.use("/projects", require("./features/projects/project.routes"));
router.use("/admin", require("./features/admin/admin.routes"));

module.exports = router;

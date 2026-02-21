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

// Feature routes (protected)
const { protect } = require("./middleware/authMiddleware");

router.use("/events", protect, require("./features/events/event.routes"));
router.use("/leads", protect, require("./features/leads/lead.routes"));
router.use(
  "/leaderboard",
  protect,
  require("./features/leaderboard/leaderboard.routes"),
);
router.use("/rules", protect, require("./features/rules/rules.routes"));
router.use(
  "/analytics",
  protect,
  require("./features/analytics/analytics.routes"),
);
router.use("/projects", protect, require("./features/projects/project.routes"));

// Admin routes (has its own protect + admin check inside)
router.use("/admin", require("./features/admin/admin.routes"));

// Public webhooks and ingestion (no JWT required)
router.use("/webhooks", require("./features/webhooks/webhook.routes"));
router.use("/ingest", require("./features/ingest/ingest.routes"));

module.exports = router;

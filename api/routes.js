const router = require("express").Router();

router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use("/events", require("./features/events/event.routes"));
router.use("/leads", require("./features/leads/lead.routes"));
router.use(
  "/leaderboard",
  require("./features/leaderboard/leaderboard.routes")
);
router.use("/rules", require("./features/rules/rules.routes"));
router.use("/webhooks", require("./features/webhooks/webhook.routes"));

module.exports = router;

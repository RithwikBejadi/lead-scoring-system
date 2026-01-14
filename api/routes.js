const router = require("express").Router();

router.use("/api/leads", require("./features/leads/lead.routes"));
router.use("/api/leads/leaderboard", require("./features/leaderboard/leaderboard.routes"));
router.use("/api/events", require("./features/events/event.routes"));

module.exports = router;

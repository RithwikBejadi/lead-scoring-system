const router = require("express").Router();
const controller = require("./leaderboard.controller");

router.get("/", controller.fetchLeaderboard);

module.exports = router;

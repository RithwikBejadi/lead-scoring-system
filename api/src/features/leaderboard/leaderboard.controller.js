const { getLeaderboard } = require("./leaderboard.service");

async function fetchLeaderboard(req, res, next) {
  try {
    const result = await getLeaderboard(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { fetchLeaderboard };

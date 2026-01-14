const service = require("./leaderboard.service");

exports.fetchLeaderboard = async (req, res) => {
  try {
    const leaders = await service.getLeaderboard();
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

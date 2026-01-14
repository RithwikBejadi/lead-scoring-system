const Lead = require("../../models/Lead");

exports.getLeaderboard = () => {
  return Lead.find({}, { name: 1, email: 1, currentScore: 1 })
    .sort({ currentScore: -1 })
    .limit(10);
};

const Lead = require("../../models/Lead");
const ScoreHistory = require("../../models/ScoreHistory");

exports.getLeadTimeline = async (leadId) => {
  const lead = await Lead.findById(leadId);
  const history = await ScoreHistory
    .find({ leadId })
    .sort({ timestamp: -1 });

  return { lead, history };
};

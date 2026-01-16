const Lead = require("../../models/Lead");
const { computeIntelligence } = require("../../utils/intelligence");

async function getLeadIntelligence(req, res, next) {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const intelligence = computeIntelligence(lead);
    
    res.json({
      leadId: lead._id,
      email: lead.email,
      currentScore: lead.score,
      intelligence
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLeadIntelligence };

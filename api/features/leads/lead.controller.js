const service = require("./lead.service");

exports.fetchLead = async (req, res) => {
  try {
    const lead = await service.getLeadById(req.params.id);
    res.json(lead);
  } catch {
    res.status(500).json({ error: "Failed to fetch lead" });
  }
};

exports.fetchLeadHistory = async (req, res) => {
  try {
    const history = await service.getLeadHistory(req.params.id);
    res.json(history);
  } catch {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

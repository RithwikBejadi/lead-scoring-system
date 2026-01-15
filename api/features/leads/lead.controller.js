const { getLeadById, getLeadHistory, createLead } = require("./lead.service");

async function fetchLead(req, res, next) {
  try {
    const lead = await getLeadById(req.params.id);
    res.json(lead);
  } catch (err) {
    next(err);
  }
}

async function fetchLeadHistory(req, res, next) {
  try {
    const result = await getLeadHistory(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createNewLead(req, res, next) {
  try {
    const lead = await createLead(req.body);
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
}

module.exports = { fetchLead, fetchLeadHistory, createNewLead };

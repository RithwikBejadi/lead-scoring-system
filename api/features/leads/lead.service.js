const Lead = require("../../models/Lead");
const ScoreHistory = require("../../models/ScoreHistory");
const { validateLeadId } = require("./lead.validator");

class LeadNotFoundError extends Error {
  constructor(leadId) {
    super(`Lead ${leadId} not found`);
    this.name = "LeadNotFoundError";
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

async function getLeadById(leadId, projectId) {
  const validation = validateLeadId(leadId);
  if (!validation.isValid) throw new ValidationError(validation.error);

  const lead = await Lead.findOne({ _id: leadId, projectId });
  if (!lead) throw new LeadNotFoundError(leadId);

  return lead;
}

async function getLeadHistory(leadId, projectId) {
  const validation = validateLeadId(leadId);
  if (!validation.isValid) throw new ValidationError(validation.error);

  const lead = await Lead.findOne({ _id: leadId, projectId });
  if (!lead) throw new LeadNotFoundError(leadId);

  const history = await ScoreHistory.find({ leadId })
    .sort({ timestamp: -1 })
    .limit(100);

  return { lead, history };
}

async function createLead(data) {
  if (!data.projectId) throw new ValidationError("projectId is required");
  if (!data.anonymousId) throw new ValidationError("anonymousId is required");

  const lead = await Lead.create({
    projectId: data.projectId,
    anonymousId: data.anonymousId,
    name: data.name || "",
    email: data.email || "",
    company: data.company || "",
    currentScore: 0,
  });

  return lead;
}

module.exports = {
  getLeadById,
  getLeadHistory,
  createLead,
  LeadNotFoundError,
  ValidationError,
};

/**
 * FILE: lead.controller.js
 * PURPOSE: HTTP handlers for lead CRUD operations
 * PATTERN: Thin controllers - delegate to service layer
 *
 * RELATED:
 * - lead.service.js (business logic)
 * - ../../models/Lead.js (data model)
 */

const { getLeadById, getLeadHistory, createLead } = require("./lead.service");
const { getLeadTimeline, LeadNotFoundError } = require("./timeline.service");

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

async function fetchLeadTimeline(req, res, next) {
  try {
    const timeline = await getLeadTimeline(req.params.id);
    res.json(timeline);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  fetchLead,
  fetchLeadHistory,
  createNewLead,
  fetchLeadTimeline,
};

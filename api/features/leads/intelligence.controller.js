/**
 * FILE: intelligence.controller.js
 * PURPOSE: Compute and return lead intelligence (stage, velocity, risk)
 * PATTERN: Read-only endpoint - no side effects
 * 
 * INTELLIGENCE METRICS:
 * - Stage: cold/warm/hot/qualified (based on score thresholds)
 * - Velocity: Rate of score change (momentum indicator)
 * - Risk: Stagnation + decay detection
 * - Next Action: Recommended engagement type
 */

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

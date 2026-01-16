const Lead = require("../../models/Lead");
const { assessRisk, determineNextAction } = require("../../../worker/services/leadIntelligence");

async function getLeadIntelligence(req, res, next) {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const risk = assessRisk(lead);
    const nextAction = determineNextAction(lead);

    const intelligence = {
      leadId: lead._id,
      stage: lead.leadStage,
      currentScore: lead.currentScore,
      velocity: {
        score: lead.velocityScore,
        eventsLast24h: lead.eventsLast24h,
        level: lead.velocityScore >= 9 ? "high" : lead.velocityScore >= 6 ? "medium" : "low"
      },
      risk: {
        level: risk,
        daysSinceLastEvent: lead.lastEventAt 
          ? Math.floor((Date.now() - lead.lastEventAt.getTime()) / (1000 * 60 * 60 * 24))
          : null
      },
      nextAction,
      recommendations: generateRecommendations(lead, risk, nextAction)
    };

    res.json(intelligence);
  } catch (err) {
    next(err);
  }
}

function generateRecommendations(lead, risk, nextAction) {
  const recommendations = [];

  if (lead.leadStage === "qualified") {
    recommendations.push("High-value lead - prioritize for demo");
  }

  if (lead.velocityScore >= 9) {
    recommendations.push("Rapid engagement detected - immediate follow-up recommended");
  }

  if (risk === "high") {
    recommendations.push("Lead going cold - re-engagement campaign needed");
  }

  if (lead.leadStage === "hot" && lead.velocityScore < 3) {
    recommendations.push("Hot lead with low velocity - may need nurturing");
  }

  return recommendations;
}

module.exports = { getLeadIntelligence };

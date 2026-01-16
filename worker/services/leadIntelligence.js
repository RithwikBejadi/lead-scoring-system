function calculateLeadStage(score) {
  if (score >= 60) return "qualified";
  if (score >= 31) return "hot";
  if (score >= 11) return "warm";
  return "cold";
}

function calculateVelocity(eventsLast24h) {
  return eventsLast24h * 3;
}

function assessRisk(lead) {
  const daysSinceLastEvent = lead.lastEventAt 
    ? Math.floor((Date.now() - lead.lastEventAt.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  if (daysSinceLastEvent > 14) return "high";
  if (daysSinceLastEvent > 7) return "medium";
  return "low";
}

function determineNextAction(lead) {
  const stage = lead.leadStage;
  const velocity = lead.velocityScore;
  const risk = assessRisk(lead);

  if (stage === "qualified") return "schedule_demo";
  if (stage === "hot" && velocity >= 9) return "immediate_outreach";
  if (stage === "hot") return "prioritize_contact";
  if (stage === "warm" && risk === "high") return "re_engage";
  if (stage === "warm") return "nurture_campaign";
  return "monitor";
}

module.exports = {
  calculateLeadStage,
  calculateVelocity,
  assessRisk,
  determineNextAction
};

function calculateStage(score) {
  if (score >= 60) return "qualified";
  if (score >= 31) return "hot";
  if (score >= 11) return "warm";
  return "cold";
}

function calculateVelocity(eventsLast24h) {
  return eventsLast24h * 3;
}

function calculateRisk(lastEventAt) {
  if (!lastEventAt) return "high";
  
  const daysSince = (Date.now() - new Date(lastEventAt).getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSince > 7) return "high";
  if (daysSince > 3) return "medium";
  return "low";
}

function getNextAction(stage, velocity, risk) {
  if (stage === "qualified" && risk === "low") return "immediate_outreach";
  if (stage === "hot" && velocity > 6) return "prioritize_contact";
  if (stage === "hot") return "schedule_demo";
  if (stage === "warm" && velocity > 3) return "send_content";
  if (stage === "warm") return "nurture_campaign";
  return "monitor";
}

function computeIntelligence(lead) {
  const stage = calculateStage(lead.currentScore || 0);
  const velocity = calculateVelocity(lead.eventsLast24h || 0);
  const risk = calculateRisk(lead.lastEventAt);
  const nextAction = getNextAction(stage, velocity, risk);

  return { stage, velocity, risk, nextAction };
}

module.exports = { 
  calculateStage, 
  calculateVelocity, 
  calculateRisk, 
  getNextAction, 
  computeIntelligence 
};

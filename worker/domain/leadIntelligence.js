const { calculateStage } = require("./stageEngine");

function calculateVelocity(eventsLast24h) {
  return eventsLast24h * 3;
}

function calculateRisk(lastEventAt) {
  const daysSinceLastEvent = Math.floor(
    (Date.now() - lastEventAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSinceLastEvent > 14) return "high";
  if (daysSinceLastEvent > 7) return "medium";
  return "low";
}

function getNextAction(stage, velocity, risk) {
  if (stage === "qualified" && velocity >= 3) return "immediate_sales_contact";
  if (stage === "hot" && risk === "low") return "schedule_demo";
  if (stage === "warm") return "nurture_campaign";
  if (risk === "high") return "re_engagement_required";
  return "monitor";
}

function computeIntelligence(lead) {
  const stage = calculateStage(lead.currentScore);
  const velocity = calculateVelocity(lead.eventsLast24h || 0);
  const risk = calculateRisk(lead.lastEventAt || lead.createdAt);
  const nextAction = getNextAction(stage, velocity, risk);

  return { stage, velocity, risk, nextAction };
}

module.exports = {
  calculateVelocity,
  calculateRisk,
  getNextAction,
  computeIntelligence,
};

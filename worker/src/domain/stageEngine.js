function calculateStage(score) {
  if (score >= 60) return "qualified";
  if (score >= 31) return "hot";
  if (score >= 11) return "warm";
  return "cold";
}

module.exports = { calculateStage };

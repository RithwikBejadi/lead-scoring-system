const ScoringRule = require("../models/ScoringRule");

let cache = null;
let expiry = null;
const TTL = 5 * 60 * 1000;

async function getScoringRules() {
  const now = Date.now();
  
  if (!cache || !expiry || now > expiry) {
    const rules = await ScoringRule.find().lean();
    
    cache = rules.reduce((acc, rule) => {
      acc[rule.eventType] = rule.points;
      return acc;
    }, {});
    
    expiry = now + TTL;
    console.log(`Scoring rules cached: ${Object.keys(cache).length} rules`);
  }
  
  return cache;
}

function clearCache() {
  cache = null;
  expiry = null;
}

module.exports = { getScoringRules, clearCache };

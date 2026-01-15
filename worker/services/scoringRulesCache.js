const ScoringRule = require("../models/ScoringRule");
const logger = require("../utils/logger");

let cache = {};
let ready = false;

async function initRulesCache() {
  const rules = await ScoringRule.find().lean();
  
  cache = rules.reduce((acc, rule) => {
    acc[rule.eventType] = rule.points;
    return acc;
  }, {});
  
  ready = true;
  logger.info("Scoring rules cache initialized", { count: Object.keys(cache).length });
}

function getRule(eventType) {
  if (!ready) throw new Error("Rules cache not initialized");
  return cache[eventType] || 0;
}

function getAllRules() {
  if (!ready) throw new Error("Rules cache not initialized");
  return { ...cache };
}

async function waitForRules() {
  while (true) {
    const rules = await ScoringRule.find().lean();
    if (rules.length > 0) {
      await initRulesCache();
      return;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

module.exports = { initRulesCache, getRule, getAllRules, waitForRules };

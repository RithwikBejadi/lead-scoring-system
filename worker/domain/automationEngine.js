const AutomationRule = require("../models/AutomationRule");
const AutomationExecution = require("../models/AutomationExecution");
const logger = require("../utils/logger");

let rulesCache = [];
let cacheReady = false;

async function initAutomationRules() {
  rulesCache = await AutomationRule.find().lean();
  cacheReady = true;
  logger.info("Automation rules cache initialized", { count: rulesCache.length });
}

async function executeAutomations(lead, stage, velocity) {
  if (!cacheReady) return;

  const dateBucket = new Date().toISOString().split("T")[0];
  const matchingRules = rulesCache.filter(rule => {
    if (rule.whenStage && rule.whenStage !== stage) return false;
    if (rule.minVelocity && velocity < rule.minVelocity) return false;
    return true;
  });

  for (const rule of matchingRules) {
    try {
      await AutomationExecution.create({
        leadId: lead._id,
        ruleId: rule._id,
        dateBucket,
        payload: {
          action: rule.action,
          stage,
          velocity,
          leadEmail: lead.email,
          leadName: lead.name
        },
        status: "executed"
      });

      logger.info("Automation triggered", {
        leadId: lead._id,
        action: rule.action,
        stage,
        velocity
      });
    } catch (err) {
      if (err.code === 11000) {
        logger.debug("Automation already executed today", { leadId: lead._id, ruleId: rule._id });
      } else {
        logger.error("Failed to execute automation", { error: err.message });
      }
    }
  }
}

async function executeAutomationsForLead(leadId) {
  if (!cacheReady) return;

  const Lead = require("../models/Lead");
  const { calculateStage } = require("./stageEngine");
  const { calculateVelocity } = require("./leadIntelligence");

  const lead = await Lead.findById(leadId);
  if (!lead) {
    logger.warn("Lead not found for automation", { leadId });
    return;
  }

  const stage = calculateStage(lead.currentScore);
  const velocity = calculateVelocity(lead.eventsLast24h);

  await executeAutomations(lead, stage, velocity);
}

module.exports = { initAutomationRules, executeAutomations, executeAutomationsForLead };

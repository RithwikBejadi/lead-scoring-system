const Lead = require("../models/Lead");
const logger = require("./logger");

async function recoverStuckLeads(ttlMs = 5 * 60 * 1000) {
  const cutoff = new Date(Date.now() - ttlMs);
  const res = await Lead.updateMany(
    { processing: true, updatedAt: { $lt: cutoff } },
    { $set: { processing: false } }
  );
  if (res.modifiedCount) logger.warn("Recovered stuck leads", { count: res.modifiedCount });
}

function startRecoveryLoop(interval = 60000) {
  setInterval(() => recoverStuckLeads().catch(err => logger.error("recoverStuckLeads failed", { err: err.message })), interval);
}

module.exports = { recoverStuckLeads, startRecoveryLoop };
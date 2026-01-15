const Lead = require("../models/Lead");

async function acquireLock(leadId, session) {
  const lead = await Lead.findOneAndUpdate(
    { _id: leadId, processing: false },
    { $set: { processing: true } },
    { new: true, session }
  );
  
  return lead;
}

async function releaseLock(leadId, session = null, updateData = {}) {
  const update = { ...updateData, processing: false };
  
  const options = session ? { session } : {};
  
  await Lead.updateOne(
    { _id: leadId },
    { $set: update },
    options
  );
}

module.exports = { acquireLock, releaseLock };

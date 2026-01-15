const mongoose = require("mongoose");

module.exports = async function waitForMongoPrimary(timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const admin = mongoose.connection.db.admin();
      const status = await admin.command({ replSetGetStatus: 1 });
      if (status.myState === 1) return;
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error("Mongo primary not available");
};

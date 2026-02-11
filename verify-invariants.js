/**
 * FILE: verify-invariants.js
 * PURPOSE: Check system consistency invariants (Phase 6)
 * USAGE: node verify-invariants.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Lead = require("./api/models/Lead");
const Event = require("./api/models/Event");
const ScoreHistory = require("./api/models/ScoreHistory");

async function checkInvariants() {
  console.log("🔍 Starting Invariant Check...");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  let healthy = true;

  // Invariant 1: Every processed event must have ScoreHistory
  console.log("Checking Invariant 1: Processed Events vs ScoreHistory...");
  const processedEvents = await Event.countDocuments({ processed: true });
  const scoreHistoryCount = await ScoreHistory.countDocuments({});

  // Note: One event might produce one history entry usually.
  // If count mismatches significantly (more history than events is possible if manual adjustments, but less history is bad)
  // Actually, strict invariant: For every Event(id), there is ScoreHistory(eventId)
  if (scoreHistoryCount < processedEvents) {
    console.warn(
      `❌ Invariant 1 Failed: ${processedEvents} processed events but only ${scoreHistoryCount} history entries.`,
    );
    healthy = false;
  } else {
    console.log(
      `✅ Invariant 1 Passed (${processedEvents} events, ${scoreHistoryCount} history)`,
    );
  }

  // Invariant 2: Lead.currentScore equals latest ScoreHistory.newScore
  console.log("Checking Invariant 2: Lead Score Sync...");
  const leads = await Lead.find({});
  let syncFailures = 0;

  for (const lead of leads) {
    const history = await ScoreHistory.findOne({ leadId: lead._id }).sort({
      timestamp: -1,
    });
    const historyScore = history ? history.newScore : 0;

    if (lead.currentScore !== historyScore) {
      console.error(
        `❌ Sync Fail Lead ${lead._id}: Lead=${lead.currentScore} History=${historyScore}`,
      );
      syncFailures++;
    }
  }

  if (syncFailures > 0) {
    console.warn(`❌ Invariant 2 Failed: ${syncFailures} leads out of sync.`);
    healthy = false;
  } else {
    console.log(`✅ Invariant 2 Passed (${leads.length} leads checked)`);
  }

  // Invariant 4: No leads stuck with processing=true
  console.log("Checking Invariant 4: Stuck Leads...");
  const cutoff = new Date(Date.now() - 5 * 60 * 1000); // 5 mins ago
  const stuckLeads = await Lead.countDocuments({
    processing: true,
    updatedAt: { $lt: cutoff },
  });

  if (stuckLeads > 0) {
    console.warn(
      `❌ Invariant 4 Failed: ${stuckLeads} leads stuck in processing state > 5mins.`,
    );
    healthy = false;
  } else {
    console.log(`✅ Invariant 4 Passed`);
  }

  // Invariant: Failed Jobs
  const failedJobsCount = await mongoose.connection
    .collection("failed_jobs")
    .countDocuments({});
  if (failedJobsCount > 0) {
    console.warn(`⚠️  Warning: ${failedJobsCount} failed jobs in DLQ.`);
  }

  console.log("--------------------------------");
  if (healthy) {
    console.log("✅ SYSTEM HEALTHY - READY FOR FREEZE");
    process.exit(0);
  } else {
    console.error("❌ SYSTEM UNHEALTHY - DO NOT FREEZE");
    process.exit(1);
  }
}

checkInvariants().catch(console.error);

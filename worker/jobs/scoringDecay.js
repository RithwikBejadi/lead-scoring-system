const Lead = require("../models/Lead");
const logger = require("../utils/logger");

async function runScoringDecay() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await Lead.updateMany(
    {
      lastEventAt: { $lt: sevenDaysAgo },
      currentScore: { $gt: 0 },
    },
    [
      {
        $set: {
          currentScore: { $multiply: ["$currentScore", 0.8] },
          leadStage: {
            $switch: {
              branches: [
                {
                  case: { $gte: [{ $multiply: ["$currentScore", 0.8] }, 60] },
                  then: "qualified",
                },
                {
                  case: { $gte: [{ $multiply: ["$currentScore", 0.8] }, 31] },
                  then: "hot",
                },
                {
                  case: { $gte: [{ $multiply: ["$currentScore", 0.8] }, 11] },
                  then: "warm",
                },
              ],
              default: "cold",
            },
          },
        },
      },
    ],
  );

  logger.info("Scoring decay completed", {
    modifiedCount: result.modifiedCount,
    threshold: sevenDaysAgo.toISOString(),
  });

  return result.modifiedCount;
}

function startDecayJob() {
  // Run every day at 2 AM
  const runDaily = () => {
    const now = new Date();
    const next2AM = new Date(now);
    next2AM.setHours(26, 0, 0, 0); // Next occurrence of 2 AM

    const msUntil2AM = next2AM.getTime() - now.getTime();

    setTimeout(async () => {
      try {
        await runScoringDecay();
      } catch (err) {
        logger.error("Scoring decay failed", { error: err.message });
      }
      runDaily(); // Schedule next run
    }, msUntil2AM);
  };

  runDaily();
  logger.info("Scoring decay job scheduled");
}

module.exports = { runScoringDecay, startDecayJob };

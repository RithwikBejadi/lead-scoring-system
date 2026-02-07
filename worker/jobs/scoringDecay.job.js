require("dotenv").config();
const mongoose = require("mongoose");
const Lead = require("../models/Lead");
const logger = require("../utils/logger");

const DECAY_DAYS = 7;
const DECAY_FACTOR = 0.8;

async function runScoringDecay() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const cutoff = new Date(Date.now() - DECAY_DAYS * 24 * 60 * 60 * 1000);

    const result = await Lead.updateMany(
      {
        lastEventAt: { $lt: cutoff },
        currentScore: { $gt: 0 },
      },
      [
        {
          $set: {
            currentScore: { $multiply: ["$currentScore", DECAY_FACTOR] },
            leadStage: {
              $switch: {
                branches: [
                  {
                    case: {
                      $gte: [
                        { $multiply: ["$currentScore", DECAY_FACTOR] },
                        60,
                      ],
                    },
                    then: "qualified",
                  },
                  {
                    case: {
                      $gte: [
                        { $multiply: ["$currentScore", DECAY_FACTOR] },
                        31,
                      ],
                    },
                    then: "hot",
                  },
                  {
                    case: {
                      $gte: [
                        { $multiply: ["$currentScore", DECAY_FACTOR] },
                        11,
                      ],
                    },
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
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    logger.error("Scoring decay failed", { error: err.message });
    process.exit(1);
  }
}

if (require.main === module) {
  runScoringDecay();
}

module.exports = { runScoringDecay };

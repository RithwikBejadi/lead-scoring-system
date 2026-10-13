const Lead = require("../../models/Lead");
const { validateLeaderboardQuery } = require("./leaderboard.validator");

class ValidationError extends Error {
  constructor(errors) {
    super("Validation failed");
    this.name = "ValidationError";
    this.errors = errors;
  }
}

async function getLeaderboard(query = {}) {
  const validation = validateLeaderboardQuery(query);
  if (!validation.isValid) throw new ValidationError(validation.errors);

  const { limit, offset } = validation.params;

  const leads = await Lead.find(
    {},
    { name: 1, email: 1, currentScore: 1 }
  )
    .sort({ currentScore: -1 })
    .skip(offset)
    .limit(limit);

  const total = await Lead.countDocuments();

  return {
    leads,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + leads.length < total
    }
  };
}

module.exports = { getLeaderboard, ValidationError };

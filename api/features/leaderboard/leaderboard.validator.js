function validateLeaderboardQuery(query) {
  const errors = [];
  const limit = parseInt(query.limit, 10) || 10;
  const offset = parseInt(query.offset, 10) || 0;

  if (limit < 1 || limit > 100) {
    errors.push("Limit must be between 1 and 100");
  }

  if (offset < 0) {
    errors.push("Offset must be non-negative");
  }

  return {
    isValid: errors.length === 0,
    errors,
    params: { limit, offset }
  };
}

module.exports = { validateLeaderboardQuery };
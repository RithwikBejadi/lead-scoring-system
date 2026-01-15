const mongoose = require("mongoose");

function validateLeadId(id) {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return { isValid: false, error: "Invalid lead ID" };
  }
  return { isValid: true };
}

module.exports = { validateLeadId };
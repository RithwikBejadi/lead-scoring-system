const crypto = require("crypto");

function generateApiKey() {
  return "pk_" + crypto.randomBytes(24).toString("hex");
}

module.exports = { generateApiKey };

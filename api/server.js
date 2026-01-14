require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

(async () => {
  await connectDB();
  app.listen(4000, () => console.log("API running on 4000"));
})();

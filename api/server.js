const connectDB = require("./config/db");
const app = require("./app");
const { seedDefaultRules } = require("./features/rules/rules.service");

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Start DB connection in background (mongoose will retry)
    connectDB()
      .then(async () => {
        // Seed default scoring rules if none exist
        await seedDefaultRules();
      })
      .catch((err) => {
        console.error("Initial DB connection failed, will retry:", err.message);
      });

    const server = app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received, closing server gracefully...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, closing server gracefully...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

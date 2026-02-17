require("dotenv").config();
const connectDB = require("./config/db");
const { app, server, io } = require("./app");
const { seedDefaultRules } = require("./features/rules/rules.service");

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Start DB connection in background (mongoose will retry)
    connectDB()
      .then(async () => {
        console.log("MongoDB connected successfully");
        // Seed default scoring rules if none exist
        await seedDefaultRules();
      })
      .catch((err) => {
        console.error("Initial DB connection failed, will retry:", err.message);
      });

    server.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);

      // Phase 2.1: NODE_ENV Enforcement
      if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️  Running in non-production mode");
      } else {
        console.log("✅ Running in production mode");
      }

      console.log(`Socket.IO enabled on port ${PORT}`);
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received, closing server gracefully...");
      io.close();
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, closing server gracefully...");
      io.close();
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

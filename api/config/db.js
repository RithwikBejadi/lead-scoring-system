/**
 * FILE: config/db.js
 * PURPOSE: MongoDB connection with production hardening
 */

const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  // Phase 2: Hide secrets in logs
  if (process.env.NODE_ENV !== "production") {
    console.log("Connecting to MongoDB:", mongoUri);
  } else {
    console.log("Connecting to MongoDB (URI hidden)");
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip IPv6
    });

    console.log("MongoDB connected successfully");

    // Explicitly check for Replica Set in production (Phase 1.2)
    if (process.env.NODE_ENV === "production") {
      const admin = new mongoose.mongo.Admin(mongoose.connection.db);
      const info = await admin.replSetGetStatus().catch(() => null);
      if (!info) {
        console.warn(
          "⚠️  WARNING: MongoDB is NOT a Replica Set. Transactions will fail.",
        );
      } else {
        console.log("✅ MongoDB Replica Set detected.");
      }
    }

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // In production, we might want to crash if we can't connect at startup
    // so the orchestrator can restart us
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    throw error;
  }
}

module.exports = connectDB;

/**
 * FILE: models/User.js
 * PURPOSE: User schema for authentication (OAuth + Email/Password)
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      // Not required for OAuth users
    },
    provider: {
      type: String,
      enum: ["google", "email"],
      default: "email",
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster lookups
userSchema.index({ googleId: 1 });
userSchema.index({ verificationToken: 1 });

module.exports = mongoose.model("User", userSchema);

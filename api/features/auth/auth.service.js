const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const User = require("../../models/User");
const Project = require("../projects/project.model");
const { generateApiKey } = require("../../utils/generateApiKey");

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Hash a password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
const generateToken = (userId, email, projectId) => {
  return jwt.sign(
    { userId, email, projectId },
    process.env.JWT_SECRET || "your-secret-key-change-in-production",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
    );
  } catch (error) {
    return null;
  }
};

/**
 * Verify Google OAuth token
 */
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    console.error("Google token verification failed:", error.message);
    return null;
  }
};

/**
 * Generate email verification token
 */
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Register new user with email/password
 */
const registerUser = async ({ email, password, name }) => {
  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate verification token
  const verificationToken = generateVerificationToken();
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create project for the user
  const project = await Project.create({
    name: `${name}'s Project`,
    apiKey: generateApiKey(),
    domain: "example.com", // User can update later in settings
    active: true,
  });

  // Create user
  const user = await User.create({
    email: email.toLowerCase(),
    name,
    password: hashedPassword,
    provider: "email",
    emailVerified: false,
    verificationToken,
    verificationTokenExpires,
    projectId: project._id,
  });

  // Generate JWT
  const token = generateToken(user._id, user.email, user.projectId);

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      provider: user.provider,
    },
    token,
    verificationToken, // For sending verification email
  };
};

/**
 * Login user with email/password
 */
const loginUser = async ({ email, password }) => {
  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if user registered with OAuth
  if (user.provider === "google" && !user.password) {
    throw new Error("Please sign in with Google");
  }

  // Verify password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate JWT
  const token = generateToken(user._id, user.email, user.projectId);

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      provider: user.provider,
    },
    token,
  };
};

/**
 * Google OAuth login/register
 */
const googleAuth = async (idToken) => {
  // Verify Google token
  const googleUser = await verifyGoogleToken(idToken);
  if (!googleUser) {
    throw new Error("Invalid Google token");
  }

  // Find or create user
  let user = await User.findOne({
    $or: [
      { googleId: googleUser.googleId },
      { email: googleUser.email.toLowerCase() },
    ],
  });

  if (user) {
    // Update Google info if needed
    if (!user.googleId) {
      user.googleId = googleUser.googleId;
      user.provider = "google";
    }
    if (!user.avatar && googleUser.avatar) {
      user.avatar = googleUser.avatar;
    }
    user.emailVerified = true;
    user.lastLoginAt = new Date();
    await user.save();
  } else {
    // Create project for new Google user
    const project = await Project.create({
      name: `${googleUser.name}'s Project`,
      apiKey: generateApiKey(),
      domain: "example.com",
      active: true,
    });

    // Create new user
    user = await User.create({
      email: googleUser.email.toLowerCase(),
      name: googleUser.name,
      googleId: googleUser.googleId,
      avatar: googleUser.avatar,
      provider: "google",
      emailVerified: true,
      lastLoginAt: new Date(),
      projectId: project._id,
    });
  }

  // Generate JWT
  const token = generateToken(user._id, user.email, user.projectId);

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      provider: user.provider,
    },
    token,
  };
};

/**
 * Verify email with token
 */
const verifyEmail = async (verificationToken) => {
  const user = await User.findOne({
    verificationToken,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error("Invalid or expired verification token");
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
    },
  };
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId).select(
    "-password -verificationToken",
  );
  if (!user) {
    throw new Error("User not found");
  }
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
    provider: user.provider,
    role: user.role,
    createdAt: user.createdAt,
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  verifyGoogleToken,
  generateVerificationToken,
  registerUser,
  loginUser,
  googleAuth,
  verifyEmail,
  getUserById,
};

/**
 * FILE: middleware/authMiddleware.js
 * PURPOSE: JWT authentication middleware for protecting routes
 */

const { verifyToken } = require("../features/auth/auth.service");

/**
 * Protect middleware - requires valid JWT
 */
const protect = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Not authorized - No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: "Not authorized - Invalid token",
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Not authorized - Token verification failed",
    });
  }
};

/**
 * Optional auth middleware - attaches user if token present, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);

      if (decoded) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without user - it's optional
    next();
  }
};

/**
 * Admin only middleware - requires admin role
 */
const adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authorized",
      });
    }

    const User = require("../models/User");
    const user = await User.findById(req.user.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Authorization check failed",
    });
  }
};

module.exports = {
  protect,
  optionalAuth,
  adminOnly,
};

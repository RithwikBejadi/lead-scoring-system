const authService = require("./auth.service");

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: "Email, password, and name are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters",
      });
    }

    const result = await authService.registerUser({ email, password, name });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
      message: "Registration successful. Please verify your email.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const result = await authService.loginUser({ email, password });

    res.json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: "Google ID token is required",
      });
    }

    const result = await authService.googleAuth(idToken);

    res.json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Verification token is required",
      });
    }

    const result = await authService.verifyEmail(token);

    res.json({
      success: true,
      data: result,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

const getMyProject = async (req, res) => {
  try {
    const Project = require("../projects/project.model");
    const User = require("../../models/User");
    const { generateApiKey } = require("../../utils/generateApiKey");

    let project = null;

    // Try fetching the project linked to this user's token
    if (req.user.projectId) {
      project = await Project.findById(req.user.projectId);
    }

    // If no project found (deleted, or old user pre-project creation),
    // auto-create a default one and link it to the user
    if (!project) {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(401).json({ success: false, error: "User not found" });
      }

      // Check if user already has a projectId pointing somewhere else
      if (user.projectId) {
        project = await Project.findById(user.projectId);
      }

      if (!project) {
        project = await Project.create({
          name: user.name ? `${user.name}'s Project` : "My Project",
          apiKey: generateApiKey(),
          domain: "example.com",
          active: true,
        });

        user.projectId = project._id;
        await user.save();
      }
    }

    res.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  verifyEmail,
  getMe,
  getMyProject,
};

const router = require("express").Router();
const authController = require("./auth.controller");
const { protect } = require("../../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleAuth);
router.post("/verify-email", authController.verifyEmail);

router.get("/me", protect, authController.getMe);
router.get("/project", protect, authController.getMyProject);

module.exports = router;

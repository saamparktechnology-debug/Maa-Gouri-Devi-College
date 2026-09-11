const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const dashboardController = require("../controllers/dashboardController");
const { isAuthenticated } = require("../middleware/authMiddleware");
// Login & OTP verification routes
router.get("/login", (req, res) => res.render("auth/login", { error: null }));
router.post("/login", authController.postLogin);

router.get("/verify-otp", authController.getVerifyOtp);
router.post("/verify-otp", authController.postVerifyOtp);

// Forgot Password routes
router.get("/forgot-password", authController.getForgotPassword);
router.post("/forgot-password", authController.postForgotPassword);

router.get("/reset-password-verify", authController.getResetPasswordVerify);
router.post("/reset-password", authController.postResetPassword);
router.get("/dashboard", isAuthenticated, dashboardController.getDashboard);

module.exports = router;

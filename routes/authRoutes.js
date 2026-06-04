const express = require("express");
const { signup, login, verifyOTP, resendOTP, forgotPassword, verifyPasswordOtp, resendPasswordOtp, resetPassword } = require("../controllers/authController.js");

const router = express.Router();

// POST /api/auth/signup — User signup only
router.post("/signup", signup);

// POST /api/auth/login — All roles
router.post("/login", login);

// POST /api/auth/verify-otp — Verify user OTP
router.post("/verify-otp", verifyOTP);

// POST /api/auth/resend-otp — Resend OTP
router.post("/resend-otp", resendOTP);

// POST /api/auth/forgot-password — Request password reset
router.post("/forgot-password", forgotPassword);

// POST /api/auth/verify-password-otp
router.post("/verify-password-otp", verifyPasswordOtp);

// POST /api/auth/resend-password-otp
router.post("/resend-password-otp", resendPasswordOtp);

// POST /api/auth/reset-password — Reset password
router.post("/reset-password", resetPassword);

module.exports = router;

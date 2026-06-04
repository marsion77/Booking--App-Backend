const authService = require("../services/authService.js");
const otpService = require("../services/otpService.js");
const emailService = require("../services/emailService.js");

/**
 * POST /api/auth/signup — User signup only.
 */
const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login — All roles.
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/verify-otp — Verify user OTP.
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    const result = await otpService.verifyOTP(userId, otp);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/resend-otp — Resend OTP to user.
 */
const resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const result = await otpService.resendOTP(userId);
    await emailService.sendOTPEmail(result.email, result.name, result.otp);
    res.status(200).json({ success: true, data: { message: "OTP resent successfully." } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/forgot-password — Request password reset email
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/verify-password-otp
 */
const verifyPasswordOtp = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    const result = await authService.verifyPasswordOtp(userId, otp);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/resend-password-otp
 */
const resendPasswordOtp = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const result = await authService.resendPasswordOtp(userId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password — Reset password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyPasswordOtp,
  resendPasswordOtp,
  resetPassword,
};

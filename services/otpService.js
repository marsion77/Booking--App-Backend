const crypto = require("crypto");
const OTP = require("../models/OTP.js");
const User = require("../models/User.js");

/**
 * Generate a 6-digit OTP for a user, valid for 5 minutes.
 * Invalidates any previous unused OTPs for the same user.
 */
const generateOTP = async (userId) => {
  // Invalidate previous unused OTPs
  await OTP.updateMany(
    { userId, isUsed: false },
    { $set: { isUsed: true } }
  );

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await OTP.create({ userId, otp, expiresAt });

  return otp;
};

/**
 * Verify an OTP for a user.
 * Marks the OTP as used and sets the user as verified.
 */
const verifyOTP = async (userId, otpValue) => {
  const otpRecord = await OTP.findOne({
    userId,
    otp: otpValue,
    isUsed: false,
  });

  if (!otpRecord) {
    const error = new Error("Invalid OTP.");
    error.statusCode = 400;
    throw error;
  }

  // Check expiry
  if (otpRecord.expiresAt < new Date()) {
    const error = new Error("OTP has expired. Please request a new one.");
    error.statusCode = 400;
    throw error;
  }

  // Mark OTP as used
  otpRecord.isUsed = true;
  await otpRecord.save();

  // Verify the user
  await User.findByIdAndUpdate(userId, { isVerified: true });

  return { message: "Account verified successfully." };
};

/**
 * Resend OTP — generates a new OTP and returns it (caller sends email).
 */
const resendOTP = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (user.isVerified) {
    const error = new Error("Account is already verified.");
    error.statusCode = 400;
    throw error;
  }

  const otp = await generateOTP(userId);
  return { otp, email: user.email, name: user.name };
};

/**
 * Verify an OTP for password reset.
 * Marks the OTP as used without affecting user.isVerified.
 */
const verifyResetOTP = async (userId, otpValue) => {
  const otpRecord = await OTP.findOne({
    userId,
    otp: otpValue,
    isUsed: false,
  });

  if (!otpRecord) {
    const error = new Error("Invalid OTP.");
    error.statusCode = 400;
    throw error;
  }

  // Check expiry
  if (otpRecord.expiresAt < new Date()) {
    const error = new Error("OTP has expired. Please request a new one.");
    error.statusCode = 400;
    throw error;
  }

  // Mark OTP as used
  otpRecord.isUsed = true;
  await otpRecord.save();

  return true;
};

/**
 * Resend OTP for password reset.
 */
const resendResetOTP = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const otp = await generateOTP(userId);
  return { otp, email: user.email, name: user.name };
};

module.exports = {
  generateOTP,
  verifyOTP,
  resendOTP,
  verifyResetOTP,
  resendResetOTP,
};

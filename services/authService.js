const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const jwtConfig = require("../config/jwt.js");
const otpService = require("./otpService.js");
const emailService = require("./emailService.js");
const crypto = require("crypto");

/**
 * Generate a JWT token for a given user.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
};

/**
 * Signup — only for users (role = "user").
 * Creates the user, generates an OTP, and sends verification email.
 */
const signup = async ({ name, email, password, phone }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email is already registered.");
    error.statusCode = 409;
    throw error;
  }

  // Create user with role = "user", isVerified = false
  const user = await User.create({ name, email, password, phone, role: "user" });

  // Generate and send OTP
  const otp = await otpService.generateOTP(user._id);
  
  await emailService.sendOTPEmail(user.email, user.name, otp);

  return {
    message: "Signup successful. Please verify your email with the OTP sent.",
    userId: user._id,
  };
};

/**
 * Login — for Admin, Organizer, and User.
 * Validates credentials and returns a JWT token.
 */
const login = async ({ email, password }) => {
  // Find user with password field included
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Users must be verified before login
  if (user.role === "user" && !user.isVerified) {
    // Resend OTP
    const otp = await otpService.generateOTP(user._id);
    
      await emailService.sendOTPEmail(user.email, user.name, otp);

    const error = new Error(
      "Account not verified. A new OTP has been sent to your email."
    );
    error.statusCode = 403;
    throw error;
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};

/**
 * Forgot Password — Generate OTP and send email
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("User with that email does not exist.");
    error.statusCode = 404;
    throw error;
  }

  const otp = await otpService.generateOTP(user._id);

  await emailService.sendPasswordResetEmail(user.email, user.name, otp);

  return { message: "Password reset OTP sent.", userId: user._id, email: user.email };
};

/**
 * Verify Password OTP — Validate OTP and generate reset token
 */
const verifyPasswordOtp = async (userId, otp) => {
  await otpService.verifyResetOTP(userId, otp);
  
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  const user = await User.findById(userId);
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  return { resetToken, message: "OTP verified. Proceed to reset password." };
};

/**
 * Resend Password OTP
 */
const resendPasswordOtp = async (userId) => {
   const result = await otpService.resendResetOTP(userId);
   
   await emailService.sendPasswordResetEmail(result.email, result.name, result.otp);

   return { message: "OTP resent successfully." };
};

/**
 * Reset Password — Validate token and set new password
 */
const resetPassword = async (resetToken, newPassword) => {
  // Hash token to compare with database
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error("Invalid or expired password reset token.");
    error.statusCode = 400;
    throw error;
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.isVerified = true; // Auto verify user when they set their password
  await user.save();

  return { message: "Password updated successfully." };
};

module.exports = {
  signup,
  login,
  generateToken,
  forgotPassword,
  verifyPasswordOtp,
  resendPasswordOtp,
  resetPassword,
};

const crypto = require("crypto");
const User = require("../models/User.js");
const emailService = require("./emailService.js");

/**
 * Create a new organizer — Admin only.
 * Creates organizer without a preset password, generates an invitation link,
 * and sends an email via Brevo.
 */
const createOrganizer = async ({ name, email }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email is already registered.");
    error.statusCode = 409;
    throw error;
  }

  // Generate a temporary secure password (since schema requires one)
  const tempPassword = crypto.randomBytes(16).toString("hex");

  const organizer = await User.create({
    name,
    email,
    password: tempPassword,
    role: "organizer",
    isVerified: true, // Organizers do not need standard signup OTP verification
  });

  // Generate invitation/password reset token
  const invitationToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(invitationToken).digest("hex");

  organizer.resetPasswordToken = hashedToken;
  organizer.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours to set password
  await organizer.save();

  // Send invitation link
  const rawClientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const clientUrl = rawClientUrl.endsWith("/") ? rawClientUrl.slice(0, -1) : rawClientUrl;
  const invitationLink = `${clientUrl}/reset-password?token=${invitationToken}&email=${encodeURIComponent(organizer.email)}`;

  let emailSent = false;
  try {
    await emailService.sendOrganizerInvitation(organizer.email, organizer.name, invitationLink);
    emailSent = true;
  } catch (error) {
    console.error("Failed to send organizer invitation email:", error.message);
  }

  return {
    id: organizer._id,
    name: organizer.name,
    email: organizer.email,
    role: organizer.role,
    isVerified: organizer.isVerified,
    createdAt: organizer.createdAt,
    emailSent,
    invitationLink,
  };
};

/**
 * Get all organizers.
 */
const getAllOrganizers = async () => {
  const organizers = await User.find({ role: "organizer" }).select("-password");
  return organizers;
};

/**
 * Get a single organizer by ID.
 */
const getOrganizerById = async (id) => {
  const organizer = await User.findOne({ _id: id, role: "organizer" }).select("-password");
  if (!organizer) {
    const error = new Error("Organizer not found.");
    error.statusCode = 404;
    throw error;
  }
  return organizer;
};

/**
 * Delete an organizer by ID.
 */
const deleteOrganizer = async (id) => {
  const organizer = await User.findOneAndDelete({ _id: id, role: "organizer" });
  if (!organizer) {
    const error = new Error("Organizer not found.");
    error.statusCode = 404;
    throw error;
  }
  return { message: "Organizer deleted successfully." };
};

module.exports = {
  createOrganizer,
  getAllOrganizers,
  getOrganizerById,
  deleteOrganizer,
};

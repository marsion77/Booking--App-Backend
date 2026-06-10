const getTransporter = require("../config/mail.js");

const fromEmail = process.env.FROM_EMAIL || "marison399@gmail.com";

const sendMailSafe = async (mailOptions) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    const error = new Error("Failed to send email. SMTP variables are missing on the server.");
    error.statusCode = 503;
    throw error;
  }
  try {
    await getTransporter().sendMail(mailOptions);
  } catch (err) {
    const error = new Error(`Email delivery failed: ${err.message}`);
    error.statusCode = 503;
    throw error;
  }
};
/**
 * Send OTP verification email to user.
 */
const sendOTPEmail = async (toEmail, userName, otp) => {
  const mailOptions = {
    from: `"EventSphere" <${fromEmail}>`,
    to: toEmail,
    subject: "Verify Your EventSphere Account",
    html: `
      <div style="font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: auto; border: 1px solid #2d3548; border-radius: 16px; overflow: hidden; background-color: #12151D; color: #FFFFFF; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="background-color: #1F2533; border-bottom: 2px solid #F84464; padding: 32px 24px; text-align: center;">
          <h1 style="color: #F84464; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">EventSphere</h1>
          <p style="color: #9CA3AF; margin: 6px 0 0; font-size: 14px; font-weight: 500;">Smart Event & Ticket Booking</p>
        </div>
        <div style="padding: 32px 24px; background-color: #1F2533;">
          <p style="font-size: 16px; color: #E5E7EB; margin-top: 0;">Hello <strong style="color: #FFFFFF;">${userName}</strong>,</p>
          <p style="font-size: 14px; color: #9CA3AF; line-height: 1.6;">Use the following OTP to verify your account. It is valid for <strong style="color: #F84464;">5 minutes</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background: #12151D; color: #F84464; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 36px; border-radius: 12px; border: 2px dashed #F84464; text-shadow: 0 0 10px rgba(248, 68, 100, 0.2);">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #6B7280; text-align: center; margin-bottom: 0;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  await sendMailSafe(mailOptions);
};

/**
 * Send booking confirmation email to user.
 */
const sendBookingConfirmation = async (toEmail, userName, bookingDetails) => {
  const { eventTitle, numberOfTickets, totalAmount, eventDate, location, seats } = bookingDetails;
  const seatsStr = seats && seats.length > 0 ? seats.join(", ") : "N/A";

  const mailOptions = {
    from: `"EventSphere" <${fromEmail}>`,
    to: toEmail,
    subject: `Booking Confirmed – ${eventTitle}`,
    html: `
      <div style="font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: auto; border: 1px solid #2d3548; border-radius: 16px; overflow: hidden; background-color: #12151D; color: #FFFFFF; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="background-color: #1F2533; border-bottom: 2px solid #22c55e; padding: 32px 24px; text-align: center;">
          <h1 style="color: #22c55e; margin: 0; font-size: 26px; font-weight: 700;">🎉 Booking Confirmed!</h1>
          <p style="color: #9CA3AF; margin: 6px 0 0; font-size: 14px;">Your tickets are ready for the show</p>
        </div>
        <div style="padding: 32px 24px; background-color: #1F2533;">
          <p style="font-size: 16px; color: #E5E7EB; margin-top: 0;">Hello <strong style="color: #FFFFFF;">${userName}</strong>,</p>
          <p style="font-size: 14px; color: #9CA3AF; line-height: 1.6;">Your booking has been successfully confirmed. Here are your ticket details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #12151D; border-radius: 12px; overflow: hidden;">
            <tr>
              <td style="padding: 12px 16px; color: #9CA3AF; font-size: 13px; border-bottom: 1px solid #2d3548;">Event</td>
              <td style="padding: 12px 16px; font-weight: 600; color: #FFFFFF; border-bottom: 1px solid #2d3548;">${eventTitle}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #9CA3AF; font-size: 13px; border-bottom: 1px solid #2d3548;">Date</td>
              <td style="padding: 12px 16px; color: #E5E7EB; border-bottom: 1px solid #2d3548;">${new Date(eventDate).toLocaleDateString("en-IN", { dateStyle: "long" })}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #9CA3AF; font-size: 13px; border-bottom: 1px solid #2d3548;">Location</td>
              <td style="padding: 12px 16px; color: #E5E7EB; border-bottom: 1px solid #2d3548;">${location}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #9CA3AF; font-size: 13px; border-bottom: 1px solid #2d3548;">Tickets</td>
              <td style="padding: 12px 16px; color: #E5E7EB; border-bottom: 1px solid #2d3548;">${numberOfTickets}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #9CA3AF; font-size: 13px; border-bottom: 1px solid #2d3548;">Seats</td>
              <td style="padding: 12px 16px; color: #F84464; font-weight: 600; border-bottom: 1px solid #2d3548;">${seatsStr}</td>
            </tr>
            <tr>
              <td style="padding: 16px; color: #9CA3AF; font-size: 14px; font-weight: 600;">Total Paid</td>
              <td style="padding: 16px; font-weight: 700; color: #22c55e; font-size: 18px;">₹${totalAmount}</td>
            </tr>
          </table>
          
          <p style="font-size: 13px; color: #6B7280; text-align: center; margin-bottom: 0; margin-top: 24px;">Thank you for booking with EventSphere!</p>
        </div>
      </div>
    `,
  };

  await sendMailSafe(mailOptions);
};

/**
 * Send password reset email.
 */
const sendPasswordResetEmail = async (toEmail, userName, otp) => {
  const mailOptions = {
    from: `"EventSphere" <${fromEmail}>`,
    to: toEmail,
    subject: "Reset Your Password – EventSphere",
    html: `
      <div style="font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: auto; border: 1px solid #2d3548; border-radius: 16px; overflow: hidden; background-color: #12151D; color: #FFFFFF; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="background-color: #1F2533; border-bottom: 2px solid #ef4444; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ef4444; margin: 0; font-size: 26px; font-weight: 700;">🔒 Password Reset</h1>
          <p style="color: #9CA3AF; margin: 6px 0 0; font-size: 14px;">Secure account recovery</p>
        </div>
        <div style="padding: 32px 24px; background-color: #1F2533;">
          <p style="font-size: 16px; color: #E5E7EB; margin-top: 0;">Hello <strong style="color: #FFFFFF;">${userName}</strong>,</p>
          <p style="font-size: 14px; color: #9CA3AF; line-height: 1.6;">You requested a password reset. Use the following OTP to reset your password. It is valid for <strong style="color: #ef4444;">5 minutes</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background: #12151D; color: #ef4444; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 36px; border-radius: 12px; border: 2px dashed #ef4444; text-shadow: 0 0 10px rgba(239, 68, 68, 0.2);">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #6B7280; text-align: center; margin-bottom: 0;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  await sendMailSafe(mailOptions);
};

/**
 * Send organizer invitation setup password email.
 */
const sendOrganizerInvitation = async (toEmail, userName, invitationLink) => {
  const mailOptions = {
    from: `"EventSphere" <${fromEmail}>`,
    to: toEmail,
    subject: "Setup Your EventSphere Organizer Account",
    html: `
      <div style="font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: auto; border: 1px solid #2d3548; border-radius: 16px; overflow: hidden; background-color: #12151D; color: #FFFFFF; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="background-color: #1F2533; border-bottom: 2px solid #F84464; padding: 32px 24px; text-align: center;">
          <h1 style="color: #F84464; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px;">Welcome to EventSphere!</h1>
          <p style="color: #9CA3AF; margin: 6px 0 0; font-size: 14px;">Organizer Account Invitation</p>
        </div>
        <div style="padding: 32px 24px; background-color: #1F2533;">
          <p style="font-size: 16px; color: #E5E7EB; margin-top: 0;">Hello <strong style="color: #FFFFFF;">${userName}</strong>,</p>
          <p style="font-size: 14px; color: #9CA3AF; line-height: 1.6;">You have been registered as an Event Organizer by the Super Admin.</p>
          <p style="font-size: 14px; color: #9CA3AF; line-height: 1.6;">To get started, click the button below to set your account password:</p>
          <div style="text-align: center; margin: 36px 0;">
            <a href="${invitationLink}" style="display: inline-block; background-color: #F84464; color: #ffffff; font-size: 16px; font-weight: 600; padding: 14px 32px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 14px rgba(248, 68, 100, 0.4); transition: background-color 0.2s;">Set Password</a>
          </div>
          <p style="font-size: 13px; color: #6B7280; text-align: center; margin-bottom: 0;">If you did not request this, please ignore this email or contact the administrator.</p>
        </div>
      </div>
    `,
  };

  await sendMailSafe(mailOptions);
};

module.exports = {
  sendOTPEmail,
  sendBookingConfirmation,
  sendPasswordResetEmail,
  sendOrganizerInvitation,
};

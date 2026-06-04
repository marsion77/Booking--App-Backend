const User = require("../models/User.js");
const Event = require("../models/Event.js");
const Booking = require("../models/Booking.js");

/**
 * Admin Dashboard: overview stats.
 */
const getAdminDashboard = async () => {
  const [totalUsers, totalOrganizers, totalEvents, pendingEvents, approvedEvents, bookings, revenue] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "organizer" }),
      Event.countDocuments(),
      Event.countDocuments({ status: "pending" }),
      Event.countDocuments({ status: "approved" }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { bookingStatus: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

  return {
    totalUsers,
    totalOrganizers,
    totalEvents,
    pendingEvents,
    approvedEvents,
    totalBookings: bookings,
    totalRevenue: revenue[0]?.total || 0,
  };
};

/**
 * Admin: get all users list.
 */
const getAllUsers = async () => {
  return User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
};

/**
 * Organizer Dashboard: their events + booking stats.
 */
const getOrganizerDashboard = async (organizerId) => {
  const events = await Event.find({ organizerId });
  const eventIds = events.map((e) => e._id);

  const [totalBookings, confirmedBookings, revenue] = await Promise.all([
    Booking.countDocuments({ eventId: { $in: eventIds } }),
    Booking.countDocuments({ eventId: { $in: eventIds }, bookingStatus: "confirmed" }),
    Booking.aggregate([
      { $match: { eventId: { $in: eventIds }, bookingStatus: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  return {
    totalEvents: events.length,
    approvedEvents: events.filter((e) => e.status === "approved").length,
    pendingEvents: events.filter((e) => e.status === "pending").length,
    totalBookings,
    confirmedBookings,
    totalRevenue: revenue[0]?.total || 0,
    events,
  };
};

/**
 * User Dashboard: booking history.
 */
const getUserDashboard = async (userId) => {
  const bookings = await Booking.find({ userId })
    .populate("eventId", "title eventDate location price image")
    .sort({ createdAt: -1 });

  const totalSpent = bookings
    .filter((b) => b.bookingStatus === "confirmed")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter((b) => b.bookingStatus === "confirmed").length,
    cancelledBookings: bookings.filter((b) => b.bookingStatus === "cancelled").length,
    totalSpent,
    bookings,
  };
};

module.exports = {
  getAdminDashboard,
  getAllUsers,
  getOrganizerDashboard,
  getUserDashboard,
};

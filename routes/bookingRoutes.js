const express = require("express");
const {
  createBooking, getUserBookings, getOrganizerBookings,
  getBookingById, cancelBooking,
} = require("../controllers/bookingController.js");
const authenticate = require("../middlewares/auth.js");
const authorize = require("../middlewares/role.js");

const router = express.Router();

// User routes
router.post("/", authenticate, authorize("user"), createBooking);
router.get("/", authenticate, authorize("user"), getUserBookings);
router.get("/:id", authenticate, getBookingById);
router.patch("/:id/cancel", authenticate, authorize("user"), cancelBooking);

// Organizer route — view bookings for their events
router.get("/organizer/bookings", authenticate, authorize("organizer"), getOrganizerBookings);

module.exports = router;

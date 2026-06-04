const Booking = require("../models/Booking.js");
const Event = require("../models/Event.js");
const User = require("../models/User.js");
const emailService = require("./emailService.js");

const createBooking = async (userId, { eventId, seats, numberOfTickets }) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const e = new Error("Event not found.");
    e.statusCode = 404;
    throw e;
  }
  if (event.status !== "approved") {
    const e = new Error("Only approved events can be booked.");
    e.statusCode = 400;
    throw e;
  }
  if (new Date(event.eventDate) < new Date()) {
    const e = new Error("Cannot book past events.");
    e.statusCode = 400;
    throw e;
  }

  // Handle seat-based booking if event has a seatsLayout
  let bookedSeats = [];
  let calculatedTickets = parseInt(numberOfTickets, 10) || 0;

  if (event.seatsLayout && event.seatsLayout.length > 0) {
    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      const e = new Error("Please select specific seats for this event.");
      e.statusCode = 400;
      throw e;
    }
    bookedSeats = seats;
    calculatedTickets = seats.length;

    // Concurrency / availability check
    for (const seatNum of bookedSeats) {
      let found = false;
      for (const row of event.seatsLayout) {
        const match = row.seats.find((s) => s.seatNumber === seatNum);
        if (match) {
          found = true;
          if (match.isBooked) {
            const e = new Error(`Seat ${seatNum} is already booked.`);
            e.statusCode = 409;
            throw e;
          }
          if (match.isBlocked) {
            const e = new Error(`Seat ${seatNum} is blocked.`);
            e.statusCode = 400;
            throw e;
          }
        }
      }
      if (!found) {
        const e = new Error(`Seat ${seatNum} does not exist in event layout.`);
        e.statusCode = 400;
        throw e;
      }
    }

    // Mark seats as booked in the layout
    for (const seatNum of bookedSeats) {
      for (const row of event.seatsLayout) {
        const match = row.seats.find((s) => s.seatNumber === seatNum);
        if (match) {
          match.isBooked = true;
        }
      }
    }
    event.availableSeats -= calculatedTickets;
    await event.save();
  } else {
    // Fallback for events without a custom layout
    if (calculatedTickets <= 0) {
      const e = new Error("Number of tickets must be at least 1.");
      e.statusCode = 400;
      throw e;
    }
    if (calculatedTickets > event.availableSeats) {
      const e = new Error(`Only ${event.availableSeats} seat(s) remaining.`);
      e.statusCode = 400;
      throw e;
    }

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gte: calculatedTickets } },
      { $inc: { availableSeats: -calculatedTickets } },
      { new: true }
    );
    if (!updatedEvent) {
      const e = new Error("Seats no longer available.");
      e.statusCode = 409;
      throw e;
    }
  }

  const totalAmount = calculatedTickets * event.price;
  try {
    const booking = await Booking.create({
      userId,
      eventId,
      numberOfTickets: calculatedTickets,
      seats: bookedSeats,
      totalAmount,
      bookingStatus: "confirmed",
    });

    // Send confirmation email to the user
    try {
      const user = await User.findById(userId);
      if (user) {
        await emailService.sendBookingConfirmation(user.email, user.name, {
          eventTitle: event.title,
          numberOfTickets: calculatedTickets,
          totalAmount,
          eventDate: event.eventDate,
          location: event.location,
          seats: bookedSeats,
        });
      }
    } catch (emailErr) {
      console.error("❌ Failed to send booking confirmation email:", emailErr);
    }

    return booking;
  } catch (err) {
    // Restore seats if booking failed
    if (event.seatsLayout && event.seatsLayout.length > 0) {
      const freshEvent = await Event.findById(eventId);
      if (freshEvent) {
        for (const seatNum of bookedSeats) {
          for (const row of freshEvent.seatsLayout) {
            const match = row.seats.find((s) => s.seatNumber === seatNum);
            if (match) match.isBooked = false;
          }
        }
        freshEvent.availableSeats += calculatedTickets;
        await freshEvent.save();
      }
    } else {
      await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: calculatedTickets } });
    }
    throw err;
  }
};

const getBookingById = async (bookingId, userId, userRole) => {
  const booking = await Booking.findById(bookingId)
    .populate("eventId", "title eventDate location price image organizerId")
    .populate("userId", "name email phone");
  if (!booking) {
    const e = new Error("Booking not found.");
    e.statusCode = 404;
    throw e;
  }

  // Access validation: Admin (all), Organizer (own events), User (own bookings)
  if (userRole !== "admin") {
    if (userRole === "organizer") {
      if (booking.eventId?.organizerId.toString() !== userId.toString()) {
        const e = new Error("Unauthorized access to booking details.");
        e.statusCode = 403;
        throw e;
      }
    } else {
      if (booking.userId?._id.toString() !== userId.toString()) {
        const e = new Error("Unauthorized access to booking details.");
        e.statusCode = 403;
        throw e;
      }
    }
  }

  return booking;
};

const getUserBookings = async (userId) => {
  return Booking.find({ userId })
    .populate("eventId", "title eventDate location price image status")
    .sort({ createdAt: -1 });
};

const getOrganizerBookings = async (organizerId) => {
  const events = await Event.find({ organizerId }).select("_id");
  const eventIds = events.map((e) => e._id);
  return Booking.find({ eventId: { $in: eventIds } })
    .populate("eventId", "title eventDate location price")
    .populate("userId", "name email phone")
    .sort({ createdAt: -1 });
};

const cancelBooking = async (bookingId, userId) => {
  const booking = await Booking.findOne({ _id: bookingId, userId });
  if (!booking) {
    const e = new Error("Booking not found.");
    e.statusCode = 404;
    throw e;
  }
  if (booking.bookingStatus === "cancelled") {
    const e = new Error("Already cancelled.");
    e.statusCode = 400;
    throw e;
  }

  // Restore seats/layout
  const event = await Event.findById(booking.eventId);
  if (event) {
    if (booking.seats && booking.seats.length > 0 && event.seatsLayout && event.seatsLayout.length > 0) {
      for (const seatNum of booking.seats) {
        for (const row of event.seatsLayout) {
          const match = row.seats.find((s) => s.seatNumber === seatNum);
          if (match) match.isBooked = false;
        }
      }
      event.availableSeats += booking.numberOfTickets;
      await event.save();
    } else {
      await Event.findByIdAndUpdate(booking.eventId, { $inc: { availableSeats: booking.numberOfTickets } });
    }
  }

  booking.bookingStatus = "cancelled";
  await booking.save();
  return { message: "Booking cancelled successfully.", booking };
};

module.exports = {
  createBooking,
  getBookingById,
  getUserBookings,
  getOrganizerBookings,
  cancelBooking,
};

const Event = require("../models/Event.js");

/**
 * Create a new event — Organizer only.
 * Status defaults to "pending" until admin approves.
 */
const createEvent = async (organizerId, eventData) => {
  if (eventData.eventDate && new Date(eventData.eventDate) < new Date()) {
    const error = new Error("Event date must be in the future.");
    error.statusCode = 400;
    throw error;
  }

  // Calculate totalSeats from seatsLayout if provided
  let calculatedSeats = parseInt(eventData.totalSeats, 10) || 0;
  if (eventData.seatsLayout && Array.isArray(eventData.seatsLayout)) {
    let count = 0;
    eventData.seatsLayout.forEach((row) => {
      if (row.seats && Array.isArray(row.seats)) {
        row.seats.forEach((seat) => {
          if (!seat.isBlocked) count++;
        });
      }
    });
    if (count > 0) {
      calculatedSeats = count;
    }
  }

  const event = await Event.create({
    ...eventData,
    organizerId,
    totalSeats: calculatedSeats,
    availableSeats: calculatedSeats, // Initially all seats are available
    status: "pending",
  });
  return event;
};

/**
 * Get all events created by a specific organizer.
 */
const getOrganizerEvents = async (organizerId) => {
  const events = await Event.find({ organizerId }).sort({ createdAt: -1 });
  return events;
};

/**
 * Get a single event by ID.
 */
const getEventById = async (eventId) => {
  const event = await Event.findById(eventId).populate("organizerId", "name email phone");
  if (!event) {
    const error = new Error("Event not found.");
    error.statusCode = 404;
    throw error;
  }
  return event;
};

/**
 * Update an event — only the owning organizer can update.
 */
const updateEvent = async (eventId, organizerId, updateData) => {
  const event = await Event.findOne({ _id: eventId, organizerId });

  if (!event) {
    const error = new Error("Event not found or you are not authorized to update it.");
    error.statusCode = 404;
    throw error;
  }

  if (updateData.eventDate && new Date(updateData.eventDate) < new Date()) {
    const error = new Error("Event date must be in the future.");
    error.statusCode = 400;
    throw error;
  }

  // If seatsLayout is modified, re-calculate seats
  if (updateData.seatsLayout && Array.isArray(updateData.seatsLayout)) {
    let count = 0;
    let bookedCount = 0;
    updateData.seatsLayout.forEach((row) => {
      if (row.seats && Array.isArray(row.seats)) {
        row.seats.forEach((seat) => {
          if (!seat.isBlocked) {
            count++;
            if (seat.isBooked) bookedCount++;
          }
        });
      }
    });
    updateData.totalSeats = count;
    updateData.availableSeats = count - bookedCount;
  } else if (updateData.totalSeats !== undefined && updateData.totalSeats !== event.totalSeats) {
    const bookedSeats = event.totalSeats - event.availableSeats;
    const newAvailable = updateData.totalSeats - bookedSeats;

    if (newAvailable < 0) {
      const error = new Error(
        `Cannot reduce total seats below already booked count (${bookedSeats}).`
      );
      error.statusCode = 400;
      throw error;
    }
    updateData.availableSeats = newAvailable;
  }

  Object.assign(event, updateData);
  await event.save();
  return event;
};

/**
 * Delete an event — only the owning organizer can delete.
 */
const deleteEvent = async (eventId, organizerId) => {
  const event = await Event.findOneAndDelete({ _id: eventId, organizerId });

  if (!event) {
    const error = new Error("Event not found or you are not authorized to delete it.");
    error.statusCode = 404;
    throw error;
  }

  return { message: "Event deleted successfully." };
};

/**
 * Admin: Get ALL events (any status).
 */
const getAllEvents = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;

  const events = await Event.find(query)
    .populate("organizerId", "name email")
    .sort({ createdAt: -1 });
  return events;
};

/**
 * User: Get only approved events.
 */
const getApprovedEvents = async () => {
  const events = await Event.find({ status: "approved" })
    .populate("organizerId", "name email")
    .sort({ eventDate: 1 });
  return events;
};

/**
 * Admin: Approve an event.
 */
const approveEvent = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error("Event not found.");
    error.statusCode = 404;
    throw error;
  }

  event.status = "approved";
  await event.save();
  return event;
};

/**
 * Admin: Reject an event.
 */
const rejectEvent = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error("Event not found.");
    error.statusCode = 404;
    throw error;
  }

  event.status = "rejected";
  await event.save();
  return event;
};

module.exports = {
  createEvent,
  getOrganizerEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getApprovedEvents,
  approveEvent,
  rejectEvent,
};

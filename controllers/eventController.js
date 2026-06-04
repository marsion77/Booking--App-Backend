const eventService = require("../services/eventService.js");

/** POST /api/events — Create event (Organizer). */
const createEvent = async (req, res, next) => {
  try {
    const eventData = { ...req.body };
    if (req.file) eventData.image = req.file.filename;
    
    // Parse seatsLayout if it's sent as a stringified JSON (due to form-data upload)
    if (eventData.seatsLayout && typeof eventData.seatsLayout === "string") {
      try {
        eventData.seatsLayout = JSON.parse(eventData.seatsLayout);
      } catch (e) {
        console.error("Failed to parse seatsLayout JSON string:", e.message);
      }
    }

    const event = await eventService.createEvent(req.user._id, eventData);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

/** GET /api/events/organizer — Get organizer's own events. */
const getOrganizerEvents = async (req, res, next) => {
  try {
    const events = await eventService.getOrganizerEvents(req.user._id);
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err) {
    next(err);
  }
};

/** GET /api/events/approved — Get approved events (public/user). */
const getApprovedEvents = async (_req, res, next) => {
  try {
    const events = await eventService.getApprovedEvents();
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err) {
    next(err);
  }
};

/** GET /api/events/all — Get all events (Admin). */
const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents({
      status: req.query.status,
    });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err) {
    next(err);
  }
};

/** GET /api/events/:id — Get single event. */
const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/events/:id — Update event (Organizer). */
const updateEvent = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = req.file.filename;

    // Parse seatsLayout if it's sent as a stringified JSON (due to form-data upload)
    if (updateData.seatsLayout && typeof updateData.seatsLayout === "string") {
      try {
        updateData.seatsLayout = JSON.parse(updateData.seatsLayout);
      } catch (e) {
        console.error("Failed to parse seatsLayout JSON string:", e.message);
      }
    }

    const event = await eventService.updateEvent(
      req.params.id,
      req.user._id,
      updateData
    );
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/events/:id — Delete event (Organizer). */
const deleteEvent = async (req, res, next) => {
  try {
    const result = await eventService.deleteEvent(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/events/:id/approve — Approve event (Admin). */
const approveEvent = async (req, res, next) => {
  try {
    const event = await eventService.approveEvent(req.params.id);
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/events/:id/reject — Reject event (Admin). */
const rejectEvent = async (req, res, next) => {
  try {
    const event = await eventService.rejectEvent(req.params.id);
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createEvent,
  getOrganizerEvents,
  getApprovedEvents,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
};

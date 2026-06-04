const express = require("express");
const {
  createEvent, getOrganizerEvents, getApprovedEvents, getAllEvents,
  getEventById, updateEvent, deleteEvent, approveEvent, rejectEvent,
} = require("../controllers/eventController.js");
const authenticate = require("../middlewares/auth.js");
const authorize = require("../middlewares/role.js");
const upload = require("../config/multer.js");

const router = express.Router();

// Public — approved events
router.get("/approved", getApprovedEvents);

// Public — single event detail
router.get("/:id", getEventById);

// Organizer routes
router.post("/", authenticate, authorize("organizer"), upload.single("image"), createEvent);
router.get("/organizer/my-events", authenticate, authorize("organizer"), getOrganizerEvents);
router.put("/:id", authenticate, authorize("organizer"), upload.single("image"), updateEvent);
router.delete("/:id", authenticate, authorize("organizer"), deleteEvent);

// Admin routes
router.get("/admin/all", authenticate, authorize("admin"), getAllEvents);
router.patch("/:id/approve", authenticate, authorize("admin"), approveEvent);
router.patch("/:id/reject", authenticate, authorize("admin"), rejectEvent);

module.exports = router;

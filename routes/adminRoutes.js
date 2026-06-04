const express = require("express");
const { createOrganizer, getOrganizers, getOrganizerById, deleteOrganizer } = require("../controllers/adminController.js");
const authenticate = require("../middlewares/auth.js");
const authorize = require("../middlewares/role.js");

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize("admin"));

// POST   /api/admin/organizer      — Create organizer
router.post("/organizer", createOrganizer);

// GET    /api/admin/organizers      — List all organizers
router.get("/organizers", getOrganizers);

// GET    /api/admin/organizer/:id   — Get single organizer
router.get("/organizer/:id", getOrganizerById);

// DELETE /api/admin/organizer/:id   — Delete organizer
router.delete("/organizer/:id", deleteOrganizer);

module.exports = router;

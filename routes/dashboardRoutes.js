const express = require("express");
const {
  getAdminDashboard, getAllUsers,
  getOrganizerDashboard, getUserDashboard,
} = require("../controllers/dashboardController.js");
const authenticate = require("../middlewares/auth.js");
const authorize = require("../middlewares/role.js");

const router = express.Router();

// Admin dashboard
router.get("/admin", authenticate, authorize("admin"), getAdminDashboard);
router.get("/admin/users", authenticate, authorize("admin"), getAllUsers);

// Organizer dashboard
router.get("/organizer", authenticate, authorize("organizer"), getOrganizerDashboard);

// User dashboard
router.get("/user", authenticate, authorize("user"), getUserDashboard);

module.exports = router;

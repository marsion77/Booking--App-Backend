const dashboardService = require("../services/dashboardService.js");

/** GET /api/dashboard/admin — Admin dashboard. */
const getAdminDashboard = async (_req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/** GET /api/dashboard/admin/users — Admin: list all users. */
const getAllUsers = async (_req, res, next) => {
  try {
    const users = await dashboardService.getAllUsers();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

/** GET /api/dashboard/organizer — Organizer dashboard. */
const getOrganizerDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getOrganizerDashboard(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/** GET /api/dashboard/user — User dashboard. */
const getUserDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getUserDashboard(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
  getAdminDashboard,
  getAllUsers,
  getOrganizerDashboard,
  getUserDashboard,
};

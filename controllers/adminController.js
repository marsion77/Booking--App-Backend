const organizerService = require("../services/organizerService.js");

/**
 * POST /api/admin/organizer — Create organizer (Admin only).
 */
const createOrganizer = async (req, res, next) => {
  try {
    const organizer = await organizerService.createOrganizer(req.body);
    res.status(201).json({ success: true, data: organizer });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/organizers — List all organizers (Admin only).
 */
const getOrganizers = async (_req, res, next) => {
  try {
    const organizers = await organizerService.getAllOrganizers();
    res.status(200).json({ success: true, count: organizers.length, data: organizers });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/organizer/:id — Get single organizer (Admin only).
 */
const getOrganizerById = async (req, res, next) => {
  try {
    const organizer = await organizerService.getOrganizerById(req.params.id);
    res.status(200).json({ success: true, data: organizer });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/organizer/:id — Delete organizer (Admin only).
 */
const deleteOrganizer = async (req, res, next) => {
  try {
    const result = await organizerService.deleteOrganizer(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrganizer,
  getOrganizers,
  getOrganizerById,
  deleteOrganizer,
};

require("./config/env.js");
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db.js");
const { seedSuperAdmin } = require("./services/seedService.js");
const errorHandler = require("./middlewares/errorHandler.js");

// Route imports
const authRoutes = require("./routes/authRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const eventRoutes = require("./routes/eventRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");
const dashboardRoutes = require("./routes/dashboardRoutes.js");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// ─── GLOBAL MIDDLEWARE ───────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use("/uploads", express.static(uploadsDir));

// ─── API ROUTES ──────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ─── HEALTH CHECK ────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "🚀 EventSphere API is running",
    version: "1.0.0",
  });
});

// ─── 404 HANDLER ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────
app.use(errorHandler);

// ─── START SERVER ────────────────────────────────────────
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();
  await seedSuperAdmin();

  app.listen(PORT, () => {
    console.log(`\n🚀 EventSphere Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}\n`);
  });
};

startServer();

module.exports = app;

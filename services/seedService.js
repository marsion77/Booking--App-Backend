const User = require("../models/User");

const seedSuperAdmin = async () => {
  try {
    const adminEmail = "admin@eventsphere.com";
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log("🌱 Seeding Super Admin user...");
      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: "AdminPassword123",
        phone: "0000000000",
        role: "admin",
        isVerified: true,
      });
      console.log("✅ Super Admin user seeded successfully!");
    } else {
      console.log("🌿 Super Admin already exists. Resetting password and verification status to ensure access...");
      admin.password = "AdminPassword123";
      admin.role = "admin";
      admin.isVerified = true;
      await admin.save();
      console.log("✅ Super Admin credentials updated/reset successfully!");
    }
  } catch (error) {
    console.error("❌ Error seeding Super Admin:", error.message);
  }
};

module.exports = { seedSuperAdmin };

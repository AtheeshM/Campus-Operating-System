require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDatabase = require("../config/database");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await connectDatabase();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env"
      );
    }

    const normalizedEmail = adminEmail.trim().toLowerCase();

    const existingAdmin = await User.findOne({
      email: normalizedEmail,
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await User.create({
      email: normalizedEmail,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    });

    console.log("Initial Admin created successfully.");
    console.log(`Admin email: ${normalizedEmail}`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create Admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
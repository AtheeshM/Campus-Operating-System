const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const password = "Admin@123";
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.findOneAndUpdate(
      {
        email: "admin@campusos.local",
      },
      {
        passwordHash,
      },
      {
        new: true,
      }
    );

    if (!user) {
      throw new Error("Admin user not found");
    }

    console.log("=================================");
    console.log("Admin password reset successfully");
    console.log("Email   :", user.email);
    console.log("Password: Admin@123");
    console.log("=================================");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Admin password reset failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

resetPassword();
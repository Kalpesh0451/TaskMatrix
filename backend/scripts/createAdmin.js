
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Admin environment variables are missing");
    }

    if (ADMIN_PASSWORD.length < 6) {
      throw new Error("Password must contain at least 6 characters");
    }

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    let admin = await User.findOne({ email });

    if (admin) {
      admin.name = ADMIN_NAME.trim();
      admin.password = hashedPassword;
      admin.role = "admin";
      admin.isActive = true;

      await admin.save();

      console.log("Existing account updated as Admin successfully!");
    } else {
      await User.create({
        name: ADMIN_NAME.trim(),
        email,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });

      console.log("Admin account created successfully!");
    }

    console.log("Admin email:", email);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();

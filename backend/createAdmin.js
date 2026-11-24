
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env")
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const createAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env");
    }

    if (password.length < 12) {
      throw new Error("Admin password must be at least 12 characters");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      if (existingAdmin.role === "admin") {
        console.log("Admin account already exists.");
      } else {
        throw new Error("This email already exists with another role.");
      }

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: "Helpora Admin",
      email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin account created successfully!");

  } catch (error) {
    console.error("Admin creation error:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();

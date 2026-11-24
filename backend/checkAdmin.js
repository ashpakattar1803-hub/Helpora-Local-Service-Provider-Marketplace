const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const User = require("./models/User");

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const admin = await User.findOne({
      email: "admin@helpora.com"
    }).select("name email role isActive");

    if (!admin) {
      console.log("Admin account NOT FOUND");
    } else {
      console.log({
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive
      });
    }
  } catch (error) {
    console.log("Verification error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdmin();

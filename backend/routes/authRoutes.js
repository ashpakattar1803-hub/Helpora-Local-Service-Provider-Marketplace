
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser
} = require("../controllers/authController");

const {
  protect
} = require("../middleware/authMiddleware");

// User Registration
router.post("/register", registerUser);

// User Login
router.post("/login", loginUser);

// Protected User Profile
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated!",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;

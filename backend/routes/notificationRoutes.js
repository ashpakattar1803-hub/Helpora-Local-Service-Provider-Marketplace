
const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  deleteNotification
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

// Get logged-in user's notifications
router.get("/", protect, getMyNotifications);

// Get unread notification count
router.get("/unread-count", protect, getUnreadCount);

// Mark notification as read
router.patch("/:id/read", protect, markNotificationAsRead);

// Delete notification
router.delete("/:id", protect, deleteNotification);

module.exports = router;


const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

// Create category - Admin only
router.post("/", protect, authorize("admin"), createCategory);

// Get all categories - Public
router.get("/", getCategories);

// Update category - Admin only
router.put("/:id", protect, authorize("admin"), updateCategory);

// Delete category - Admin only
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;

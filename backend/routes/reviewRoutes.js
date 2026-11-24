
const express = require("express");
const router = express.Router();

const {
  createReview,
  getProviderReviews,
  getServiceReviews
} = require("../controllers/reviewController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Customer can submit a review
router.post("/", protect, authorize("customer"), createReview);

// Public provider reviews
router.get("/provider/:providerId", getProviderReviews);

// Public service reviews
router.get("/service/:serviceId", getServiceReviews);

module.exports = router;

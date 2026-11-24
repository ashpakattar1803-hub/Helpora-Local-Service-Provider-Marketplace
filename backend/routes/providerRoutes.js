
const express = require("express");
const router = express.Router();

const {
  createProviderProfile,
  getMyProviderProfile,
  updateProviderProfile,
  searchProviders
} = require("../controllers/providerController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

// Public: Search and Filter Providers
router.get("/search", searchProviders);

// Create Provider Profile
router.post(
  "/profile",
  protect,
  authorize("provider"),
  createProviderProfile
);

// Get My Provider Profile
router.get(
  "/profile",
  protect,
  authorize("provider"),
  getMyProviderProfile
);

// Update Provider Profile
router.put(
  "/profile",
  protect,
  authorize("provider"),
  updateProviderProfile
);

module.exports = router;

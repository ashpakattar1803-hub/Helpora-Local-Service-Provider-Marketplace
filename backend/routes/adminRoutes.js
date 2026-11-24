
const express = require("express");
const router = express.Router();

 const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getPendingProviders,
  updateProviderStatus,
  getAllServices,
  updateAnyService,
  updateServiceStatus,
  deleteAnyService
} = require("../controllers/adminController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");
// =================================
// ADMIN DASHBOARD
// =================================

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getDashboardStats
);
// =================================
// USER MANAGEMENT
// =================================

router.get(
  "/users",
  protect,
  authorize("admin"),
  getAllUsers
);

router.patch(
  "/users/:id/status",
  protect,
  authorize("admin"),
  toggleUserStatus
);

// =================================
// PROVIDER MANAGEMENT
// =================================

router.get(
  "/pending-providers",
  protect,
  authorize("admin"),
  getPendingProviders
);

router.put(
  "/providers/:id/status",
  protect,
  authorize("admin"),
  updateProviderStatus
);

// =================================
// SERVICE MANAGEMENT
// =================================

router.get(
  "/services",
  protect,
  authorize("admin"),
  getAllServices
);

router.put(
  "/services/:id",
  protect,
  authorize("admin"),
  updateAnyService
);

router.patch(
  "/services/:id/status",
  protect,
  authorize("admin"),
  updateServiceStatus
);

router.delete(
  "/services/:id",
  protect,
  authorize("admin"),
  deleteAnyService
);

module.exports = router;


const express = require("express");
const router = express.Router();

const {
   createService,
  getServices,
  getServiceById,
  getMyServices,
  updateService,
  toggleServiceStatus,
  deleteService
} = require("../controllers/serviceController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public: Get all services
router.get("/", getServices);

// Provider only: Get own services
router.get("/my-services", protect, authorize("provider"), getMyServices);

// Public: Get single service
router.get("/:id", getServiceById);

// Provider only: Create service
router.post("/", protect, authorize("provider"), createService);

// Provider only: Toggle own service status
router.patch("/:id/status", protect, authorize("provider"), toggleServiceStatus);

// Provider only: Update own service
router.put("/:id", protect, authorize("provider"), updateService);

// Provider only: Deactivate own service
router.delete("/:id", protect, authorize("provider"), deleteService);

module.exports = router;

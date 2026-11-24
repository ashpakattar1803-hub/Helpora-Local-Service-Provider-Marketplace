const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");
const Service = require("../models/Service");
const Category = require("../models/Category");

// =================================
// GET ADMIN DASHBOARD STATISTICS
// =================================
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      totalCustomers,
      totalServices
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "provider" }),
      User.countDocuments({ role: "customer" }),
      Service.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      statistics: {
        totalUsers,
        totalProviders,
        totalCustomers,
        totalServices
      }
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics"
    });
  }
};

// =================================
// GET ALL REGISTERED USERS (ADMIN)
// =================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["customer", "provider"] }
    })
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch registered users"
    });
  }
};

// =================================
// ACTIVATE / DEACTIVATE USER
// =================================
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin account status cannot be changed here"
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Toggle user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user status"
    });
  }
};

// =================================
// GET ALL PENDING PROVIDERS
// =================================
const getPendingProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find({
      verificationStatus: "pending"
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    console.error("Get pending providers error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching pending providers"
    });
  }
};

// =================================
// APPROVE OR REJECT PROVIDER
// =================================
const updateProviderStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected"
      });
    }

    if (
      adminNote !== undefined &&
      typeof adminNote !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin note must be a string"
      });
    }

    if (status === "rejected" && (!adminNote || !adminNote.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a rejection reason"
      });
    }

    const provider = await ProviderProfile.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found"
      });
    }

    provider.verificationStatus = status;
    provider.adminNote = adminNote ? adminNote.trim() : "";

    await provider.save();

    return res.status(200).json({
      success: true,
      message: `Provider ${status} successfully`,
      data: provider
    });
  } catch (error) {
    console.error("Update provider status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating provider status"
    });
  }
};

// =================================
// GET ALL SERVICES (ADMIN)
// =================================
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("provider", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error("Get all services error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching services"
    });
  }
};

// =================================
// UPDATE ANY SERVICE (ADMIN)
// =================================
const updateAnyService = async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "description",
      "category",
      "price",
      "image",
      "location"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update"
      });
    }

    for (const field of ["title", "description", "location"]) {
      if (updates[field] !== undefined) {
        if (
          typeof updates[field] !== "string" ||
          !updates[field].trim()
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a non-empty string`
          });
        }

        updates[field] = updates[field].trim();
      }
    }

    if (updates.price !== undefined) {
      if (
        !Number.isFinite(Number(updates.price)) ||
        Number(updates.price) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number"
        });
      }

      updates.price = Number(updates.price);
    }

    if (updates.category !== undefined) {
      const categoryExists = await Category.findById(updates.category);

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid category"
        });
      }
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("provider", "name email")
      .populate("category", "name");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service
    });
  } catch (error) {
    console.error("Admin update service error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating service"
    });
  }
};

// =================================
// ACTIVATE / DEACTIVATE SERVICE
// =================================
const updateServiceStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false"
      });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: `Service ${isActive ? "activated" : "deactivated"} successfully`,
      data: service
    });
  } catch (error) {
    console.error("Update service status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating service status"
    });
  }
};

// =================================
// DELETE ANY SERVICE (ADMIN)
// =================================
const deleteAnyService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully"
    });
  } catch (error) {
    console.error("Admin delete service error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting service"
    });
  }
};


module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getPendingProviders,
  updateProviderStatus,
  getAllServices,
  updateAnyService,
  updateServiceStatus,
  deleteAnyService
};


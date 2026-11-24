
const Service = require("../models/Service");
const Category = require("../models/Category");
const mongoose = require("mongoose");

// CREATE SERVICE
const createService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      image,
      location
    } = req.body;

    if (!title || !description || !category || price === undefined || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required service details"
      });
    }

    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number"
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists || !categoryExists.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive category"
      });
    }

    const service = await Service.create({
      provider: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      price: Number(price),
      image: image || "",
      location: location.trim()
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service
    });

  } catch (error) {
    console.error("Create service error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating service"
    });
  }
};

// GET ALL ACTIVE SERVICES
const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .populate("provider", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });

  } catch (error) {
    console.error("Get services error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching services"
    });
  }
};
// GET MY SERVICES
const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({
      provider: req.user._id
    })
      .populate("provider", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });

  } catch (error) {
    console.error("Get my services error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching your services"
    });
  }
};

// GET SINGLE SERVICE
const getServiceById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID"
      });
    }

    const service = await Service.findOne({
      _id: req.params.id,
      isActive: true
    })
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
      data: service
    });

  } catch (error) {
    console.error("Get service error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching service"
    });
  }
};
// UPDATE MY SERVICE
const updateService = async (req, res) => {
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

      if (!categoryExists || !categoryExists.isActive) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive category"
        });
      }
    }

    const service = await Service.findOneAndUpdate(
      {
        _id: req.params.id,
        provider: req.user._id
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or you are not its owner"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service
    });

  } catch (error) {
    console.error("Update service error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating service"
    });
  }
};
// TOGGLE MY SERVICE STATUS
const toggleServiceStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID"
      });
    }

    const service = await Service.findOne({
      _id: req.params.id,
      provider: req.user._id
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or you are not its owner"
      });
    }

    service.isActive = !service.isActive;
    await service.save();

    return res.status(200).json({
      success: true,
      message: `Service ${service.isActive ? "activated" : "deactivated"} successfully`,
      data: service
    });

  } catch (error) {
    console.error("Toggle service status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating service status"
    });
  }
};

// DELETE MY SERVICE
const deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      {
        _id: req.params.id,
        provider: req.user._id
      },
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or you are not its owner"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service deactivated successfully"
    });

  } catch (error) {
    console.error("Delete service error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting service"
    });
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  getMyServices,
  updateService,
  toggleServiceStatus,
  deleteService
};

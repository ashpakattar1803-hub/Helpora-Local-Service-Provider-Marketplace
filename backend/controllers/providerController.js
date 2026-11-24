
const ProviderProfile = require("../models/ProviderProfile");

// CREATE PROVIDER PROFILE
const createProviderProfile = async (req, res) => {
  try {
    const {
      businessName,
      category,
      description,
      phone,
      location
    } = req.body;

    if (!businessName || !category || !description || !phone || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required provider details"
      });
    }

    const existingProfile = await ProviderProfile.findOne({
      user: req.user._id
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Provider profile already exists"
      });
    }

    const profile = await ProviderProfile.create({
      user: req.user._id,
      businessName: businessName.trim(),
      category: category.trim(),
      description: description.trim(),
      phone: phone.trim(),
      location: location.trim()
    });

    return res.status(201).json({
      success: true,
      message: "Provider profile created successfully",
      data: profile
    });

  } catch (error) {
    console.error("Provider profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating provider profile"
    });
  }
};

// GET MY PROVIDER PROFILE
const getMyProviderProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({
      user: req.user._id
    }).populate("user", "name email");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Provider profile fetched successfully",
      data: profile
    });

  } catch (error) {
    console.error("Get provider profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching provider profile"
    });
  }
};

// UPDATE PROVIDER PROFILE
const updateProviderProfile = async (req, res) => {
  try {
    const allowedFields = [
      "businessName",
      "category",
      "description",
      "phone",
      "location"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (
          typeof req.body[field] !== "string" ||
          !req.body[field].trim()
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a non-empty string`
          });
        }

        updates[field] = req.body[field].trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update"
      });
    }

    const profile = await ProviderProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Provider profile updated successfully",
      data: profile
    });

  } catch (error) {
    console.error("Update provider profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating provider profile"
    });
  }
};

// SEARCH PROVIDERS WITH CATEGORY AND LOCATION FILTERING
const searchProviders = async (req, res) => {
  try {
    const { keyword, category, location } = req.query;

    const filter = {
      verificationStatus: "approved"
    };

    // Search by business name or description
    if (keyword && keyword.trim()) {
      const safeKeyword = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { businessName: { $regex: safeKeyword, $options: "i" } },
        { description: { $regex: safeKeyword, $options: "i" } }
      ];
    }

    // Filter by category
    if (category && category.trim()) {
      filter.category = {
        $regex: category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i"
      };
    }

    // Filter by location
    if (location && location.trim()) {
      filter.location = {
        $regex: location.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i"
      };
    }

    const providers = await ProviderProfile.find(filter)
      .populate("user", "name email")
      .select("-adminNote")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: providers.length,
      message: "Providers fetched successfully",
      data: providers
    });

  } catch (error) {
    console.error("Search providers error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while searching providers"
    });
  }
};

module.exports = {
  createProviderProfile,
  getMyProviderProfile,
  updateProviderProfile,
  searchProviders
};
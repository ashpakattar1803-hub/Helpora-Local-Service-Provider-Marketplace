
const Category = require("../models/Category");
const mongoose = require("mongoose");

// 1. Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const existingCategory = await Category.findOne({
      name: name.trim()
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists"
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      image
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Get All Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. Update Category
exports.updateCategory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid category ID"
  });
}
    const { name, description, image, isActive } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name cannot be empty"
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, image, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 4. Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

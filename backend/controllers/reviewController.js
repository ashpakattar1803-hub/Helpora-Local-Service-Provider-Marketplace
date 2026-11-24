
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Request = require("../models/Request");
const Notification = require("../models/Notification");

// Submit a review
const createReview = async (req, res) => {
  try {
    const { requestId, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID"
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5"
      });
    }

    if (comment !== undefined && typeof comment !== "string") {
      return res.status(400).json({
        success: false,
        message: "Comment must be a string"
      });
    }

    if (typeof comment === "string" && comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 1000 characters"
      });
    }

    const serviceRequest = await Request.findById(requestId);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
      });
    }

    if (serviceRequest.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can review only your own service requests"
      });
    }

    if (serviceRequest.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "You can review only completed service requests"
      });
    }

    const existingReview = await Review.findOne({ request: requestId });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this request"
      });
    }

    const review = await Review.create({
      customer: req.user._id,
      provider: serviceRequest.provider,
      service: serviceRequest.service,
      request: requestId,
      rating,
      comment: comment || ""
    });


try {
  await Notification.create({
    recipient: serviceRequest.provider,
    sender: req.user._id,
    type: "review_received",
    title: "New Review Received",
    message: `You have received a ${rating}-star review from ${req.user.name}.`,
    relatedRequest: serviceRequest._id
  });
} catch (notificationError) {
  console.error("Review notification error:", notificationError.message);
}



    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this request"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get reviews for a provider
const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID"
      });
    }

    const reviews = await Review.find({ provider: providerId })
      .populate("customer", "name")
      .populate("service", "title")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1))
      : 0;

    return res.status(200).json({
      success: true,
      count: totalReviews,
      averageRating,
      data: reviews
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get reviews for a service
const getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID"
      });
    }

    const reviews = await Review.find({ service: serviceId })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1))
      : 0;

    return res.status(200).json({
      success: true,
      count: totalReviews,
      averageRating,
      data: reviews
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  getServiceReviews
};

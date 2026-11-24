
const mongoose = require("mongoose");
const Request = require("../models/Request");
const Service = require("../models/Service");
const Notification = require("../models/Notification");

// =====================================
// CREATE SERVICE REQUEST (CUSTOMER)
// =====================================
const createServiceRequest = async (req, res) => {
  try {
    const { serviceId, message, requestedDate } = req.body;

    if (!serviceId || !requestedDate) {
      return res.status(400).json({
        success: false,
        message: "Service and requested date are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID"
      });
    }

    if (message !== undefined && typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message must be a string"
      });
    }

    const service = await Service.findById(serviceId);

    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        message: "Service not found or currently unavailable"
      });
    }

    if (service.provider.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own service"
      });
    }

    const date = new Date(requestedDate);

    if (Number.isNaN(date.getTime()) || date <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid future date"
      });
    }

    const request = await Request.create({
      customer: req.user._id,
      provider: service.provider,
      service: service._id,
      message: message ? message.trim() : "",
      requestedDate: date
    });

try {
  await Notification.create({
    recipient: service.provider,
    sender: req.user._id,
    type: "request_created",
    title: "New Service Request",
    message: `${req.user.name} has requested your service.`,
    relatedRequest: request._id
  });
} catch (notificationError) {
  console.error("Provider notification error:", notificationError.message);
}


    return res.status(201).json({
      success: true,
      message: "Service request submitted successfully",
      data: request
    });

  } catch (error) {
    console.error("Create request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while submitting request"
    });
  }
};

// =====================================
// GET PROVIDER REQUESTS
// =====================================
const getProviderRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      provider: req.user._id
    })
      .populate("customer", "name email")
      .populate("service", "title category price location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      message: "Provider requests fetched successfully",
      data: requests
    });

  } catch (error) {
    console.error("Get provider requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching provider requests"
    });
  }
};

// =====================================
// GET CUSTOMER REQUESTS
// =====================================
const getCustomerRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      customer: req.user._id
    })
      .populate("provider", "name email")
      .populate("service", "title category price location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      message: "Customer requests fetched successfully",
      data: requests
    });

  } catch (error) {
    console.error("Get customer requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching customer requests"
    });
  }
};

// =====================================
// UPDATE REQUEST STATUS (PROVIDER)
// =====================================
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID"
      });
    }

    const allowedStatuses = ["Accepted", "Rejected", "Completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status"
      });
    }

    const request = await Request.findOne({
      _id: id,
      provider: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    if (request.status === "Pending") {
      if (!["Accepted", "Rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Pending request can only be accepted or rejected"
        });
      }
    } else if (request.status === "Accepted") {
      if (status !== "Completed") {
        return res.status(400).json({
          success: false,
          message: "Accepted request can only be marked as completed"
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "This request can no longer be updated"
      });
    }

    request.status = status;
    await request.save();

try {
  const notificationDetails = {
    Accepted: {
      type: "request_accepted",
      title: "Request Accepted",
      message: "Your service request has been accepted by the provider."
    },
    Rejected: {
      type: "request_rejected",
      title: "Request Rejected",
      message: "Your service request has been rejected by the provider."
    },
    Completed: {
      type: "request_completed",
      title: "Request Completed",
      message: "Your service request has been marked as completed."
    }
  };

  const details = notificationDetails[status];

  await Notification.create({
    recipient: request.customer,
    sender: req.user._id,
    type: details.type,
    title: details.title,
    message: details.message,
    relatedRequest: request._id
  });
} catch (notificationError) {
  console.error("Customer notification error:", notificationError.message);
}

    return res.status(200).json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      data: request
    });

  } catch (error) {
    console.error("Update request status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating request"
    });
  }
};

module.exports = {
  createServiceRequest,
  getProviderRequests,
  getCustomerRequests,
  updateRequestStatus
};

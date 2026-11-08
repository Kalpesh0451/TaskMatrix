const mongoose = require("mongoose");
const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const filter = { recipient: req.user.id };

    if (req.query.unread === "true") {
      filter.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate("sender", "name email")
        .populate("relatedTask", "title status")
        .populate("relatedProject", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({
        recipient: req.user.id,
        isRead: false,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        total,
        unreadCount,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve notifications",
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.id,
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update notification",
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update notifications",
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete notification",
    });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { recipient, title, message, type, relatedTask, relatedProject } =
      req.body;

    if (!recipient || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "Recipient, title and message are required",
      });
    }

    if (!mongoose.isValidObjectId(recipient)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient ID",
      });
    }

    const notification = await Notification.create({
      recipient,
      sender: req.user.id,
      title,
      message,
      type: type || "general",
      relatedTask: relatedTask || null,
      relatedProject: relatedProject || null,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create notification",
    });
  }
};
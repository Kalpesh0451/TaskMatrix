
const Notification = require("../models/Notification");

const createAndSendNotification = async ({
  io,
  recipient,
  sender,
  title,
  message,
  type = "general",
  relatedTask = null,
  relatedProject = null,
}) => {
  try {
    if (!recipient) {
      console.error("Notification failed: recipient is missing");
      return null;
    }

    // Handle both ObjectId and populated User documents.
    const recipientId = (
      recipient._id || recipient
    ).toString();

    // Save notification in MongoDB.
    const notification = await Notification.create({
      recipient: recipientId,
      sender: sender || null,
      title,
      message,
      type,
      relatedTask,
      relatedProject,
    });

    const populatedNotification = await Notification.findById(
      notification._id
    )
      .populate("sender", "name email")
      .populate("relatedTask", "title status")
      .populate("relatedProject", "name");

    if (!populatedNotification) {
      console.error("Notification was saved but could not be retrieved");
      return null;
    }

    // Emit notification to the recipient's private room.
    if (io) {
      const room = `user:${recipientId}`;
      const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

      console.log("Sending real-time notification:", {
        recipientId,
        room,
        connectedSockets: roomSize,
        title,
      });

      io.to(room).emit("notification:new", populatedNotification);

      if (roomSize === 0) {
        console.warn(
          `No connected socket found in notification room: ${room}`
        );
      }
    } else {
      console.warn("Socket.IO instance not available");
    }

    return populatedNotification;
  } catch (error) {
    console.error(
      "Notification service error:",
      error.message
    );
    throw error;
  }
};

module.exports = { createAndSendNotification };
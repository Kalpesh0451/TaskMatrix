const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} = require("../controllers/notificationController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

// Only administrators and project managers can create notifications.
router.post(
  "/",
  authorize("admin", "project-manager"),
  createNotification
);

module.exports = router;
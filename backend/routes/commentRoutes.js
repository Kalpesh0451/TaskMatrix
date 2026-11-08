const express = require("express");
const router = express.Router();

const {
  addComment,
  getComments,
  getProjectActivities
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/tasks/:taskId/comments", addComment);
router.get("/tasks/:taskId/comments", getComments);
router.get("/projects/:projectId/activities", getProjectActivities);

module.exports = router;
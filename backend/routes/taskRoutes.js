
const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", authorize("admin", "project-manager"), createTask);
router.get("/", getTasks);
router.get("/my-tasks", getMyTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", authorize("admin", "project-manager"), deleteTask);

module.exports = router;

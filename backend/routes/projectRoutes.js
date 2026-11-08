
const express = require("express");
const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignMembers,
  removeMember,
} = require("../controllers/projectController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .post(authorize("admin", "project-manager"), createProject)
  .get(getProjects);

router.route("/:id")
  .get(getProjectById)
  .put(authorize("admin", "project-manager"), updateProject)
  .delete(authorize("admin", "project-manager"), deleteProject);

router.put("/:id/members", authorize("admin", "project-manager"), assignMembers);
router.delete("/:id/members/:userId", authorize("admin", "project-manager"), removeMember);

module.exports = router;

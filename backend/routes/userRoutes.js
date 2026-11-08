
const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  getMyProfile,
  updateMyProfile,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/profile", getMyProfile);
router.patch("/profile", updateMyProfile);

router.get("/", authorize("admin", "project-manager"), getAllUsers);
router.get("/:id", authorize("admin", "project-manager"), getUserById);

router.put("/:id", authorize("admin"), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validateRequest");

const {
  registerValidation,
  loginValidation,
} = require("../validations/authValidation");

router.post(
  "/register",
  registerValidation,
  validateRequest,
  register
);

router.post(
  "/login",
  loginValidation,
  validateRequest,
  login
);

router.get("/me", protect, getMe);

module.exports = router;
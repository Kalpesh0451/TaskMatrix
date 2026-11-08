const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { buildSort } = require("../utils/queryOptions");

// GET ALL USERS WITH SEARCH, FILTER, PAGINATION AND SORTING
exports.getAllUsers = async (req, res) => {
  try {
    const {
      search = "",
      role,
      status,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, Number(limit) || 10));

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    if (search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .sort(
        buildSort(
          sortBy,
          order,
          ["name", "email", "role", "createdAt"],
          "createdAt"
        )
      )
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit);

    res.status(200).json({
      success: true,
      total,
      page: currentPage,
      limit: pageLimit,
      pages: Math.ceil(total / pageLimit),
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve users",
    });
  }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve user",
    });
  }
};

// GET LOGGED-IN USER PROFILE
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve profile",
    });
  }
};

// UPDATE LOGGED-IN USER PROFILE
exports.updateMyProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(400).json({
        success: false,
        message: "Name must be a valid non-empty string",
      });
    }

    if (email !== undefined && typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email must be a valid string",
      });
    }

    if (
      password !== undefined &&
      (typeof password !== "string" || password.length < 6)
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered",
        });
      }

      user.email = normalizedEmail;
    }

    if (password !== undefined) {
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();

    const safeUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};

// ADMIN: UPDATE ANY USER
exports.updateUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const { name, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid name",
        });
      }

      user.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid email",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered",
        });
      }

      user.email = normalizedEmail;
    }

    if (role !== undefined) {
      const allowedRoles = [
        "admin",
        "project-manager",
        "team-member",
      ];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      if (
        user._id.toString() === req.user.id.toString() &&
        role !== "admin"
      ) {
        return res.status(400).json({
          success: false,
          message: "You cannot remove your own admin role",
        });
      }

      user.role = role;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false",
        });
      }

      if (
        user._id.toString() === req.user.id.toString() &&
        isActive === false
      ) {
        return res.status(400).json({
          success: false,
          message: "You cannot deactivate your own account",
        });
      }

      user.isActive = isActive;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update user",
    });
  }
};

// ADMIN: DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete user",
    });
  }
};
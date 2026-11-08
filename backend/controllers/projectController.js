
const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");

const canManageProject = (project, user) =>
  user.role === "admin" ||
  (user.role === "project-manager" &&
    project.manager.toString() === user.id.toString());

// CREATE PROJECT
exports.createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, members = [] } = req.body;

    if (!name || !description || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Name, description, start date and end date are required",
      });
    }

    if (!Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        message: "Members must be an array",
      });
    }

    if (
      Number.isNaN(new Date(startDate).getTime()) ||
      Number.isNaN(new Date(endDate).getTime()) ||
      new Date(endDate) < new Date(startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid project dates",
      });
    }

    const uniqueMembers = [...new Set(members.map(String))];

    if (uniqueMembers.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID",
      });
    }

    const validMembers = await User.find({
      _id: { $in: uniqueMembers },
      role: "team-member",
      isActive: true,
    }).select("_id");

    if (validMembers.length !== uniqueMembers.length) {
      return res.status(400).json({
        success: false,
        message: "One or more team members are invalid or inactive",
      });
    }

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      members: uniqueMembers,
      manager: req.user.id,
      createdBy: req.user.id,
    });

    const result = await Project.findById(project._id)
      .populate("manager", "name email")
      .populate("members", "name email");

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET PROJECTS
exports.getProjects = async (req, res) => {
  try {
    const { search = "", status, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, Number(limit) || 10));

    const filter = {};

    if (req.user.role === "project-manager") {
      filter.manager = req.user.id;
    } else if (req.user.role === "team-member") {
      filter.members = req.user.id;
    }

    if (status) filter.status = status;

    if (search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      filter.name = { $regex: escapedSearch, $options: "i" };
    }

    const total = await Project.countDocuments(filter);

    const projects = await Project.find(filter)
      .populate("manager", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit);

    res.status(200).json({
      success: true,
      total,
      page: currentPage,
      pages: Math.ceil(total / pageLimit),
      projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE PROJECT
exports.getProjectById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await Project.findById(req.params.id)
      .populate("manager", "name email")
      .populate("members", "name email")
      .populate("createdBy", "name email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member._id.toString() === req.user.id.toString()
    );

    if (!canManageProject(project, req.user) && !isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE PROJECT
exports.updateProject = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!canManageProject(project, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const fields = ["name", "description", "startDate", "endDate", "status"];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE PROJECT
exports.deleteProject = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!canManageProject(project, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ASSIGN / REPLACE PROJECT MEMBERS
exports.assignMembers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    if (!Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: "userIds must be an array",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!canManageProject(project, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const uniqueIds = [...new Set(userIds.map(String))];

    if (uniqueIds.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const users = await User.find({
      _id: { $in: uniqueIds },
      role: "team-member",
      isActive: true,
    }).select("_id");

    if (users.length !== uniqueIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more users are invalid or inactive",
      });
    }

    project.members = uniqueIds;
    await project.save();
    await project.populate("members", "name email");

    res.status(200).json({
      success: true,
      message: "Project members updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REMOVE PROJECT MEMBER
exports.removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!canManageProject(project, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    project.members = project.members.filter(
      (member) => member.toString() !== userId
    );

    await project.save();

    res.status(200).json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

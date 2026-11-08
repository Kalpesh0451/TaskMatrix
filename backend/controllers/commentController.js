
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const TaskComment = require("../models/TaskComment");
const ActivityLog = require("../models/ActivityLog");

const canAccessTask = async (task, user) => {
  const project = await Project.findById(task.project);

  if (!project) return false;

  if (
    user.role === "admin" ||
    (user.role === "project-manager" &&
      project.manager.toString() === user.id.toString())
  ) {
    return true;
  }

  return (
    project.members.some(
      (member) => member.toString() === user.id.toString()
    ) ||
    (task.assignedTo &&
      task.assignedTo.toString() === user.id.toString())
  );
};

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const { message } = req.body;
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment message is required",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (!(await canAccessTask(task, req.user))) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const comment = await TaskComment.create({
      task: taskId,
      user: req.user.id,
      message: message.trim(),
    });

    await ActivityLog.create({
      project: task.project,
      task: task._id,
      user: req.user.id,
      action: "Comment Added",
      details: `A comment was added to "${task.title}"`,
    });

    const result = await TaskComment.findById(comment._id)
      .populate("user", "name email")
      .populate("task", "title");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET TASK COMMENTS
exports.getComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (!(await canAccessTask(task, req.user))) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const comments = await TaskComment.find({ task: taskId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PROJECT ACTIVITY LOG
exports.getProjectActivities = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.toString() === req.user.id.toString()
    );

    const isManager =
      req.user.role === "admin" ||
      (req.user.role === "project-manager" &&
        project.manager.toString() === req.user.id.toString());

    if (!isMember && !isManager) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const activities = await ActivityLog.find({ project: projectId })
      .populate("user", "name email")
      .populate("task", "title")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

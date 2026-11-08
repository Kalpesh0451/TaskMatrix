
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

const isProjectManager = (project, user) =>
  user.role === "admin" ||
  (user.role === "project-manager" &&
    project.manager.toString() === user.id.toString());

const logActivity = async (project, task, user, action, details) => {
  await ActivityLog.create({
    project,
    task,
    user: user.id,
    action,
    details,
  });
};

const populateTask = (query) =>
  query
    .populate("project", "name status")
    .populate("assignedTo", "name email")
    .populate("assignedBy", "name email")
    .populate("createdBy", "name email");

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
    } = req.body;

    if (!title || !description || !project || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Title, description, project and due date are required",
      });
    }

    if (!mongoose.isValidObjectId(project)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    if (Number.isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }

    const validPriorities = ["low", "medium", "high", "critical"];

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    const projectData = await Project.findById(project);

    if (!projectData) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!isProjectManager(projectData, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You cannot create tasks for this project",
      });
    }

    let assignee = null;

    if (assignedTo) {
      if (!mongoose.isValidObjectId(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assignee ID",
        });
      }

      const isMember = projectData.members.some(
        (member) => member.toString() === assignedTo
      );

      assignee = await User.findOne({
        _id: assignedTo,
        isActive: true,
        role: "team-member",
      });

      if (!assignee || !isMember) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be an active member of this project",
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      assignedBy: req.user.id,
      createdBy: req.user.id,
      priority: priority || "medium",
      dueDate,
    });

    await logActivity(
      project,
      task._id,
      req.user,
      "Task Created",
      `Task "${title}" was created`
    );

    const result = await populateTask(Task.findById(task._id));

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL TASKS WITH FILTERS
exports.getTasks = async (req, res) => {
  try {
    const {
      search = "",
      status,
      priority,
      project,
      overdue,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, Number(limit) || 10));

    const filter = {};
    let managerProjectIds = null;

    // Role-based access restrictions
    if (req.user.role === "team-member") {
      filter.assignedTo = req.user.id;
    } else if (req.user.role === "project-manager") {
      const projects = await Project.find({
        manager: req.user.id,
      }).select("_id");

      managerProjectIds = projects.map((item) =>
        item._id.toString()
      );

      filter.project = { $in: managerProjectIds };
    }

    // Validate requested project
    if (project) {
      if (!mongoose.isValidObjectId(project)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      if (
        managerProjectIds &&
        !managerProjectIds.includes(project)
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this project's tasks",
        });
      }

      filter.project = project;
    }

    const validStatuses = [
      "todo",
      "in-progress",
      "review",
      "completed",
    ];

    const validPriorities = [
      "low",
      "medium",
      "high",
      "critical",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Escape special regex characters in search
    if (search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    // Overdue filter
    if (overdue === "true") {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $ne: "completed" };
    }

    const total = await Task.countDocuments(filter);

    const tasks = await populateTask(
      Task.find(filter)
        .sort({ dueDate: 1, createdAt: -1 })
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit)
    );

    res.status(200).json({
      success: true,
      total,
      page: currentPage,
      pages: Math.ceil(total / pageLimit),
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MY ASSIGNED TASKS
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await populateTask(
      Task.find({ assignedTo: req.user.id }).sort({ dueDate: 1 })
    );

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE TASK
exports.getTaskById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await populateTask(Task.findById(req.params.id));

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const projectData = await Project.findById(task.project._id);

    if (!projectData) {
      return res.status(404).json({
        success: false,
        message: "Associated project not found",
      });
    }

    const isAssigned =
      task.assignedTo &&
      task.assignedTo._id.toString() === req.user.id.toString();

    const isMember = projectData.members.some(
      (member) => member.toString() === req.user.id.toString()
    );

    if (
      !isProjectManager(projectData, req.user) &&
      !isAssigned &&
      !isMember
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const projectData = await Project.findById(task.project);

    if (!projectData) {
      return res.status(404).json({
        success: false,
        message: "Associated project not found",
      });
    }

    const canManage = isProjectManager(projectData, req.user);

    const isAssigned =
      task.assignedTo &&
      task.assignedTo.toString() === req.user.id.toString();

    if (!canManage && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this task",
      });
    }

    const allowedFields = canManage
      ? ["title", "description", "priority", "status", "dueDate", "assignedTo"]
      : ["status"];

    const oldStatus = task.status;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    }

    // Validate assignee
    if (req.body.assignedTo !== undefined && canManage) {
      if (req.body.assignedTo === null || req.body.assignedTo === "") {
        task.assignedTo = null;
      } else {
        if (!mongoose.isValidObjectId(req.body.assignedTo)) {
          return res.status(400).json({
            success: false,
            message: "Invalid assignee ID",
          });
        }

        const isMember = projectData.members.some(
          (member) => member.toString() === req.body.assignedTo
        );

        const user = await User.findOne({
          _id: req.body.assignedTo,
          role: "team-member",
          isActive: true,
        });

        if (!user || !isMember) {
          return res.status(400).json({
            success: false,
            message: "Assignee must be an active project member",
          });
        }

        task.assignedTo = req.body.assignedTo;
      }
    }

    if (
      req.body.priority &&
      !["low", "medium", "high", "critical"].includes(req.body.priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
      });
    }

    if (
      req.body.status &&
      !["todo", "in-progress", "review", "completed"].includes(req.body.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    if (
      req.body.dueDate !== undefined &&
      Number.isNaN(new Date(req.body.dueDate).getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }

    await task.save();

    await logActivity(
      task.project,
      task._id,
      req.user,
      oldStatus !== task.status ? "Task Status Updated" : "Task Updated",
      `Task "${task.title}" was updated`
    );

    const result = await populateTask(Task.findById(task._id));

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const projectData = await Project.findById(task.project);

    if (!projectData) {
      return res.status(404).json({
        success: false,
        message: "Associated project not found",
      });
    }

    if (!isProjectManager(projectData, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this task",
      });
    }

    await Task.deleteOne({ _id: task._id });

    await logActivity(
      task.project,
      null,
      req.user,
      "Task Deleted",
      `Task "${task.title}" was deleted`
    );

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

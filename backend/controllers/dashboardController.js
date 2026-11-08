
const Project = require("../models/Project");
const Task = require("../models/Task");
const ActivityLog = require("../models/ActivityLog");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let projectFilter = {};
    let taskFilter = {};

    // Apply role-based dashboard access
    if (role === "project-manager") {
      projectFilter.manager = userId;
    } else if (role === "team-member") {
      projectFilter.members = userId;
      taskFilter.assignedTo = userId;
    }

    const projects = await Project.find(projectFilter)
      .select("name status manager members startDate endDate")
      .lean();

    const projectIds = projects.map((project) => project._id);

    if (role !== "admin") {
      taskFilter.project = { $in: projectIds };
    }

    const tasks = await Task.find(taskFilter)
      .select("title status priority dueDate project assignedTo")
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .lean();

    const totalProjects = projects.length;
    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const inProgressTasks = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    const pendingTasks = tasks.filter(
      (task) => task.status === "todo" || task.status === "review"
    ).length;

    const completionPercentage =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    const now = new Date();

    const overdueTasks = tasks.filter((task) => {
  if (!task.dueDate || task.status === "completed") {
    return false;
  }

  const dueDateEnd = new Date(task.dueDate);
  dueDateEnd.setHours(23, 59, 59, 999);

  return dueDateEnd < now;
});

    const assignedTasks = tasks.filter(
      (task) => task.assignedTo
    );

    const projectProgress = projects.map((project) => {
      const projectTasks = tasks.filter(
        (task) =>
          task.project &&
          task.project._id.toString() === project._id.toString()
      );

      const completed = projectTasks.filter(
        (task) => task.status === "completed"
      ).length;

      const progress =
        projectTasks.length === 0
          ? 0
          : Math.round((completed / projectTasks.length) * 100);

      return {
        projectId: project._id,
        projectName: project.name,
        status: project.status,
        totalTasks: projectTasks.length,
        completedTasks: completed,
        progress
      };
    });

    const activities = await ActivityLog.find({
      project: { $in: projectIds }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .populate("project", "name")
      .lean();

    res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        overview: {
          totalProjects,
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          completionPercentage,
          overdueTasks: overdueTasks.length,
          assignedTasks: assignedTasks.length
        },
        projectProgress,
        overdueTaskList: overdueTasks,
        assignedTaskList: assignedTasks,
        recentActivities: activities
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard data",
      error: error.message
    });
  }
};

module.exports = { getDashboard };

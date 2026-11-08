
import { useEffect, useState } from "react";
import {
  Plus, Search, Pencil, Trash2, MessageSquare, X, Eye
} from "lucide-react";
import api from "../services/api";

const emptyForm = {
  title: "",
  description: "",
  project: "",
  assignedTo: "",
  priority: "medium",
  status: "todo",
  dueDate: ""
};

const getList = (response, key) => {
  const data = response.data?.data;
  if (Array.isArray(data)) return data;
  return data?.[key] || response.data?.[key] || [];
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTasks = async () => {
    try {
      setError("");
      const response = await api.get("/tasks");
      setTasks(getList(response, "tasks"));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [projectResponse, userResponse] = await Promise.all([
        api.get("/projects"),
        api.get("/users")
      ]);

      setProjects(getList(projectResponse, "projects"));

      setUsers(
        getList(userResponse, "users").filter(
          (user) => user.role === "team-member" && user.isActive
        )
      );
    } catch (err) {
      console.error("Unable to load task options:", err);
    }
  };

  useEffect(() => {
    loadTasks();
    loadOptions();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      project: task.project?._id || task.project || "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      priority: task.priority || "medium",
      status: task.status || "todo",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : ""
    });
    setError("");
    setShowForm(true);
  };

  const saveTask = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null
      };

      if (editingId) {
        await api.put(`/tasks/${editingId}`, payload);
        setSuccess("Task updated successfully.");
      } else {
        await api.post("/tasks", payload);
        setSuccess("Task created successfully.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save task.");
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      setSuccess("Task status updated.");
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update status.");
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setSuccess("Task deleted successfully.");
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete task.");
    }
  };

  const openComments = async (task) => {
    setSelectedTask(task);
    setComments([]);
    setCommentText("");

    try {
      const response = await api.get(`/tasks/${task._id}/comments`);
      setComments(getList(response, "comments"));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load comments.");
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await api.post(`/tasks/${selectedTask._id}/comments`, {
        message: commentText
      });

      setCommentText("");
      const response = await api.get(
        `/tasks/${selectedTask._id}/comments`
      );
      setComments(getList(response, "comments"));
      setSuccess("Comment added successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add comment.");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const title = task.title?.toLowerCase() || "";
    const matchesSearch = title.includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const projectName = (task) =>
    task.project?.name ||
    projects.find((p) => p._id === task.project)?.name ||
    "—";

  const assigneeName = (task) =>
    task.assignedTo?.name ||
    users.find((u) => u._id === task.assignedTo)?.name ||
    "Unassigned";

  const isOverdue = (task) =>
    task.status !== "completed" &&
    new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Tasks</h1>
          <p>Track work, priorities and deadlines.</p>
        </div>
        <button className="primary-button compact" onClick={openCreate}>
          <Plus size={17} /> New Task
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="task-toolbar">
        <div className="toolbar">
          <Search size={18} />
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>

        <select value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <form className="panel project-modal" onSubmit={saveTask}>
            <div className="modal-heading">
              <h2>{editingId ? "Edit Task" : "Create Task"}</h2>
              <button type="button" className="icon-danger"
                onClick={() => setShowForm(false)}><X /></button>
            </div>

            <div className="form-grid">
              <label className="full-field">
                Task Title
                <input required maxLength={150} value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>

              <label className="full-field">
                Description
                <textarea required value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>

              <label>
                Project
                <select required value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}>
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Assign To
                <select value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Priority
                <select value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>

              <label>
                Status
                <select value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </label>

              <label className="full-field">
                Due Date
                <input type="date" required value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </label>
            </div>

            <button className="primary-button" type="submit">
              {editingId ? "Save Changes" : "Create Task"}
            </button>
          </form>
        </div>
      )}

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7">Loading tasks...</td></tr>
              ) : filteredTasks.length ? (
                filteredTasks.map((task) => (
                  <tr key={task._id}>
                    <td><strong>{task.title}</strong></td>
                    <td>{projectName(task)}</td>
                    <td>{assigneeName(task)}</td>
                    <td>
                      <span className={`priority ${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={task.status}
                        onChange={(e) => updateStatus(task._id, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      <span className={isOverdue(task) ? "overdue-date" : ""}>
                        {new Date(task.dueDate).toLocaleDateString()}
                        {isOverdue(task) && " · Overdue"}
                      </span>
                    </td>
                    <td>
                      <div className="project-actions">
                        <button className="icon-action" title="View comments"
                          onClick={() => openComments(task)}>
                          <MessageSquare size={16} />
                        </button>
                        <button className="icon-action" title="Edit task"
                          onClick={() => openEdit(task)}>
                          <Pencil size={16} />
                        </button>
                        <button className="icon-danger" title="Delete task"
                          onClick={() => deleteTask(task._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="empty-state">No tasks found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTask && (
        <div className="modal-backdrop">
          <div className="panel project-modal">
            <div className="modal-heading">
              <h2>Task Comments</h2>
              <button className="icon-danger"
                onClick={() => setSelectedTask(null)}><X /></button>
            </div>

            <h3>{selectedTask.title}</h3>
            <p className="modal-description">{selectedTask.description}</p>

            <div className="comment-list">
              {comments.map((comment) => (
                <div className="comment-item" key={comment._id}>
                  <strong>{comment.user?.name || "Team Member"}</strong>
                  <p>{comment.message}</p>
                  <small>{new Date(comment.createdAt).toLocaleString()}</small>
                </div>
              ))}
              {!comments.length && (
                <p className="empty-state">No comments yet.</p>
              )}
            </div>

            <form onSubmit={addComment} className="comment-form">
              <textarea required placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)} />
              <button className="primary-button" type="submit">
                Add Comment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

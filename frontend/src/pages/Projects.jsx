
import { useEffect, useState } from "react";
import {
  Plus, Search, Trash2, Eye, Pencil, Users, X, UserPlus
} from "lucide-react";
import api from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "planned"
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getList = (response) => {
    const result = response.data?.data;
    if (Array.isArray(result)) return result;
    return result?.projects || result?.users || response.data?.projects || [];
  };

  const loadProjects = async () => {
    try {
      setError("");
      const response = await api.get("/projects");
      setProjects(getList(response));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };


const loadUsers = async () => {
  try {
    const response = await api.get("/users");
    const result = response.data?.data;

    const list = Array.isArray(result)
      ? result
      : result?.users || response.data?.users || [];

    setUsers(list.filter(
      (user) => user.role === "team-member" && user.isActive === true
    ));
  } catch (err) {
    setError(err.response?.data?.message || "Unable to load team members.");
  }
};


  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (project) => {
    setEditingId(project._id);
    setForm({
      name: project.name || "",
      description: project.description || "",
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().slice(0, 10) : "",
      endDate: project.endDate
        ? new Date(project.endDate).toISOString().slice(0, 10) : "",
      status: project.status || "planned"
    });
    setError("");
    setShowForm(true);
  };

  const saveProject = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, form);
        setSuccess("Project updated successfully.");
      } else {
        await api.post("/projects", form);
        setSuccess("Project created successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save project.");
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await api.delete(`/projects/${id}`);
      setSuccess("Project deleted successfully.");
      setSelectedProject(null);
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete project.");
    }
  };

  const openMemberManager = (project) => {
    setSelectedProject(project);
    setSelectedMembers(
      (project.members || []).map((member) =>
        typeof member === "string" ? member : member._id
      )
    );
    setShowMembers(true);
    setError("");
  };

  
const saveMembers = async () => {
  try {
    setError("");

    await api.put(`/projects/${selectedProject._id}/members`, {
      userIds: selectedMembers
    });

    setSuccess("Project members updated successfully.");
    setShowMembers(false);

    await loadProjects();

    const response = await api.get(`/projects/${selectedProject._id}`);
    setSelectedProject(response.data.data?.project || response.data.data);
  } catch (err) {
    setError(err.response?.data?.message || "Unable to update members.");
  }
};


  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Projects</h1>
          <p>Organize and manage your workspace projects.</p>
        </div>
        <button className="primary-button compact" onClick={openCreate}>
          <Plus size={17} /> New Project
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="project-toolbar">
        <div className="toolbar">
          <Search size={18} />
          <input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <form className="panel project-modal" onSubmit={saveProject}>
            <div className="modal-heading">
              <h2>{editingId ? "Edit Project" : "Create Project"}</h2>
              <button type="button" className="icon-danger"
                onClick={() => setShowForm(false)}><X /></button>
            </div>

            <div className="form-grid">
              <label className="full-field">
                Project Name
                <input required maxLength={100} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>

              <label>
                Start Date
                <input type="date" required value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </label>

              <label>
                End Date
                <input type="date" required min={form.startDate}
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </label>

              <label>
                Status
                <select value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </label>

              <label className="full-field">
                Description
                <textarea required value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
            </div>

            <button className="primary-button" type="submit">
              {editingId ? "Save Changes" : "Create Project"}
            </button>
          </form>
        </div>
      )}

      {showMembers && selectedProject && (
        <div className="modal-backdrop">
          <div className="panel project-modal">
            <div className="modal-heading">
              <h2>Manage Team Members</h2>
              <button className="icon-danger" onClick={() => setShowMembers(false)}>
                <X />
              </button>
            </div>

            <p className="modal-description">
              Select team members for {selectedProject.name}.
            </p>

            <div className="member-options">
              {users.map((user) => (
                <label className="member-option" key={user._id}>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user._id)}
                    onChange={(e) => {
                      setSelectedMembers((previous) =>
                        e.target.checked
                          ? [...previous, user._id]
                          : previous.filter((id) => id !== user._id)
                      );
                    }}
                  />
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </span>
                </label>
              ))}
              {!users.length && <p className="empty-state">No active team members available.</p>}
            </div>

            <button className="primary-button" onClick={saveMembers}>
              Save Members
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="panel empty-state">Loading projects...</div>
      ) : (
        <div className="project-grid">
          {filteredProjects.map((project) => (
            <article className="panel project-card" key={project._id}>
              <div className="project-card-top">
                <div className="project-symbol">
                  <span>{project.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <span className={`status-badge ${project.status}`}>
                  {project.status}
                </span>
              </div>

              <h2>{project.name}</h2>
              <p>{project.description || "No description provided."}</p>

              <div className="project-meta">
                <span>Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}</span>
                <span>Due: {project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}</span>
              </div>

              <div className="project-card-bottom">
                <small>{project.members?.length || 0} team members</small>
                <div className="project-actions">
                  <button title="View details" className="icon-action"
                    onClick={() => setSelectedProject(project)}><Eye size={17} /></button>
                  <button title="Manage members" className="icon-action"
                    onClick={() => openMemberManager(project)}><UserPlus size={17} /></button>
                  <button title="Edit project" className="icon-action"
                    onClick={() => openEdit(project)}><Pencil size={17} /></button>
                  <button title="Delete project" className="icon-danger"
                    onClick={() => deleteProject(project._id)}><Trash2 size={17} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !filteredProjects.length && (
        <div className="panel empty-state">No projects found.</div>
      )}

      {selectedProject && !showMembers && (
        <div className="modal-backdrop">
          <div className="panel project-modal">
            <div className="modal-heading">
              <h2>Project Details</h2>
              <button className="icon-danger"
                onClick={() => setSelectedProject(null)}><X /></button>
            </div>

            <h3>{selectedProject.name}</h3>
            <p className="modal-description">{selectedProject.description}</p>
            <p><strong>Status:</strong> {selectedProject.status}</p>
            <p><strong>Start:</strong> {new Date(selectedProject.startDate).toLocaleDateString()}</p>
            <p><strong>Deadline:</strong> {new Date(selectedProject.endDate).toLocaleDateString()}</p>

            <h3 className="members-title"><Users size={18} /> Assigned Members</h3>
            {(selectedProject.members || []).map((member) => (
              <p key={member._id || member}>
                {member.name || member}
              </p>
            ))}
            {!selectedProject.members?.length && <p>No members assigned.</p>}

            <button className="primary-button"
              onClick={() => openEdit(selectedProject)}>
              <Pencil size={16} /> Edit Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

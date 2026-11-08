
import { useEffect, useState } from "react";
import { FolderKanban, ListTodo, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <div className="alert-error">{error}</div>;

  const overview = data?.overview || {};
  const cards = [
    { label: "Total Projects", value: overview.totalProjects || 0, icon: FolderKanban },
    { label: "Total Tasks", value: overview.totalTasks || 0, icon: ListTodo },
    { label: "Completed", value: overview.completedTasks || 0, icon: CheckCircle2 },
    { label: "In Progress", value: overview.inProgressTasks || 0, icon: Clock3 },
    { label: "Overdue Tasks", value: overview.overdueTasks || 0, icon: AlertTriangle }
  ];

  return (
    <div>
      <div className="page-heading">
        <div><h1>Dashboard</h1><p>Here's what's happening in your workspace.</p></div>
        <span className="date-label">{new Date().toLocaleDateString()}</span>
      </div>

      <div className="stats-grid">
        {cards.map(({ label, value, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon"><Icon size={21} /></div>
            <p>{label}</p>
            <h2>{value}</h2>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Project Progress</h2>
            <span>{overview.completionPercentage || 0}% overall completion</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={data?.projectProgress || []}>
                <XAxis dataKey="projectName" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="progress" name="Progress %" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {(data?.projectProgress || []).map((project) => (
            <div className="progress-row" key={project.projectId}>
              <div><strong>{project.projectName}</strong><span>{project.progress}%</span></div>
              <div className="progress-track"><div style={{ width: `${project.progress}%` }} /></div>
            </div>
          ))}
          {!data?.projectProgress?.length && <p className="empty-state">No projects available yet.</p>}
        </section>

        <section className="panel">
          <h2>Recent Activities</h2>
          {(data?.recentActivities || []).map((activity) => (
            <div className="activity-item" key={activity._id}>
              <div className="activity-dot" />
              <div>
                <strong>{activity.action}</strong>
                <p>{activity.details || activity.project?.name || "Workspace activity"}</p>
                <small>{activity.user?.name || "User"} · {new Date(activity.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))}
          {!data?.recentActivities?.length && <p className="empty-state">No recent activities.</p>}
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Overdue Tasks</h2>
          {(data?.overdueTaskList || []).map((task) => (
            <div className="simple-row" key={task._id}>
              <div><strong>{task.title}</strong><small>{task.project?.name || "Project"}</small></div>
              <span className="status-badge overdue">Overdue</span>
            </div>
          ))}
          {!data?.overdueTaskList?.length && <p className="empty-state">No overdue tasks. Great work!</p>}
        </section>

        <section className="panel">
          <h2>My Assigned Tasks</h2>
          {(data?.assignedTaskList || []).slice(0, 6).map((task) => (
            <div className="simple-row" key={task._id}>
              <div><strong>{task.title}</strong><small>{task.assignedTo?.name || "Unassigned"}</small></div>
              <span className="status-badge">{task.status}</span>
            </div>
          ))}
          {!data?.assignedTaskList?.length && <p className="empty-state">No assigned tasks found.</p>}
        </section>
      </div>
    </div>
  );
}

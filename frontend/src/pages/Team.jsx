
import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import api from "../services/api";

export default function Team() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setError("");

        const res = await api.get("/users");
        console.log("Users API response:", res.data);

        const payload = res.data;
        const result =
          payload?.data?.users ??
          payload?.users ??
          payload?.data;

        setUsers(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load team members."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filtered = users.filter((user) =>
    `${user.name || ""} ${user.email || ""} ${user.role || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Team Members</h1>
          <p>People working across your projects.</p>
        </div>

        <div className="team-count">
          <Users size={19} /> {users.length} Members
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="toolbar">
        <Search size={18} />
        <input
          placeholder="Search team members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="panel empty-state">Loading team members...</div>
      ) : (
        <>
          <div className="team-grid">
            {filtered.map((user) => (
              <article className="panel team-card" key={user._id}>
                <div className="team-avatar">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <span className="status-badge">{user.role}</span>
                <small className={user.isActive ? "active-user" : "inactive-user"}>
                  {user.isActive ? "Active" : "Inactive"}
                </small>
              </article>
            ))}
          </div>

          {!filtered.length && (
            <div className="panel empty-state">
              No team members found.
            </div>
          )}
        </>
      )}
    </div>
  );
}

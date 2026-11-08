
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, ListTodo, Users, LogOut, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ open, close }) => {
  const { logout } = useAuth();

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/tasks", label: "Tasks", icon: ListTodo },
    { to: "/team", label: "Team Members", icon: Users }
  ];

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={close}></div>}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">T</div>
          <span>TaskMatrix</span>
          <button className="mobile-close" onClick={close}><X size={20} /></button>
        </div>

        <p className="sidebar-caption">WORKSPACE</p>

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={close}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-button" onClick={logout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

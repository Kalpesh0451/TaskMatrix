
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  LogOut,
  X,
  CheckSquare,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ open, close }) => {
  const { logout } = useAuth();

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/tasks", label: "Tasks", icon: ListTodo },
    { to: "/team", label: "Team Members", icon: Users },
  ];

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={close} />}

      <aside className={`sidebar ${open ? "sidebar-open" : ""} tm-sidebar`}>
        <div className="tm-sidebar-brand">
          <div className="tm-brand-mark">
            <CheckSquare size={25} strokeWidth={3} />
          </div>
          <span className="tm-brand-name">
            Task<span>Matrix</span>
          </span>
          <button
            className="mobile-close"
            onClick={close}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <p className="tm-sidebar-caption">WORKSPACE</p>

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
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
          <div className="tm-sidebar-version">TASKMATRIX WORKSPACE</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


import { Menu, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="top-navbar">
      <button className="menu-button" onClick={onMenuClick}>
        <Menu size={22} />
      </button>

      <div className="navbar-search">
        <span>Workspace / Overview</span>
      </div>

      <div className="navbar-right">
        <button className="notification-button" aria-label="Notifications">
          <Bell size={20} />
        </button>

        <div className="user-profile">
          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="user-info">
            <strong>{user?.name || "User"}</strong>
            <small>{user?.role || "Team Member"}</small>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

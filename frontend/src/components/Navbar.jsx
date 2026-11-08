
import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import {
  Menu,
  Bell,
  CheckCheck,
  Trash2,
  X,
  Circle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // LOAD NOTIFICATIONS
  const loadNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);

      const response = await api.get("/notifications");
      const data = response.data.data || response.data;

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error(
        "Unable to load notifications:",
        error.response?.data || error.message
      );
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // SOCKET.IO CONNECTION
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("taskmatrix_token");

    if (!token) {
      console.error("Socket.IO: Authentication token not found");
      return;
    }

    // Load existing notifications
    loadNotifications();

    // Establish authenticated socket connection
    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log(
        "TaskMatrix real-time notifications connected:",
        socket.id
      );
    });

    socket.on("connect_error", (error) => {
      console.error(
        "Socket.IO connection error:",
        error.message
      );
    });

    socket.on("notification:new", (notification) => {
      console.log("New real-time notification received:", notification);

      setNotifications((previous) => {
        const exists = previous.some(
          (item) => item._id === notification._id
        );

        if (exists) return previous;

        return [notification, ...previous];
      });

      if (!notification.isRead) {
        setUnreadCount((previous) => previous + 1);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    // Refresh notifications periodically as a fallback
    const interval = setInterval(loadNotifications, 30000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [user, loadNotifications]);

  // MARK SINGLE NOTIFICATION AS READ
  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      await loadNotifications();
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
    }
  };

  // MARK ALL NOTIFICATIONS AS READ
  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      await loadNotifications();
    } catch (error) {
      console.error("Unable to mark all as read:", error);
    }
  };

  // DELETE NOTIFICATION
  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      await loadNotifications();
    } catch (error) {
      console.error("Unable to delete notification:", error);
    }
  };

  return (
    <header className="top-navbar">
      <button className="menu-button" onClick={onMenuClick}>
        <Menu size={22} />
      </button>

      <div className="navbar-search">
        <span>Workspace / Overview</span>
      </div>

      <div className="navbar-right">
        <div className="notification-wrapper">
          <button
            className="notification-button"
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications((previous) => !previous);
              loadNotifications();
            }}
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <div>
                  <h3>Notifications</h3>
                  <small>{unreadCount} unread</small>
                </div>

                <div className="notification-header-actions">
                  {unreadCount > 0 && (
                    <button
                      title="Mark all as read"
                      onClick={markAllRead}
                    >
                      <CheckCheck size={17} />
                    </button>
                  )}

                  <button
                    title="Close"
                    onClick={() => setShowNotifications(false)}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="notification-list">
                {loadingNotifications ? (
                  <p className="notification-empty">
                    Loading...
                  </p>
                ) : notifications.length === 0 ? (
                  <p className="notification-empty">
                    You're all caught up!
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`notification-item ${
                        notification.isRead ? "read" : "unread"
                      }`}
                    >
                      <div className="notification-item-icon">
                        <Circle size={9} />
                      </div>

                      <div className="notification-item-content">
                        <strong>{notification.title}</strong>

                        <p>{notification.message}</p>

                        <small>
                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}
                        </small>

                        <div className="notification-item-actions">
                          {!notification.isRead && (
                            <button
                              onClick={() =>
                                markRead(notification._id)
                              }
                            >
                              Mark as read
                            </button>
                          )}

                          <button
                            onClick={() =>
                              deleteNotification(notification._id)
                            }
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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

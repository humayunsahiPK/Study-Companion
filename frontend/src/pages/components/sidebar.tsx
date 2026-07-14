import "./sidebar.css";
import logo from "../../assets/StudyCompanion.png";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiRequest } from "../../api/client";

type Notification = {
  id: string;
  text: string;
  lecture_id: string;
};

type NotificationsResponse = {
  notifications: Notification[];
};

function Sidebar() {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await apiRequest<NotificationsResponse>(
          "/dashboard/notifications",
        );
        setNotifications(data.notifications);
      } catch {
        // not signed in yet, or the request failed - just show nothing
        setNotifications([]);
      }
    }
    loadNotifications();
  }, []);

  function handleNotificationClick(lectureId: string) {
    setNotifOpen(false);
    navigate("/library", { state: { lectureId } });
  }

  return (
    <aside className="sidebar">
      <img className="logo" src={logo} alt="logo" />

      <div className="notif-wrap">
        <button
          className="notif-bell"
          onClick={() => setNotifOpen((prev) => !prev)}
          aria-label="Notifications"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C10.34 2 9 3.34 9 5V5.29C6.66 6.13 5 8.36 5 11V15L3 17V18H21V17L19 15V11C19 8.36 17.34 6.13 15 5.29V5C15 3.34 13.66 2 12 2Z"
              fill="currentColor"
            />
            <path
              d="M9.5 19C9.5 20.38 10.62 21.5 12 21.5C13.38 21.5 14.5 20.38 14.5 19H9.5Z"
              fill="currentColor"
            />
          </svg>
          {notifications.length > 0 && (
            <span className="notif-badge">{notifications.length}</span>
          )}
        </button>

        {notifOpen && (
          <div className="notif-dropdown">
            <div className="notif-dropdown-title">Due today</div>
            {notifications.length === 0 ? (
              <div className="notif-empty">Nothing due — you're caught up.</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  className="notif-item"
                  onClick={() => handleNotificationClick(n.lecture_id)}
                >
                  {n.text}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <ul>
        <li className="dash">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>
        </li>

        <li className="revi">
          <NavLink
            to="/review"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Review
          </NavLink>
        </li>

        <li className="libr">
          <NavLink
            to="/library"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Library
          </NavLink>
        </li>

        <li className="sett">
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Settings
          </NavLink>
        </li>
      </ul>
      <div className="sidebarfooter">
        <button className="sign-in-btn" onClick={() => navigate("/login")}>
          Sign in
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

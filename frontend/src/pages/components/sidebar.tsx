import "./sidebar.css";
import logo from "../../assets/StudyCompanion.png";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <img className="logo" src={logo} alt="logo" />
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
        <span style={{ color: "#7d859c" }}>Signed in as</span>{" "}
        <b style={{ color: "#eceef3" }}>Humayun Khawar</b>
      </div>
    </aside>
  );
}

export default Sidebar;

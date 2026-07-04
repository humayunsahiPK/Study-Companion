import "./sidebar.css";
import logo from "../../assets/StudyCompanion.png";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <img className="logo" src={logo} alt="logo" />
      <ul>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/review"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Review
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/library"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Library
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Settings
          </NavLink>
        </li>
      </ul>
      <div className="sidebarfooter">signed in as Humayun Khawar</div>
    </aside>
  );
}

export default Sidebar;

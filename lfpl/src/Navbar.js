import { useLocation, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  return (
    <nav className="nav">
      <NavLink to="/" className="nav-link">
        Home
      </NavLink>
      <NavLink to="/team" className="nav-link">
        Team
      </NavLink>
      <NavLink to="/transfers" className="nav-link">
        Transfers
      </NavLink>
      <NavLink to="/league" className="nav-link">
        Leagues
      </NavLink>
      <button
        className="dark-mode-toggle"
        onClick={() => setDarkMode(!darkMode)}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
    </nav>
  );
}

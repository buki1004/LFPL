import { useLocation, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("teamId");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed: ", error);
    }
  };

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
      <button className="logout" onClick={() => handleLogout()}>
        ⎋
      </button>
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

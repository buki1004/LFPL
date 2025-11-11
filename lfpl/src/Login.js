import React, { useState, useEffect } from "react";
import styles from "./Signup.module.css";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      localStorage.clear();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.clearAuth) {
          localStorage.clear();
        }
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("teamId", data.teamId);
      navigate("/");
    } catch (error) {
      alert(error.message);
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

  useEffect(() => {}, []);

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleLogin} className={styles.signupForm}>
        <button
          type="button"
          className={styles.darkModeToggleLogin}
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        <h2>Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={styles.signupInput}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className={styles.signupInput}
        />
        <button type="submit" className={styles.signupButton}>
          Login
        </button>
        <Link to="/signup" className={styles.signupAnchor}>
          Don't have an account? Click here to signup
        </Link>
      </form>
    </div>
  );
};

export default Login;

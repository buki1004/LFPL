import React, { useState, useEffect } from "react";
import styles from "./Signup.module.css";
import { Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        localStorage.clear();
        throw new Error(data.error || "Signup failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("teamId", data.teamId);
      alert("User created!");
      window.location.href = "/createTeam";
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

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSignup} className={styles.signupForm}>
        <button
          type="button"
          className={styles.darkModeToggleLogin}
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        <h2>Sign up</h2>
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className={styles.signupInput}
        />
        <input
          type="username"
          value={username}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          className={styles.signupInput}
        />
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className={styles.signupInput}
        />
        <button
          type="submit"
          onClick={handleSignup}
          className={styles.signupButton}
        >
          Sign up
        </button>
        <Link to="/login" className={styles.signupAnchor}>
          Already have an account? Click here to login
        </Link>
      </form>
    </div>
  );
};

export default Signup;

import React, { useState } from "react";
import styles from "./Signup.module.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSignup} className={styles.signupForm}>
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
        <a href="/login" className={styles.signupAnchor}>
          Already have an account? Click here to login
        </a>
      </form>
    </div>
  );
};

export default Signup;

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Signup from "./Signup";
import Login from "./Login";
import CreateTeam from "./CreateTeam";
import Team from "./Team";
import Transfers from "./Transfer";
import Navbar from "./Navbar";
import League from "./League";
import ProtectedRoute from "./ProtectedRoute";
import "./Darkmode.css";

const darkMode = localStorage.getItem("darkMode") === "true";
if (darkMode) {
  document.body.classList.add("dark-mode");
} else {
  document.body.classList.remove("dark-mode");
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/createteam"
        element={
          <ProtectedRoute>
            <CreateTeam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <Team />
          </ProtectedRoute>
        }
      />
      <Route path="/team/:userId" element={<Team />} />
      <Route
        path="/transfers"
        element={
          <ProtectedRoute>
            <Transfers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/league"
        element={
          <ProtectedRoute>
            <League />
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App";
import Signup from "./Signup";
import Login from "./Login";
import CreateTeam from "./CreateTeam";
import Team from "./Team";
import Transfers from "./Transfer";
import Navbar from "./Navbar";
import League from "./League";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Navbar></Navbar>
    <Routes>
      <Route
        path="/"
        element={
          localStorage.getItem("token") ? <App /> : <Navigate to="/login" />
        }
      />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/createteam" element={<CreateTeam />} />
      <Route path="/team" element={<Team />} />
      <Route path="/transfers" element={<Transfers />} />
      <Route path="/league" element={<League />} />
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import Signup from './Signup';
import Login from './Login';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
    <Routes>
        <Route
            path="/"
            element={
                localStorage.getItem("token") ? <App /> : <Navigate to="/login" />
            }
        />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/login" element={<Login/>} />
    </Routes>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

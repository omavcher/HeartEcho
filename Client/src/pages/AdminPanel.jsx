import React, { useState } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { FaUsers, FaRobot, FaExclamationCircle, FaChartBar, FaBars } from "react-icons/fa";
import "./AdminPanel.css";
import AdminDashboard from "./Admin/AdminDashboard"; // ✅ Fix: Capitalized import
import UsersAdmin from "./Admin/UsersAdmin";
import AIFriendsAdmin from "./Admin/AIFriendsAdmin";
import ComplaintsAdmin from "./Admin/ComplaintsAdmin";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-logo">Admin Panel</div>
      <div className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <FaBars />
      </div>
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <NavLink to="/admin/dashboard" className="nav-item" onClick={() => setMenuOpen(false)}>
          <FaChartBar /> Dashboard
        </NavLink>
        <NavLink to="/admin/users" className="nav-item" onClick={() => setMenuOpen(false)}>
          <FaUsers /> Users
        </NavLink>
        <NavLink to="/admin/ai-friends" className="nav-item" onClick={() => setMenuOpen(false)}>
          <FaRobot /> AI Friends
        </NavLink>
        <NavLink to="/admin/complaints" className="nav-item" onClick={() => setMenuOpen(false)}>
          <FaExclamationCircle /> Complaints
        </NavLink>
      </div>
    </nav>
  );
};

const Dashboard = () => (
  <div className="content">
    <AdminDashboard /> 
  </div>
);

const Users = () => (
  <div className="content">
    <UsersAdmin />
  </div>
);

const AIFriends = () => (
  <div className="content">
   <AIFriendsAdmin/>
  </div>
);

const Complaints = () => (
  <div className="content">
   <ComplaintsAdmin />
  </div>
);

const AdminPanel = () => {
  return (
    <div className="admin-container">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/ai-friends" element={<AIFriends />} />
        <Route path="/complaints" element={<Complaints />} />
      </Routes>
    </div>
  );
};

export default AdminPanel;

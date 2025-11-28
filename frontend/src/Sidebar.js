// src/Sidebar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiCalendar, FiLogOut } from "react-icons/fi";
import logo from "./assets/neohealth-logo.jpg";
import "./Home.css"; // pour les styles .sidebar, .admin-layout, etc.

function Sidebar({ sidebarOpen, setSidebarOpen, active }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const navClass = (key) => `nav-item ${active === key ? "active" : ""}`;

  return (
    <div className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={logo} alt="NeoHealth Logo" className="logo-img" />
          <div className="logo-text">
            <h2>NeoHealth</h2>
            <p>Medical Suite</p>
          </div>
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <div className={`hamburger ${sidebarOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="nav-section-title">GÉNÉRAL</h3>

          <button
            className={navClass("dashboard")}
            onClick={() => navigate("/dashboard")}
          >
            <FiHome className="nav-icon" />
            <span>Tableau de Bord</span>
          </button>

          <button
            className={navClass("patients")}
            onClick={() => navigate("/patients")}
          >
            <FiUsers className="nav-icon" />
            <span>Gestion Patients</span>
          </button>

          <button
            className={navClass("rendezvous")}
            onClick={() => navigate("/rendezvous")}
          >
            <FiCalendar className="nav-icon" />
            <span>Rendez-vous</span>
          </button>
        </div>

        <div className="nav-section">
          <h3 className="nav-section-title">ADMINISTRATION</h3>

          <button
            className={navClass("personnel")}
            onClick={() => navigate("/personnel")}
          >
            <FiUsers className="nav-icon" />
            <span>Personnel Médical</span>
          </button>

          <button
            className={navClass("docteurs")}
            onClick={() => navigate("/docteurs")}
          >
            <FiUsers className="nav-icon" />
            <span>Médecins</span>
          </button>

          <button
            className={navClass("salles")}
            onClick={() => navigate("/salles")}
          >
            <FiUsers className="nav-icon" />
            <span>Salles & Blocs</span>
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut className="nav-icon" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

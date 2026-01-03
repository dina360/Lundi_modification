import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiCalendar, FiClock, FiUser, FiLogOut, FiCpu } from "react-icons/fi";
import "../malade.css";
import { io } from "socket.io-client";  // Importer socket.io-client

// ✅ Import du logo (chemin depuis src/malade/components vers src/assets)
import logo from "../../assets/neohealth-logo.jpg";

export default function MaladeLayout({ title, subtitle, children }) {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "Patient";
  const userEmail = localStorage.getItem("userEmail") || "";

const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");

  navigate("/login", { replace: true });  // Remplacer l'historique
};
 

React.useEffect(() => {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  if (!token) {
    navigate("/login");
  }

  if (role && role !== "patient") {
    navigate("/login");
  }
}, [navigate]);


  return (
    <div className="malade-shell">
      <aside className="malade-sidebar">
        {/* ✅ Brand avec logo */}
        <div className="malade-brand">
          <img
            src={logo}
            alt="NeoHealth"
            className="malade-brand-logo"
          />
          <div className="malade-brand-title">
            <strong>Espace Patient</strong>
            <span>NeoHealth</span>
          </div>
        </div>

        <nav className="malade-nav">
          <NavLink
            to="/malade/home"
            className={({ isActive }) => `malade-link ${isActive ? "active" : ""}`}
          >
            <FiHome /> Tableau de bord
          </NavLink>

          <NavLink
            to="/malade/rendezvous/demande"
            className={({ isActive }) => `malade-link ${isActive ? "active" : ""}`}
          >
            <FiCalendar /> Demander un RDV
          </NavLink>

          <NavLink
            to="/malade/rendezvous/historique"
            className={({ isActive }) => `malade-link ${isActive ? "active" : ""}`}
          >
            <FiClock /> Historique
          </NavLink>

          <NavLink
            to="/malade/prediction"
            className={({ isActive }) => `malade-link ${isActive ? "active" : ""}`}
          >
            <FiCpu /> Prédiction
          </NavLink>


          <NavLink
            to="/malade/profile"
            className={({ isActive }) => `malade-link ${isActive ? "active" : ""}`}
          >
            <FiUser /> Mon Profil
          </NavLink>
        </nav>

        <div className="malade-sidebar-footer">
          <div className="malade-user">
            <strong>{userName}</strong>
            <span>{userEmail}</span>
          </div>

          <button className="malade-logout" onClick={logout}>
            <FiLogOut style={{ marginRight: 8 }} />
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="malade-main">
        <div className="malade-container">
          <div className="malade-topbar">
            <div className="malade-title">
              <h1>{title}</h1>
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
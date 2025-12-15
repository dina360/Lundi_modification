import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiCalendar, FiClock, FiUser, FiLogOut, FiCpu } from "react-icons/fi";
import "../malade.css";

export default function MaladeLayout({ title, subtitle, children }) {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "Patient";
  const userEmail = localStorage.getItem("userEmail") || "";
  const role = localStorage.getItem("userRole") || "";

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  React.useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) navigate("/login");
    if (role && role !== "patient") navigate("/login");
  }, [navigate, role]);

  return (
    <div className="malade-shell">
      <aside className="malade-sidebar">
        <div className="malade-brand">
          <div className="malade-brand-badge">NH</div>
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

          {/* ✅ Nouveau bouton IA */}
          <NavLink
            to="/malade/ia"
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

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiCalendar,
  FiHome,
  FiCheckCircle,
  FiLogOut,
} from "react-icons/fi";
import "./Sidebar.css";

export default function Sidebar({ active = "" }) {
  const navigate = useNavigate();

  const items = [
    { key: "dashboard", label: "Tableau de Bord", icon: <FiGrid />, path: "/dashboard" },
    { key: "patients", label: "Gestion Patients", icon: <FiUsers />, path: "/patients" },
    { key: "rendezvous", label: "Rendez-vous", icon: <FiCalendar />, path: "/rendezvous" },
    { key: "salles", label: "Salles & Blocs", icon: <FiHome />, path: "/salles" },
    { key: "validations", label: "Validations", icon: <FiCheckCircle />, path: "/validations" },
  ];

  const logout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <aside className="nh-sidebar">
      <div className="nh-sidebar__top">
        <div className="nh-brand">
          <div className="nh-logo">
            {/* remplace par ton logo si tu veux */}
            <span className="nh-logo-dot" />
          </div>
          <div className="nh-brand-text">
            <div className="nh-brand-name">NeoHealth</div>
            <div className="nh-brand-sub">Medical Suite</div>
          </div>
        </div>
      </div>

      <nav className="nh-nav">
        {items.map((it) => (
          <button
            key={it.key}
            className={`nh-nav-item ${active === it.key ? "active" : ""}`}
            onClick={() => navigate(it.path)}
            type="button"
          >
            <span className="nh-nav-icon">{it.icon}</span>
            <span className="nh-nav-label">{it.label}</span>
          </button>
        ))}
      </nav>

      <div className="nh-sidebar__bottom">
        <button className="nh-logout" onClick={logout} type="button">
          <span className="nh-nav-icon">
            <FiLogOut />
          </span>
          <span className="nh-nav-label">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
// src/RendezVousPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiMenu
} from "react-icons/fi";

import CalendrierRendezVous from "./CalendrierRendezVous";
import FormulaireRendezVous from "./FormulaireRendezVous";
import ListeRendezVous from "./ListeRendezVous";

import logo from "./assets/neohealth-logo.jpg";
import "./Home.css";
import "./RendezVous.css";

function RendezVousPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* ------------------ SIDEBAR ------------------ */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="NeoHealth Logo" className="logo-img" />
            {sidebarOpen && (
              <div className="logo-text">
                <h2>NeoHealth</h2>
                <p>Medical Suite</p>
              </div>
            )}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {sidebarOpen && <h3 className="nav-section-title">GÉNÉRAL</h3>}

            <button
              className="nav-item"
              onClick={() => navigate("/dashboard")}
            >
              <FiHome className="nav-icon" />
              {sidebarOpen && <span>Tableau de Bord</span>}
            </button>

            <button
              className="nav-item"
              onClick={() => navigate("/patients")}
            >
              <FiUsers className="nav-icon" />
              {sidebarOpen && <span>Gestion Patients</span>}
            </button>

            <button
              className="nav-item active"
              onClick={() => navigate("/rendezvous")}
            >
              <FiCalendar className="nav-icon" />
              {sidebarOpen && <span>Rendez-vous</span>}
            </button>
          </div>

          <div className="nav-section">
            {sidebarOpen && <h3 className="nav-section-title">ADMINISTRATION</h3>}

            <button
              className="nav-item"
              onClick={() => navigate("/personnel")}
            >
              <FiUsers className="nav-icon" />
              {sidebarOpen && <span>Personnel Médical</span>}
            </button>

            <button
              className="nav-item"
              onClick={() => navigate("/docteurs")}
            >
              <FiUsers className="nav-icon" />
              {sidebarOpen && <span>Médecins</span>}
            </button>

            <button
              className="nav-item"
              onClick={() => navigate("/salles")}
            >
              <FiUsers className="nav-icon" />
              {sidebarOpen && <span>Salles & Blocs</span>}
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* ------------------ CONTENU PRINCIPAL ------------------ */}
      <div className={`main-content ${sidebarOpen ? "content-shifted" : ""}`}>
        <header className="content-header">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FiMenu />
          </button>
          <div className="header-actions">
            <h1>Gestion des Rendez-vous</h1>
            <p className="header-subtitle">
              Planification intelligente avec prise en compte des week-ends et jours fériés.
            </p>
          </div>
        </header>

        <div className="rdv-page-grid">
          {/* Calendrier */}
          <section className="rdv-calendar-wrapper card">
            <h2 className="rdv-section-title">Calendrier</h2>
            <CalendrierRendezVous
              onDateSelect={setSelectedDate}
              refresh={refresh}
            />
          </section>

          {/* Formulaire */}
          <section className="rdv-form-wrapper card">
            <h2 className="rdv-section-title">Nouveau rendez-vous</h2>
            <FormulaireRendezVous
              selectedDate={selectedDate}
              onSuccess={() => setRefresh(!refresh)}
            />
          </section>
        </div>

        {/* Liste des rendez-vous */}
        <section className="rdv-list-wrapper card">
          <h2 className="rdv-section-title">Liste des rendez-vous</h2>
          <ListeRendezVous refresh={refresh} />
        </section>
      </div>
    </div>
  );
}

export default RendezVousPage;
import React from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiUsers, FiFileText, FiPlusCircle, FiCalendar } from "react-icons/fi";

function MedecinSidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>NeoHealth</h2>
      </div>
      <nav className="sidebar-nav">
        {/* 🔹 Dashboard -> /medecin/home */}
        <NavLink to="/medecin/home" className={({isActive}) => isActive ? "active" : ""}>
          <FiHome /> Dashboard
        </NavLink>

        {/* 🔹 Liste des patients -> /medecin/patients */}
        <NavLink to="/medecin/patients" className={({isActive}) => isActive ? "active" : ""}>
          <FiUsers /> Liste des patients
        </NavLink>

        {/* 🔹 Détails du patient -> /medecin/PatientDetails */}
        <NavLink to="/medecin/PatientDetails" className={({isActive}) => isActive ? "active" : ""}>
          <FiPlusCircle /> Ajouter consultation
        </NavLink>

        {/* 🔹 Gérer rendez-vous -> /medecin/manage-appointments */}
        <NavLink to="/medecin/manage-appointments" className={({isActive}) => isActive ? "active" : ""}>
          <FiCalendar /> Gérer rendez-vous
        </NavLink>
      </nav>
    </div>
  );
}

export default MedecinSidebar; 
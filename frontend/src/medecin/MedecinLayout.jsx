// src/medecin/MedecinLayout.jsx

import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiFileText, FiPlusCircle, FiCalendar } from "react-icons/fi";
import neohealthLogo from '../assets/neohealth-logo.jpg';

function MedecinLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔹 Récupérer le médecin depuis localStorage
  const medecinStr = localStorage.getItem("medecin");
  let medecin = null;

  try {
    if (medecinStr) {
      medecin = JSON.parse(medecinStr);
      if (!medecin.id && !medecin._id) {
        throw new Error("Objet médecin invalide");
      }
    }
  } catch (e) {
    console.error("Erreur parsing medecin:", e);
  }

  // 🔸 Gestion du chemin de la photo
  const photoUrl = medecin?.photo && !medecin.photo.startsWith('http')
    ? `http://localhost:5000${medecin.photo}`
    : medecin?.photo || "https://via.placeholder.com/120";

  const menuItems = [
    { name: "Tableau de Bord", path: "/medecin/home", icon: <FiHome /> },
    { name: "Liste des patients", path: "/medecin/patients", icon: <FiUsers /> },
    { name: "Ajouter consultation", path: "/medecin/PatientDetails", icon: <FiPlusCircle /> },
    { name: "Gérer les Diponibilités", path: "/medecin/dispoMedecin", icon: <FiCalendar /> },
    { name: "Profil", path: "/medecin/profile", icon: <FiFileText /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!medecin) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600">Erreur : Médecin non connecté</h2>
        <p>Reconnectez-vous pour accéder à votre profil.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Fixe */}
      <aside className="w-64 bg-blue-900 text-white p-6 fixed h-full overflow-y-auto">
        <div className="mb-8">
          <img
            src={photoUrl}
            alt="Photo de profil"
            className="w-12 h-12 rounded-full object-cover border-2 border-white mx-auto"
          />
          <p className="text-center mt-2 font-semibold">{medecin.name}</p>
          {/* ✅ Affiche la spécialité ici */}
          <p className="text-center text-sm text-blue-300">
            Spécialité {medecin.specialty || "Spécialité non définie"}
          </p>
          <p className="text-center text-sm text-gray-300">{medecin.email}</p>
        </div>

        <nav>
          <ul className="space-y-4">
            {menuItems.map((item) => (
              <li key={item.path}>
                <a
                  href={item.path}
                  className={`w-full text-left px-4 py-2 rounded flex items-center space-x-2 ${
                    location.pathname === item.path || location.pathname.startsWith(item.path + "/")
                      ? "bg-blue-700"
                      : "hover:bg-blue-700"
                  }`}
                >
                  {item.icon} {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 pt-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
          >
            🔓 Déconnexion
          </button>
        </div>
      </aside>

      {/* Zone Contenu (scrollable) */}
      <main className="flex-1 ml-64 p-0 overflow-y-auto">
        {/* Header Fixe (dans le contenu principal) */}
        <header className="bg-blue-800 text-white p-6 mb-6 rounded-lg flex justify-between items-center fixed top-0 left-64 right-0 z-50">
          <div className="flex items-center space-x-4">
            <img
              src={neohealthLogo} // ✅ Logo de ta clinique
              alt="NeoHealth"
              className="w-8 h-8 rounded-full object-cover"
            />
            <h1 className="text-2xl font-bold">NeoHealth</h1>
          </div>
          <div className="text-right">
            <p>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Système en ligne</span>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <div className="pt-24 pb-6 px-6"> {/* pt-24 pour éviter que le contenu soit caché par le header fixe */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MedecinLayout;
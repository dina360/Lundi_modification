// frontend/src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";

import DossierPatient from "./DossierPatient";
import Home from "./Home";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import Dashboard from "./Dashboard";
import HomePage from "./HomePage";
import PatientsList from "./PatientsList";
import RendezVousPage from "./RendezVousPage";
import ProtectedRoute from "./ProtectedRoute";

import "./App.css";

/* -------------------------------------------
   🔐 AJOUT DU TOKEN AUTOMATIQUEMENT DANS AXIOS
---------------------------------------------*/
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------------------------------
   📌 APP CONTENT
---------------------------------------------*/
function AppContent() {
  return (
    <div className="app-container">
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<HomePage />} />

        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Espace staff (admin / medecin / secretaire) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute roles={["admin", "medecin", "secretaire"]}>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["admin", "medecin", "secretaire"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute roles={["admin", "medecin", "secretaire"]}>
              <PatientsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients/:patientId/dossier"
          element={
            <ProtectedRoute roles={["admin", "medecin"]}>
              <DossierPatient />
            </ProtectedRoute>
          }
        />

        {/* Modules à venir */}
        <Route
          path="/personnel"
          element={
            <h2 className="text-xl font-semibold text-blue-700 p-6">
              👩‍⚕️ Gestion du Personnel (à venir)
            </h2>
          }
        />
        <Route
          path="/docteurs"
          element={
            <h2 className="text-xl font-semibold text-blue-700 p-6">
              🩺 Gestion des Docteurs (à venir)
            </h2>
          }
        />
        <Route
          path="/salles"
          element={
            <h2 className="text-xl font-semibold text-blue-700 p-6">
              🏥 Gestion des Salles et Blocs (à venir)
            </h2>
          }
        />

        {/* 📅 MODULE RENDEZ-VOUS COMPLET */}
        <Route
          path="/rendezvous"
          element={
            <ProtectedRoute roles={["admin", "medecin", "secretaire"]}>
              <RendezVousPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default AppContent;

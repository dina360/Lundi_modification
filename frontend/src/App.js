// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

import Dashboard from "./Dashboard";
import Home from "./Home"; // page admin (gestion patients avec sidebar)
import RendezVousPage from "./RendezVousPage";
import DossierPatient from "./DossierPatient";
import StaffPage from "./staff/StaffPage";

import DoctorsList from "./doctors/DoctorsList";
import DoctorDetail from "./doctors/DoctorDetail";
import AddDoctor from "./doctors/AddDoctor";
import EditDoctor from "./doctors/EditDoctor";

import SallesBlocs from "./SallesBlocs";

import ProtectedRoute from "./ProtectedRoute";
import "./App.css";

/* --- IMPORTS MALADE --- */
import MaladeHome from "./malade/MaladeHome";
import MaladeDemandeRdv from "./malade/MaladeDemandeRdv";
import MaladeHistoriqueRdv from "./malade/MaladeHistoriqueRdv";
import MaladeProfile from "./malade/MaladeProfile";

/* ============================
   Composants simples par rôle
   ============================ */

const PatientHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Patient</h1>
    <p>Bienvenue sur votre espace patient. (En cours de développement)</p>
  </div>
);

const MedecinHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Médecin</h1>
    <p>Tableau de bord médecin. (Fonctionnalités à ajouter)</p>
  </div>
);

const SecretaireHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Secrétaire</h1>
    <p>Gestion des rendez-vous et patients. (À compléter)</p>
  </div>
);

function AppContent() {
  return (
    <div className="app-container">
      <Routes>
        {/* =================
            ROUTES PUBLIQUES
           ================= */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* =================
              ADMIN
           ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Home />
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

        {/* RDV : admin + medecin + secretaire */}
        <Route
          path="/rendezvous"
          element={
            <ProtectedRoute roles={["admin", "medecin", "secretaire"]}>
              <RendezVousPage />
            </ProtectedRoute>
          }
        />

        {/* =================
            ESPACE MALADE
           ================= */}
        <Route
          path="/malade/home"
          element={
            <ProtectedRoute roles={["patient"]}>
              <MaladeHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/malade/rendezvous/demande"
          element={
            <ProtectedRoute roles={["patient"]}>
              <MaladeDemandeRdv />
            </ProtectedRoute>
          }
        />

        <Route
          path="/malade/rendezvous/historique"
          element={
            <ProtectedRoute roles={["patient"]}>
              <MaladeHistoriqueRdv />
            </ProtectedRoute>
          }
        />

        <Route
          path="/malade/rendezvous/modifier/:rdvId"
          element={
            <ProtectedRoute roles={["patient"]}>
              <MaladeHistoriqueRdv />
            </ProtectedRoute>
          }
        />

        <Route
          path="/malade/profile"
          element={
            <ProtectedRoute roles={["patient"]}>
              <MaladeProfile />
            </ProtectedRoute>
          }
        />

        {/* =================
            ESPACES PAR RÔLE
           ================= */}
        <Route
          path="/patient/home"
          element={
            <ProtectedRoute roles={["patient"]}>
              <PatientHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medecin/home"
          element={
            <ProtectedRoute roles={["medecin"]}>
              <MedecinHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secretaire/home"
          element={
            <ProtectedRoute roles={["secretaire"]}>
              <SecretaireHome />
            </ProtectedRoute>
          }
        />

        {/* =================
             PERSONNEL ADMIN
           ================= */}
        <Route
          path="/personnel"
          element={
            <ProtectedRoute roles={["admin"]}>
              <StaffPage />
            </ProtectedRoute>
          }
        />

        {/* =================
            MÉDECINS (ADMIN)
           ================= */}
        <Route
          path="/docteurs"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DoctorsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docteurs/ajouter"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AddDoctor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docteurs/:id"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DoctorDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docteurs/:id/edit"
          element={
            <ProtectedRoute roles={["admin"]}>
              <EditDoctor />
            </ProtectedRoute>
          }
        />

        {/* =================
            SALLES & BLOCS
           ================= */}
        <Route
          path="/salles"
          element={
            <ProtectedRoute roles={["admin"]}>
              <SallesBlocs />
            </ProtectedRoute>
          }
        />

        {/* =================
             FALLBACK
           ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default AppContent;

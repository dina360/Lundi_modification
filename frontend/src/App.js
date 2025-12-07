// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

import Dashboard from "./Dashboard";
import PatientsList from "./PatientsList";
import RendezVousPage from "./RendezVousPage";
import DossierPatient from "./DossierPatient";

import ProtectedRoute from "./ProtectedRoute";

import MedecinLayout from "./medecin/MedecinLayout";
import MedecinDashboard from "./medecin/MedecinDashboard";
import MedecinProfile from "./medecin/MedecinProfile";
import MedecinPatientsList from "./medecin/MedecinPatientsList";
import AddConsultation from "./medecin/AddConsultation";
import SelectPatientForConsultation from "./medecin/SelectPatientForConsultation";
import ManageAppointments from "./medecin/ManageAppointments";

// Petites pages placeholder pour chaque rôle
const PatientHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Patient</h1>
    <p>Bienvenue sur votre espace patient (en cours de développement).</p>
  </div>
);

const SecretaireHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Secrétaire</h1>
    <p>Interface de gestion des rendez-vous et patients (à compléter).</p>
  </div>
);

// const ManageAppointments = () => (
//   <div style={{ padding: "2rem" }}>
//     <h1>Gérer les Rendez-vous</h1>
//     <p>Interface pour gérer les rendez-vous (à implémenter).</p>
//   </div>
// );

function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🔹 ADMIN */}
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
        <Route
          path="/rendezvous"
          element={
            <ProtectedRoute roles={["admin", "medecin", "secretaire"]}>
              <RendezVousPage />
            </ProtectedRoute>
          }
        />

        {/* 🔹 ESPACE MÉDECIN avec layout */}
        <Route
          path="/medecin/*"
          element={
            <ProtectedRoute roles={["medecin"]}>
              <MedecinLayout />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<MedecinDashboard />} />
          <Route path="profile" element={<MedecinProfile />} />
          <Route path="patients" element={<MedecinPatientsList />} />
          <Route path="PatientDetails" element={<SelectPatientForConsultation/>} />
          <Route path="patients/:patientId/ajouter-consultation" element={<AddConsultation />} />
          <Route path="manage-appointments" element={<ManageAppointments />} />
        </Route>

        {/* 🔹 ESPACE PATIENT */}
        <Route
          path="/patient/home"
          element={
            <ProtectedRoute roles={["patient"]}>
              <PatientHome />
            </ProtectedRoute>
          }
        />

        {/* 🔹 ESPACE SECRÉTAIRE */}
        <Route
          path="/secretaire/home"
          element={
            <ProtectedRoute roles={["secretaire"]}>
              <SecretaireHome />
            </ProtectedRoute>
          }
        />

        {/* Routes admin “à venir” */}
        <Route
          path="/personnel"
          element={
            <ProtectedRoute roles={["admin"]}>
              <h2 className="text-xl font-semibold text-blue-700 p-6">
                👩‍⚕️ Gestion du Personnel (à venir)
              </h2>
            </ProtectedRoute>
          }
        />
        <Route
          path="/docteurs"
          element={
            <ProtectedRoute roles={["admin"]}>
              <h2 className="text-xl font-semibold text-blue-700 p-6">
                🩺 Gestion des Docteurs (à venir)
              </h2>
            </ProtectedRoute>
          }
        />
        <Route
          path="/salles"
          element={
            <ProtectedRoute roles={["admin"]}>
              <h2 className="text-xl font-semibold text-blue-700 p-6">
                🏥 Gestion des Salles et Blocs (à venir)
              </h2>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

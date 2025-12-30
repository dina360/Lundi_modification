// frontend/src/App.js
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { io } from "socket.io-client";

import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

import Dashboard from "./Dashboard";
import Home from "./Home";
import RendezVousPage from "./RendezVousPage";
import DossierPatient from "./DossierPatient";
import StaffPage from "./staff/StaffPage";

// ✅ IA
import PredictionPatient from "./PredictionPatient";

// Espace Médecin
import MedecinLayout from "./medecin/MedecinLayout";
import MedecinDashboard from "./medecin/MedecinDashboard";
import MedecinProfile from "./medecin/MedecinProfile";
import MedecinPatientsList from "./medecin/MedecinPatientsList";
import AddConsultation from "./medecin/AddConsultation";
import SelectPatientForConsultation from "./medecin/SelectPatientForConsultation";
import MedecinDisponibilites from "./medecin/MedecinDisponibilites";

// Gestion Médecins (Admin)
import DoctorsList from "./doctors/DoctorsList";
import DoctorDetail from "./doctors/DoctorDetail";
import AddDoctor from "./doctors/AddDoctor";
import EditDoctor from "./doctors/EditDoctor";

import SallesBlocs from "./SallesBlocs";
import ProtectedRoute from "./ProtectedRoute";
import "./App.css";

// Espace Malade
import MaladeHome from "./malade/MaladeHome";
import MaladeDemandeRdv from "./malade/MaladeDemandeRdv";
import MaladeHistoriqueRdv from "./malade/MaladeHistoriqueRdv";
import MaladeProfile from "./malade/MaladeProfile";

// Composants simples
const SecretaireHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Secrétaire</h1>
    <p>Gestion des rendez-vous et dossiers.</p>
  </div>
);

function App() {
  // ============================
  // Socket.io (connexion globale)
  // ============================
  useEffect(() => {
    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🟢 Connecté au serveur Socket.io");
    });

    socket.on("newMessage", (message) => {
      console.log("📩 Nouveau message reçu :", message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="app-container">
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ================= ADMIN ================= */}
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

        <Route
          path="/personnel"
          element={
            <ProtectedRoute roles={["admin"]}>
              <StaffPage />
            </ProtectedRoute>
          }
        />

        {/* ================= MALADE (PATIENT) ================= */}
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
          path="/malade/rendezvous/modifier/:rdvId"
          element={
            <ProtectedRoute roles={["patient"]}>
              <MaladeHistoriqueRdv />
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
          path="/malade/profile"
          element={
            <ProtectedRoute roles={["patient"]}>
              <MaladeProfile />
            </ProtectedRoute>
          }
        />

        {/* ================= IA PREDICTION (PATIENT) ================= */}
        <Route
          path="/malade/prediction"
          element={
            <ProtectedRoute roles={["patient"]}>
              <PredictionPatient />
            </ProtectedRoute>
          }
        />

        {/* Compat si ancien bouton utilise /patient/prediction */}
        <Route
          path="/patient/prediction"
          element={
            <ProtectedRoute roles={["patient"]}>
              <PredictionPatient />
            </ProtectedRoute>
          }
        />

        {/* ================= RENDEZ-VOUS ================= */}
        <Route
          path="/rendezvous"
          element={
            <ProtectedRoute roles={["admin", "medecin", "secretaire"]}>
              <RendezVousPage />
            </ProtectedRoute>
          }
        />

        {/* ================= MEDECINS (ADMIN) ================= */}
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

        {/* ================= SALLES ================= */}
        <Route
          path="/salles"
          element={
            <ProtectedRoute roles={["admin"]}>
              <SallesBlocs />
            </ProtectedRoute>
          }
        />

        {/* ================= ESPACE MEDECIN ================= */}
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
          <Route path="PatientDetails" element={<SelectPatientForConsultation />} />
          <Route
            path="patients/:patientId/ajouter-consultation"
            element={<AddConsultation />}
          />
          <Route path="dispoMedecin" element={<MedecinDisponibilites />} />
        </Route>

        {/* ================= SECRETAIRE ================= */}
        <Route
          path="/secretaire/home"
          element={
            <ProtectedRoute roles={["secretaire"]}>
              <SecretaireHome />
            </ProtectedRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

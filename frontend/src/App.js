import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

import Dashboard from "./Dashboard";
import Home from "./Home"; 
import RendezVousPage from "./RendezVousPage";
import DossierPatient from "./DossierPatient";
import StaffPage from "./staff/StaffPage";
import ProtectedRoute from "./ProtectedRoute";

// Espace Médecin
import MedecinLayout from "./medecin/MedecinLayout";
import MedecinDashboard from "./medecin/MedecinDashboard";
import MedecinProfile from "./medecin/MedecinProfile";
import MedecinPatientsList from "./medecin/MedecinPatientsList";
import AddConsultation from "./medecin/AddConsultation";
import SelectPatientForConsultation from "./medecin/SelectPatientForConsultation";
import ManageAppointments from "./medecin/ManageAppointments";

// Gestion Médecins (Admin)
import DoctorsList from "./doctors/DoctorsList";
import DoctorDetail from "./doctors/DoctorDetail";
import AddDoctor from "./doctors/AddDoctor";
import EditDoctor from "./doctors/EditDoctor";
import SecretaireHome from "./SecretaireHome";
import SecretaireRendezVous from "./SecretaireRendezVous";
import SecretairePatientsList from "./secretaire/SecretairePatientsList";

import SallesBlocs from "./SallesBlocs";
import SecretaireSalles from "./SecretaireSalles";
import SecretaireReservationsHistory from "./SecretaireReservationsHistory";


/* ============================
   Espaces Rôles
   ============================ */
const PatientHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Patient</h1>
    <p>Bienvenue sur votre espace patient.</p>
  </div>
);

const MedecinHome = () => (
  <div style={{ padding: "2rem" }}>
    <h1>Espace Médecin</h1>
    <p>Tableau de bord médecin.</p>
  </div>
);



/* ============================
   ROUTES PRINCIPALES
   ============================ */

function App() {
  return (
    <div className="app-container">
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />


        {/* ---------------- ADMIN ---------------- */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={["admin"]}><Dashboard /></ProtectedRoute>
        }/>

        <Route path="/patients" element={
          <ProtectedRoute roles={["admin"]}><Home /></ProtectedRoute>
        }/>

        <Route path="/patients/:patientId/dossier" element={
          <ProtectedRoute roles={["admin","medecin"]}><DossierPatient /></ProtectedRoute>
        }/>


        {/* Rendez-vous → admin + medecin + secretaire */}
        <Route path="/rendezvous" element={
          <ProtectedRoute roles={["admin","medecin","secretaire"]}><RendezVousPage /></ProtectedRoute>
        }/>


        {/* ---------------- ESPACE MÉDECIN ---------------- */}
        <Route path="/medecin/*" element={
          <ProtectedRoute roles={["medecin"]}><MedecinLayout /></ProtectedRoute>
        }>
          <Route path="home" element={<MedecinDashboard />} />
          <Route path="profile" element={<MedecinProfile />} />
          <Route path="patients" element={<MedecinPatientsList />} />
          <Route path="PatientDetails" element={<SelectPatientForConsultation />} />
          <Route path="patients/:patientId/ajouter-consultation" element={<AddConsultation />} />
          <Route path="manage-appointments" element={<ManageAppointments />} />
        </Route>


        {/* ---------------- PATIENT ---------------- */}
        <Route path="/patient/home" element={
          <ProtectedRoute roles={["patient"]}><PatientHome /></ProtectedRoute>
        }/>


        {/* ---------------- SECRÉTAIRE ---------------- */}
        <Route path="/secretaire/home" element={
          <ProtectedRoute roles={["secretaire"]}><SecretaireHome /></ProtectedRoute>
        }/>
<Route
  path="/secretaire/rendezvous"
  element={
    <ProtectedRoute roles={["secretaire"]}>
      <SecretaireRendezVous />
    </ProtectedRoute>
  }
/>
<Route
  path="/secretaire/patients"
  element={
    <ProtectedRoute roles={["secretaire"]}>
      <SecretairePatientsList />
    </ProtectedRoute>
  }
/>
<Route path="/secretaire/salles" element={<SecretaireSalles />} />
<Route path="/secretaire/salles/historique" element={<SecretaireReservationsHistory />} />


        {/* ---------------- PERSONNEL ADMIN ---------------- */}
        <Route path="/personnel" element={
          <ProtectedRoute roles={["admin"]}><StaffPage /></ProtectedRoute>
        }/>


        {/* ---------------- GESTION MÉDECINS (admin) ---------------- */}
        <Route path="/docteurs" element={
          <ProtectedRoute roles={["admin"]}><DoctorsList /></ProtectedRoute>
        }/>
        <Route path="/docteurs/ajouter" element={
          <ProtectedRoute roles={["admin"]}><AddDoctor /></ProtectedRoute>
        }/>
        <Route path="/docteurs/:id" element={
          <ProtectedRoute roles={["admin"]}><DoctorDetail /></ProtectedRoute>
        }/>
        <Route path="/docteurs/:id/edit" element={
          <ProtectedRoute roles={["admin"]}><EditDoctor /></ProtectedRoute>
        }/>


        {/* Salles & Blocs */}
        <Route path="/salles" element={
          <ProtectedRoute roles={["admin"]}><SallesBlocs /></ProtectedRoute>
        }/>


        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </div>
  );
}

export default App;

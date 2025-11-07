import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DossierPatient from './DossierPatient';
import Home from './Home';
import Login from './LoginPage'; // Assurez-vous que le fichier LoginPage existe.
import RegisterPage from './RegisterPage';
import Dashboard from './Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} /> {/* Route ajoutée pour le Dashboard */}
      <Route path="/patients/:patientId/dossier" element={<DossierPatient />} />
    </Routes>
  );
}

export default App;

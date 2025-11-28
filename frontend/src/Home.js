// src/Home.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AddPatientModal from './AddPatientModal';
import EditPatientModal from './EditPatientModal';
import { FiHome, FiUsers, FiCalendar, FiUserPlus, FiSearch, FiLogOut } from 'react-icons/fi';
import "./Home.css";
import logo from './assets/neohealth-logo.jpg';

function Home() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Récupération des patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/patients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des patients:', error);
      }
    };
    fetchPatients();
  }, []);

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(search.toLowerCase()) ||
    patient.dossier.includes(search)
  );

  const addPatient = async (newPatient) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:5000/api/patients', newPatient, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients([...patients, response.data]);
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
    }
  };

  const editPatient = async (updatedPatient) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `http://localhost:5000/api/patients/${updatedPatient._id}`,
        updatedPatient,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatients(patients.map(p => p._id === updatedPatient._id ? response.data : p));
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };

  const handleDelete = async (_id) => {
    if (window.confirm('Confirmer suppression ?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:5000/api/patients/${_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(patients.filter(p => p._id !== _id));
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const handleViewDossier = (patientId) => navigate(`/patients/${patientId}/dossier`);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  // Pour gérer la classe active du menu
  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="NeoHealth Logo" className="logo-img" />
            <div className="logo-text">
              <h2>NeoHealth</h2>
              <p>Medical Suite</p>
            </div>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <div className={`hamburger ${sidebarOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">GÉNÉRAL</h3>

            <button
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              <FiHome className="nav-icon" />
              <span>Tableau de Bord</span>
            </button>

            <button
              className={`nav-item ${isActive('/home') ? 'active' : ''}`}
              onClick={() => navigate('/home')}
            >
              <FiUsers className="nav-icon" />
              <span>Gestion Patients</span>
            </button>

            <button
              className={`nav-item ${isActive('/rendezvous') ? 'active' : ''}`}
              onClick={() => navigate('/rendezvous')}
            >
              <FiCalendar className="nav-icon" />
              <span>Rendez-vous</span>
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">ADMINISTRATION</h3>
            <button className="nav-item" onClick={() => navigate('/personnel')}>
              <FiUsers className="nav-icon" />
              <span>Personnel Médical</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/docteurs')}>
              <FiUsers className="nav-icon" />
              <span>Médecins</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/salles')}>
              <FiUsers className="nav-icon" />
              <span>Salles & Blocs</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'content-shifted' : ''}`}>
        {/* Header */}
        <header className="content-header">
          <div className="header-actions">
            <h1>Gestion des Patients</h1>
            <div className="header-stats">
              <div className="stat-card">
                <span className="stat-number">{patients.length}</span>
                <span className="stat-label">Patients Totaux</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {patients.filter(p => p.nextAppointment).length}
                </span>
                <span className="stat-label">RDV Programmé</span>
              </div>
            </div>
          </div>

          <div className="search-section">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                className="search-input"
                placeholder="Rechercher un patient..."
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="add-patient-btn"
            >
              <FiUserPlus className="btn-icon" />
              Nouveau Patient
            </button>
          </div>
        </header>

        {/* ✅ Liste des patients (tableau) */}
        {filteredPatients.length > 0 ? (
          <div className="patients-table-wrapper">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Dossier</th>
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th>Adresse</th>
                  <th>Dernier RDV</th>
                  <th>Prochain RDV</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient._id}>
                    <td>#{patient.dossier}</td>
                    <td>{patient.name}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.address}</td>
                    <td>
                      {patient.lastAppointment
                        ? new Date(patient.lastAppointment).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      {patient.nextAppointment
                        ? new Date(patient.nextAppointment).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      <span className={`status-badge ${patient.nextAppointment ? 'active' : 'inactive'}`}>
                        {patient.nextAppointment ? 'Suivi en cours' : 'En attente'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleViewDossier(patient._id)}
                        className="action-btn view-btn"
                        title="Voir dossier"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => { setSelectedPatient(patient); setIsEditModalOpen(true); }}
                        className="action-btn edit-btn"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="action-btn delete-btn"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Empty state
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>Aucun patient trouvé</h3>
            <p>
              {search
                ? 'Aucun patient ne correspond à votre recherche.'
                : 'Commencez par ajouter votre premier patient.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="add-patient-btn primary"
            >
              <FiUserPlus className="btn-icon" />
              Ajouter un patient
            </button>
          </div>
        )}

        {/* Modals */}
        {isAddModalOpen && (
          <AddPatientModal 
            onClose={() => setIsAddModalOpen(false)} 
            onAddPatient={addPatient}
          />
        )}

        {isEditModalOpen && (
          <EditPatientModal 
            patient={selectedPatient}
            onClose={() => setIsEditModalOpen(false)}
            onEditPatient={editPatient}
          />
        )}
      </div>
    </div>
  );
}

export default Home;

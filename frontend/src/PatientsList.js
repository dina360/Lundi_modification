import axios from 'axios';
import React, { useEffect, useState } from 'react';
import EditPatientModal from './EditPatientModal';
import { useNavigate } from 'react-router-dom';
import { 
  FiEdit, 
  FiTrash2, 
  FiUser, 
  FiSearch, 
  FiPlus,
  FiFilter,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import "./PatientsList.css";


const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());

  const navigate = useNavigate();

  // Récupérer le token
  const token = localStorage.getItem('authToken');

  // Récupérer les patients au chargement du composant
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    axios
      .get('http://localhost:5000/api/patients', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setPatients(response.data);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des patients:', error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, navigate]);

  // Fonction pour supprimer un patient
  const deletePatient = (_id) => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      return;
    }

    axios
      .delete(`http://localhost:5000/api/patients/${_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setPatients(patients.filter((patient) => patient._id !== _id));
        // Retirer de la sélection si présent
        const newSelected = new Set(selectedRows);
        newSelected.delete(_id);
        setSelectedRows(newSelected);
      })
      .catch((error) => {
        console.error('Erreur lors de la suppression du patient:', error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      });
  };

  // Fonction pour gérer l'édition d'un patient
  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  // Fonction pour mettre à jour un patient dans la liste
  const updatePatient = (updatedPatient) => {
    setPatients(
      patients.map((patient) =>
        patient._id === updatedPatient._id ? updatedPatient : patient
      )
    );
  };

  // Filtrer les patients selon la recherche
  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.dossier?.toString().includes(searchTerm)
  );

  // Gérer la sélection des lignes
  const toggleRowSelection = (patientId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(patientId)) {
      newSelected.delete(patientId);
    } else {
      newSelected.add(patientId);
    }
    setSelectedRows(newSelected);
  };

  // Sélectionner/désélectionner tous
  const toggleSelectAll = () => {
    if (selectedRows.size === filteredPatients.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredPatients.map(p => p._id)));
    }
  };

  return (
    <div className="patients-management">
      {/* En-tête de page */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <FiUser className="title-icon" />
            Gestion des Patients
          </h1>
          <p className="page-subtitle">
            {patients.length} patient(s) au total
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            <FiPlus className="btn-icon" />
            Nouveau Patient
          </button>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="toolbar-actions">
          <button className="toolbar-btn">
            <FiFilter className="btn-icon" />
            Filtres
          </button>
          <button className="toolbar-btn">
            <FiDownload className="btn-icon" />
            Exporter
          </button>
          <button className="toolbar-btn" onClick={() => window.location.reload()}>
            <FiRefreshCw className="btn-icon" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Tableau des patients */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <FiRefreshCw className="loading-icon" />
            <p>Chargement des patients...</p>
          </div>
        ) : (
          <table className="patients-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filteredPatients.length && filteredPatients.length > 0}
                    onChange={toggleSelectAll}
                    className="row-checkbox"
                  />
                </th>
                <th className="name-column">Patient</th>
                <th className="dossier-column">Dossier</th>
                <th className="contact-column">Contact</th>
                <th className="age-column">Âge</th>
                <th className="status-column">Statut</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <FiUser className="empty-icon" />
                    <p>Aucun patient trouvé</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr 
                    key={patient._id}
                    className={selectedRows.has(patient._id) ? 'selected' : ''}
                  >
                    <td className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(patient._id)}
                        onChange={() => toggleRowSelection(patient._id)}
                        className="row-checkbox"
                      />
                    </td>
                    <td className="name-column">
                      <div className="patient-info">
                        <div className="patient-avatar">
                          <FiUser />
                        </div>
                        <div className="patient-details">
                          <span className="patient-name">{patient.name}</span>
                          <span className="patient-id">ID: {patient._id?.substring(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="dossier-column">
                      <span className="dossier-number">#{patient.dossier || 'N/A'}</span>
                    </td>
                    <td className="contact-column">
                      <div className="contact-info">
                        <span className="patient-email">{patient.email || 'Non renseigné'}</span>
                        <span className="patient-phone">{patient.phone || 'Non renseigné'}</span>
                      </div>
                    </td>
                    <td className="age-column">
                      <span className="age-badge">
                        {patient.age || 'N/A'} ans
                      </span>
                    </td>
                    <td className="status-column">
                      <span className={`status-badge ${patient.status || 'active'}`}>
                        {patient.status === 'active' ? 'Actif' : 
                         patient.status === 'inactive' ? 'Inactif' : 'Actif'}
                      </span>
                    </td>
                    <td className="actions-column">
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="btn-action edit"
                          title="Modifier"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => deletePatient(patient._id)}
                          className="btn-action delete"
                          title="Supprimer"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pied de tableau */}
      {filteredPatients.length > 0 && (
        <div className="table-footer">
          <div className="footer-info">
            {selectedRows.size > 0 ? (
              <span>{selectedRows.size} patient(s) sélectionné(s)</span>
            ) : (
              <span>{filteredPatients.length} patient(s) au total</span>
            )}
          </div>
        </div>
      )}

      {/* Modal pour modifier un patient */}
      {showModal && (
        <EditPatientModal
          patient={selectedPatient}
          onClose={() => setShowModal(false)}
          onUpdatePatient={updatePatient}
        />
      )}
    </div>
  );
};

export default PatientsList;
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import EditPatientModal from './EditPatientModal'; // Importer le modal

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);  // État pour le patient sélectionné
  const [showModal, setShowModal] = useState(false);  // Contrôle l'affichage de la modal

  // Récupérer les patients au chargement du composant
  useEffect(() => {
    axios.get('http://localhost:5000/api/patients')
      .then(response => {
        setPatients(response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des patients:', error);
      });
  }, []);

  // Fonction pour supprimer un patient
  const deletePatient = (_id) => {
    axios.delete(`http://localhost:5000/api/patients/${_id}`)
      .then(() => {
        setPatients(patients.filter(patient => patient._id !== _id));
      })
      .catch(error => {
        console.error('Erreur lors de la suppression du patient:', error);
      });
  };

  // Fonction pour gérer l'édition d'un patient
  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  // Fonction pour mettre à jour un patient dans la liste
  const updatePatient = (updatedPatient) => {
    setPatients(patients.map(patient => 
      patient._id === updatedPatient._id ? updatedPatient : patient
    ));
  };

  return (
    <div>
      <h2>Liste des patients</h2>
      <ul>
        {patients.map(patient => (
          <li key={patient._id}>
            {patient.name}
            <button onClick={() => handleEditPatient(patient)}>Modifier</button>
            <button onClick={() => deletePatient(patient._id)}>Supprimer</button>
          </li>
        ))}
      </ul>

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

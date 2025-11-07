// src/Home.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddPatientModal from './AddPatientModal';
import EditPatientModal from './EditPatientModal';

function Home() {
  // États
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Navigation
  const navigate = useNavigate();

  // Récupération des patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patients');
        setPatients(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des patients:', error);
      }
    };
    fetchPatients();
  }, []);

  // Handlers
  const handleSearch = (e) => setSearch(e.target.value);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(search.toLowerCase()) ||
    patient.dossier.includes(search)
  );

  const addPatient = async (newPatient) => {
    try {
      const response = await axios.post('http://localhost:5000/api/patients', newPatient);
      setPatients([...patients, response.data]);
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
    }
  };

  const editPatient = async (updatedPatient) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/patients/${updatedPatient._id}`,
        updatedPatient
      );
      setPatients(patients.map(p => p._id === updatedPatient._id ? response.data : p));
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };

  const handleDelete = async (_id) => {
    if (window.confirm('Confirmer suppression ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/patients/${_id}`);
        setPatients(patients.filter(p => p._id !== _id));
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const handleViewDossier = (patientId) => navigate(`/patients/${patientId}/dossier`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="backdrop-blur-lg bg-white/30 rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
        
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 text-center mb-6">
  Gestion des Patients
</h1>
<br></br><br></br><br></br><br></br>

          
          {/* Barre d'actions */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouveau Patient
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                placeholder="Rechercher patient..."
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Grille des patients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div key={patient._id} className="group backdrop-blur-lg bg-white/30 hover:bg-white/50 rounded-2xl shadow-xl p-6 border border-white/20 transition-all duration-300 hover:-translate-y-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{patient.name}</h3>
                  <p className="text-sm text-purple-600 font-mono">#{patient.dossier}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => handleViewDossier(patient._id)}
                    className="p-2 bg-white/80 hover:bg-white rounded-lg shadow-md"
                    title="Voir dossier"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-gray-600">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {patient.phone}
                </div>

                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {patient.address}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Dernier RDV</p>
                    <p className="font-semibold text-purple-600">
                      {patient.lastAppointment ? new Date(patient.lastAppointment).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Prochain RDV</p>
                    <p className="font-semibold text-green-600">
                      {patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2 mt-6 border-t border-white/20 pt-4">
                <button
                  onClick={() => { setSelectedPatient(patient); setIsEditModalOpen(true); }}
                  className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-600 px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(patient._id)}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-600 px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

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
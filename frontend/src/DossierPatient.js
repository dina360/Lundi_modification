import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function DossierPatient() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // 🔹 Récupérer le token dans localStorage
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        // 🔥 Ajouter le token dans l'en-tête
        const response = await axios.get(`http://localhost:5000/api/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatient(response.data);
        setDocuments(response.data.medicalRecords || []);
      } catch (err) {
        setError('Erreur lors de la récupération des détails du patient');
        console.error('Erreur:', err);
      }
    };
    fetchPatientDetails();
  }, [patientId, token]); // 🔹 Ajouter `token` dans les dépendances

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
      setUploadSuccess(null);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      // 🔥 Ajouter le token dans l'en-tête
      const response = await axios.post(
        `http://localhost:5000/api/patients/${patientId}/dossier`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` // ✅ Ajout du token
          }
        }
      );

      if (response.data?.document) {
        setDocuments([...documents, response.data.document]);
        setSelectedFile(null);
        setUploadSuccess("Document ajouté avec succès !");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'ajout du document");
    }
  };

  const handleDeleteDocument = async (docUrl) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        // 🔥 Ajouter le token dans l'en-tête
        await axios.delete(`http://localhost:5000/api/patients/${patientId}/dossier`, {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Ajout du token
          data: { document: docUrl }
        });
        setDocuments(documents.filter(doc => doc.url !== docUrl));
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  if (!patient) {
    return <div className="text-center p-4">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* En-tête avec photo */}
        <div className="backdrop-blur-lg bg-white/30 rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex flex-col items-center space-y-4">
            {patient.photo ? (
              <img 
                src={`http://localhost:5000${patient.photo}`} 
                alt={patient.name}
                className="w-32 h-32 rounded-full ring-4 ring-white/50 shadow-2xl object-cover"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full ring-4 ring-white/50" />
            )}
            <h1 className="text-4xl font-semibold text-purple-800">
              Dossier Médical
            </h1>
            <p className="text-2xl font-semibold text-gray-800">{patient.name}</p>
            <div className="flex gap-4 text-gray-600">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {patient.phone}
              </span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {patient.address}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-red-100/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {uploadSuccess && (
          <div className="p-4 bg-green-100/80 backdrop-blur-sm border border-green-200 rounded-xl flex items-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {uploadSuccess}
          </div>
        )}

        {/* Upload de documents */}
        <div className="backdrop-blur-lg bg-white/30 p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ajouter un document</h2>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl p-8 cursor-pointer transition-all duration-300 group">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-center space-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 group-hover:text-blue-500 mx-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 group-hover:text-gray-800">
                  {selectedFile ? selectedFile.name : 'Glissez-déposez ou cliquez pour sélectionner'}
                </p>
              </div>
            </label>
            <button
              onClick={handleUploadDocument}
              disabled={!selectedFile}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Téléverser le document
            </button>
          </div>
        </div>

        {/* Liste des documents */}
        <div className="backdrop-blur-lg bg-white/30 p-6 rounded-2xl shadow-xl border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Documents médicaux</h2>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun document disponible
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={index} className="group flex items-center justify-between p-4 bg-white/50 hover:bg-white/70 rounded-xl transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium truncate"
                    >
                      {doc.name}
                    </a>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.url)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DossierPatient;
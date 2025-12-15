import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUser, FiMail, FiPhone, FiSearch, FiChevronRight, FiLoader, FiX, FiAlertCircle } from "react-icons/fi";

export default function SelectPatientForConsultation() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  // Charger les patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/patients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
      } catch (err) {
        console.error("Erreur chargement patients:", err);
        setError("Erreur lors du chargement des patients.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [token]);

  // Filtrer les patients en fonction de la recherche
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  const handleSelectPatient = (patientId) => {
    navigate(`/medecin/patients/${patientId}/ajouter-consultation`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow max-w-md w-full">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 text-2xl mr-3" />
            <h2 className="text-lg font-bold text-red-700">Erreur</h2>
          </div>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin text-blue-600 text-4xl mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiUser className="text-blue-600 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Ajouter une Consultation</h1>
                <p className="text-gray-600">Sélectionnez un patient pour continuer</p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Liste des patients */}
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-10">
              <FiUser className="mx-auto text-gray-300 text-5xl" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun patient trouvé</h3>
              <p className="mt-1 text-gray-500">Essayez de modifier votre recherche.</p>
            </div>
          ) : (
            filteredPatients.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl shadow hover:shadow-md transition-shadow duration-300 border border-gray-100 p-5 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FiUser className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">{p.name}</h2>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <FiMail className="mr-2" /> {p.email}
                    </div>
                    {p.phone && (
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <FiPhone className="mr-2" /> {p.phone}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleSelectPatient(p._id)}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sélectionner <FiChevronRight className="ml-2" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
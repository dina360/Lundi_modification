// src/medecin/MedecinPatientDossier.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiFolder, FiFileText, FiUser, FiX } from "react-icons/fi";

export default function MedecinPatientDossier() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les infos du patient
        const patientRes = await axios.get(`http://localhost:5000/api/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPatient(patientRes.data);

        // Charger les consultations du patient
        const consultationsRes = await axios.get(`http://localhost:5000/api/consultations/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setConsultations(consultationsRes.data);
      } catch (err) {
        console.error("Erreur chargement dossier :", err);
        setError("Erreur lors du chargement du dossier.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, token]);

  if (loading) return <div className="p-6 text-center">Chargement du dossier...</div>;
  if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;

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
                <h1 className="text-2xl font-bold text-gray-800">Dossier Médical de {patient.name}</h1>
                <p className="text-gray-600">Informations du patient</p>
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

        {/* Informations du patient */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FiUser className="mr-2 text-blue-600" /> Informations Personnelles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Nom</label>
              <p className="p-3 bg-gray-100 rounded-lg">{patient.name}</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <p className="p-3 bg-gray-100 rounded-lg">{patient.email}</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Téléphone</label>
              <p className="p-3 bg-gray-100 rounded-lg">{patient.phone || "Non renseigné"}</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Adresse</label>
              <p className="p-3 bg-gray-100 rounded-lg">{patient.address || "Non renseignée"}</p>
            </div>
          </div>
        </div>

        {/* Consultations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FiFileText className="mr-2 text-green-600" /> Consultations
          </h2>
          {consultations.length === 0 ? (
            <p className="text-gray-500">Aucune consultation pour ce patient.</p>
          ) : (
            <ul className="space-y-4">
              {consultations.map((c) => (
                <li key={c._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">
                      {new Date(c.date).toLocaleDateString('fr-FR')} à {new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </h3>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Diagnostic :</span> {c.diagnostic || "Non renseigné"}
                    </p>
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Notes :</span> {c.notes || "Aucune note"}
                    </p>
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Prescription :</span> {c.prescription || "Aucune prescription"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
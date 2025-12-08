// src/doctors/DoctorDetail.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiActivity as FiStethoscope,
  FiFileText,
  FiCalendar,
  FiArrowLeft,
} from "react-icons/fi";

import Sidebar from "../Sidebar";

const DoctorDetail = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/doctors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(res.data);
      } catch (err) {
        console.error("Erreur chargement médecin:", err);
        setError("Impossible de charger les détails de ce médecin.");
      }
    };
    if (token) loadDoctor();
  }, [id, token]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Disponible":
        return "bg-green-100 text-green-800 border-green-300";
      case "Occupé":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-300";
      case "En congé":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="docteurs"
      />

      <div className={`transition-all duration-300 min-h-screen ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        {/* En-tête Royal */}
        <header className="bg-gradient-to-r from-blue-800 via-royalblue-900 to-blue-900 text-white p-8 -mt-8 -mx-8 mb-8 shadow-2xl border-b-4 border-gold-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/docteurs")}
                className="flex items-center space-x-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-white/30"
              >
                <FiArrowLeft className="text-lg" />
                <span>Retour</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <FiUser className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Profil Médecin</h1>
                  <p className="text-blue-100 mt-2 text-lg">
                    Détails complets du profil médical
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-blue-200 text-sm">Hôpital NeoHealth</div>
              <div className="text-white font-semibold">Dossier Médical</div>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <div className="max-w-5xl mx-auto px-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 font-medium">
              {error}
            </div>
          )}

          {!doctor ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border border-gray-100">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-6"></div>
              <h3 className="text-xl font-bold text-gray-800">Chargement du profil...</h3>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* En-tête du profil */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-8 text-white">
                <div className="flex items-center space-x-8">
                  {doctor.photo ? (
                    <img
                      src={`http://localhost:5000${doctor.photo}`}
                      alt={doctor.name}
                      className="w-28 h-28 rounded-full object-cover border-4 border-white/40 shadow-2xl"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold border-4 border-white/40 shadow-2xl">
                      {doctor.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h2 className="text-3xl font-bold flex items-center">
                        <FiUser className="mr-4" />
                        {doctor.name}
                      </h2>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(doctor.status)}`}>
                        {doctor.status || "Disponible"}
                      </span>
                    </div>
                    <p className="text-blue-100 flex items-center text-xl font-semibold">
                      <FiStethoscope className="mr-3" />
                      {doctor.specialty}
                    </p>
                  </div>
                </div>
              </div>

              {/* Détails du profil */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Informations de contact */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-900 pb-3">
                      Informations de Contact
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                        <div className="p-3 bg-blue-900 rounded-xl">
                          <FiMail className="text-white text-xl" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Email</p>
                          <p className="font-bold text-gray-900 text-lg">{doctor.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                        <div className="p-3 bg-blue-900 rounded-xl">
                          <FiPhone className="text-white text-xl" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Téléphone</p>
                          <p className="font-bold text-gray-900 text-lg">
                            {doctor.phone || "Non renseigné"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-900 pb-3">
                      Informations Complémentaires
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                        <div className="p-3 bg-blue-900 rounded-xl mt-1">
                          <FiFileText className="text-white text-xl" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Notes</p>
                          <p className="font-medium text-gray-900">
                            {doctor.notes || "Aucune note enregistrée."}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                        <div className="p-3 bg-blue-900 rounded-xl">
                          <FiCalendar className="text-white text-xl" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Date de création</p>
                          <p className="font-bold text-gray-900">
                            {doctor.createdAt
                              ? new Date(doctor.createdAt).toLocaleString("fr-FR")
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
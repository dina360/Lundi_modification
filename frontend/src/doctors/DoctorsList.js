// src/doctors/DoctorsList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiActivity as FiStethoscope,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiEye,
  FiUsers,
} from "react-icons/fi";

import Sidebar from "../Sidebar";

const DoctorsList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/doctors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data || []);
      } catch (err) {
        console.error("Erreur chargement médecins:", err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [token, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce médecin ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Erreur suppression médecin:", err);
      alert("Erreur lors de la suppression.");
    }
  };

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

  const filteredDoctors = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.specialty?.toLowerCase().includes(q)
    );
  });

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
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <FiUsers className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Gestion des Médecins</h1>
                  <p className="text-blue-100 mt-2 text-lg">
                    Corps médical de l'Hôpital NeoHealth
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right mr-6">
                <div className="text-blue-200 text-sm">Hôpital NeoHealth</div>
                <div className="text-white font-semibold">Plateforme Médicale</div>
              </div>
              <button
                onClick={() => navigate("/docteurs/ajouter")}
                className="flex items-center space-x-3 bg-white text-blue-900 hover:bg-blue-50 px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-white"
              >
                <FiPlus className="text-xl" />
                <span>Nouveau Médecin</span>
              </button>
            </div>
          </div>
        </header>

        {/* Section Recherche */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-2xl">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                  placeholder="Rechercher un médecin par nom, email ou spécialité..."
                />
              </div>
              <div className="ml-6 px-4 py-2 bg-blue-900 text-white rounded-lg font-bold">
                {filteredDoctors.length} Médecin(s)
              </div>
            </div>
          </div>
        </div>

        {/* Section Tableau */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-6"></div>
                <h3 className="text-xl font-bold text-gray-800">Chargement du corps médical...</h3>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-7xl mb-6">👨‍⚕️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {doctors.length === 0 ? "Aucun médecin enregistré" : "Aucun résultat"}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {doctors.length === 0 
                    ? "Commencez par ajouter le premier médecin de l'établissement." 
                    : "Aucun médecin ne correspond à votre recherche."}
                </p>
                <button
                  onClick={() => navigate("/docteurs/ajouter")}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl border-2 border-blue-900"
                >
                  <FiPlus className="text-xl" />
                  <span>Ajouter un Médecin</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-800 to-blue-900 border-b-4 border-blue-700">
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                        Médecin
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                        Spécialité
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                        Date d'ajout
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDoctors.map((doc) => (
                      <tr key={doc._id} className="hover:bg-blue-50/50 transition-colors duration-200 group">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {doc.photo ? (
                                <img
                                  src={`http://localhost:5000${doc.photo}`}
                                  alt={doc.name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-900 font-bold border-2 border-white shadow-lg">
                                  {doc.name?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-lg">{doc.name}</div>
                              <div className="text-sm text-gray-500 font-medium">
                                ID: {doc._id?.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center text-gray-700 font-semibold">
                            <FiStethoscope className="mr-3 text-blue-900 text-lg" />
                            {doc.specialty || "Non renseignée"}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-700 font-semibold">
                              <FiMail className="mr-3 text-blue-900" />
                              {doc.email}
                            </div>
                            {doc.phone && (
                              <div className="flex items-center text-gray-600">
                                <FiPhone className="mr-3 text-blue-900" />
                                {doc.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full border-2 ${getStatusColor(doc.status)}`}>
                            {doc.status || "Disponible"}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-gray-700 font-semibold">
                          {doc.createdAt
                            ? new Date(doc.createdAt).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => navigate(`/docteurs/${doc._id}`)}
                              className="p-3 text-blue-900 hover:text-white hover:bg-blue-900 rounded-xl transition-all duration-300 border-2 border-blue-900 hover:border-blue-800"
                              title="Voir détails"
                            >
                              <FiEye className="text-xl" />
                            </button>
                            <button
                              onClick={() => navigate(`/docteurs/${doc._id}/edit`)}
                              className="p-3 text-green-700 hover:text-white hover:bg-green-700 rounded-xl transition-all duration-300 border-2 border-green-700 hover:border-green-600"
                              title="Modifier"
                            >
                              <FiEdit className="text-xl" />
                            </button>
                            <button
                              onClick={() => handleDelete(doc._id)}
                              className="p-3 text-red-700 hover:text-white hover:bg-red-700 rounded-xl transition-all duration-300 border-2 border-red-700 hover:border-red-600"
                              title="Supprimer"
                            >
                              <FiTrash2 className="text-xl" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsList;
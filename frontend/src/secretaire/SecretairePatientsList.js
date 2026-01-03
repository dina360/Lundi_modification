// src/PatientsList.js
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import EditPatientModal from "./EditPatientModal";
import AddPatientModal from "./AddPatientModal";

import "./neoShell.css";
import neohealthLogo from "./neohealth-logo.jpg";
import { LuHistory } from "react-icons/lu";

import { LuLayoutDashboard, LuUsers, LuCalendarCheck, LuBuilding2, LuLogOut } from "react-icons/lu";
import {
  FiEdit,
  FiTrash2,
  FiUser,
  FiSearch,
  FiPlus,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiCalendar,
  FiUsers,
  FiActivity,
  FiBarChart2,
  FiMoreVertical,
} from "react-icons/fi";

import { api } from "./api";

function calcAgeFromBirthDate(birthDate) {
  if (!birthDate) return 0;
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age < 0 ? 0 : age;
}

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    averageAge: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("authToken");

  const isActive = (path) => location.pathname === path;

  // NAV
  const goToHome = () => navigate("/secretaire/home");
  const goToPatients = () => navigate("/secretaire/patients");
  const goToAgenda = () => navigate("/secretaire/rendezvous");
  const goToSalles = () => navigate("/secretaire/salles");
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const calculateStats = (patientsData) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const newThisMonth = patientsData.filter((p) => {
      if (!p.createdAt) return false;
      const createdDate = new Date(p.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    const ages = patientsData.map((p) => {
      const a = parseInt(p.age, 10);
      if (!isNaN(a) && a > 0) return a;
      return calcAgeFromBirthDate(p.birthDate);
    });

    const totalAge = ages.reduce((sum, a) => sum + (a || 0), 0);
    const averageAge = patientsData.length > 0 ? Math.round(totalAge / patientsData.length) : 0;

    setStats({
      total: patientsData.length,
      active: patientsData.filter((p) => p.status === "active" || !p.status).length,
      newThisMonth,
      averageAge,
    });
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    api
      .get("/patients")
      .then((response) => {
        const patientsData = response.data || [];
        setPatients(patientsData);
        calculateStats(patientsData);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des patients:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const deletePatient = async (_id) => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) return;

    try {
      await api.delete(`/patients/${_id}`);

      const updatedPatients = patients.filter((p) => p._id !== _id);
      setPatients(updatedPatients);
      calculateStats(updatedPatients);

      const newSelected = new Set(selectedRows);
      newSelected.delete(_id);
      setSelectedRows(newSelected);
    } catch (error) {
      console.error("Erreur lors de la suppression du patient:", error);
      alert(error?.response?.data?.message || "Erreur suppression patient.");
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    }
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const updatePatientInList = (updatedPatient) => {
    const updatedPatients = patients.map((p) => (p._id === updatedPatient._id ? updatedPatient : p));
    setPatients(updatedPatients);
    calculateStats(updatedPatients);
  };

  const filteredPatients = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return patients.filter((patient) => {
      return (
        patient.name?.toLowerCase().includes(s) ||
        patient.email?.toLowerCase().includes(s) ||
        String(patient.dossier || "").includes(searchTerm)
      );
    });
  }, [patients, searchTerm]);

  const toggleRowSelection = (patientId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(patientId)) newSelected.delete(patientId);
    else newSelected.add(patientId);
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredPatients.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredPatients.map((p) => p._id)));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <div className="neo-layout neo-layout-tight">
      {/* ===== SIDEBAR ===== */}
      <aside className="neo-sidebar">
        <div className="neo-brand" onClick={goToHome}>
          <img src={neohealthLogo} alt="NeoHealth logo" className="neo-brand-img" />
          <div className="neo-brand-txt">
            <div className="neo-brand-name">NeoHealth</div>
            <div className="neo-brand-sub">Medical Suite</div>
          </div>
        </div>

        <div className="neo-nav-section">GÉNÉRAL</div>

        {/* ✅ Zone scrollable */}
        <nav className="neo-nav neo-nav-scroll">
          <div className={`neo-nav-item ${isActive("/secretaire/home") ? "active" : ""}`} onClick={goToHome}>
            <LuLayoutDashboard className="neo-nav-ico" />
            <span>Tableau de Bord</span>
          </div>

          <div className={`neo-nav-item ${isActive("/secretaire/patients") ? "active" : ""}`} onClick={goToPatients}>
            <LuUsers className="neo-nav-ico" />
            <span>Gestion Patients</span>
          </div>

          <div className={`neo-nav-item ${isActive("/secretaire/rendezvous") ? "active" : ""}`} onClick={goToAgenda}>
            <LuCalendarCheck className="neo-nav-ico" />
            <span>Rendez-vous</span>
          </div>

          <div className="neo-nav-section">ADMINISTRATION</div>

          <div className={`neo-nav-item ${isActive("/secretaire/salles") ? "active" : ""}`} onClick={goToSalles}>
            <LuBuilding2 className="neo-nav-ico" />
            <span>Salles & Blocs</span>
          </div>
          <div
  className={`neo-nav-item ${isActive("/secretaire/salles/historique") ? "active" : ""}`}
  onClick={() => navigate("/secretaire/salles/historique")}
>
  <LuHistory className="neo-nav-ico" />
  <span>Historique réservations</span>
</div>
        </nav>


          <div className="neo-nav-spacer" />

        <div className="neo-sidebar-bottom">
          <div className="neo-nav-item logout" onClick={logout}>
            <LuLogOut className="neo-nav-ico" />
            <span>Déconnexion</span>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="neo-main neo-main-tight">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="min-h-screen">
            <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-8 mb-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                      <FiUsers className="text-2xl text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">Patients</h1>
                      <p className="text-blue-100 mt-2 text-lg">
                        Centre Hospitalier NeoHealth • Gestion complète des patients
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-3 bg-white text-blue-900 hover:bg-blue-50 px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-white"
                >
                  <FiPlus className="text-xl" />
                  <span>Nouveau Patient</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/80 text-sm">Total Patients</div>
                      <div className="text-3xl font-bold text-white mt-2">{stats.total}</div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FiUsers className="text-2xl text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/80 text-sm">Patients Actifs</div>
                      <div className="text-3xl font-bold text-white mt-2">{stats.active}</div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FiActivity className="text-2xl text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/80 text-sm">Nouveaux ce mois</div>
                      <div className="text-3xl font-bold text-white mt-2">{stats.newThisMonth}</div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FiBarChart2 className="text-2xl text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/80 text-sm">Moyenne d'âge</div>
                      <div className="text-3xl font-bold text-white mt-2">{stats.averageAge} ans</div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FiUser className="text-2xl text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-2xl">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                      type="text"
                      placeholder="Rechercher un patient par nom, email ou numéro de dossier..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    />
                  </div>

                  <div className="flex items-center space-x-4 ml-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 font-medium">Vue:</span>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600"}`}
                      >
                        ▦
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600"}`}
                      >
                        ☰
                      </button>
                    </div>

                    <button className="flex items-center space-x-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200">
                      <FiFilter className="text-lg" />
                      <span>Filtres</span>
                    </button>

                    <button className="flex items-center space-x-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200">
                      <FiDownload className="text-lg" />
                      <span>Exporter</span>
                    </button>

                    <button
                      className="flex items-center space-x-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200"
                      onClick={() => window.location.reload()}
                    >
                      <FiRefreshCw className="text-lg" />
                      <span>Actualiser</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Patients Grid/List */}
              {loading ? (
                <div className="p-16 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-gray-800">Chargement des patients...</h3>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="text-7xl mb-6">👥</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {patients.length === 0 ? "Aucun patient enregistré" : "Aucun résultat"}
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    {patients.length === 0
                      ? "Commencez par ajouter le premier patient de l'établissement."
                      : "Aucun patient ne correspond à votre recherche."}
                  </p>

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl border-2 border-blue-900"
                  >
                    <FiPlus className="text-xl" />
                    <span>Ajouter un Patient</span>
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient._id}
                      className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-900 font-bold border-2 border-white shadow-lg">
                              {patient.name?.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{patient.name}</h3>
                            <p className="text-sm text-gray-500">Dossier #{patient.dossier || "N/A"}</p>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <FiMoreVertical />
                        </button>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-600">
                          <FiPhone className="mr-3 text-blue-900" />
                          <span className="text-sm">{patient.phone || "Non renseigné"}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FiMail className="mr-3 text-blue-900" />
                          <span className="text-sm truncate">{patient.email || "Non renseigné"}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FiCalendar className="mr-3 text-blue-900" />
                          <span className="text-sm">
                            {patient.birthDate ? `${calcAgeFromBirthDate(patient.birthDate)} ans` : "Âge non renseigné"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(patient.status)}`}>
                          {patient.status === "active" || !patient.status ? "Actif" : patient.status}
                        </span>

                        {/* ✅ Actions: فقط تعديل + حذف */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditPatient(patient)}
                            className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <FiEdit className="text-lg" />
                          </button>
                          <button
                            onClick={() => deletePatient(patient._id)}
                            className="p-2 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <FiTrash2 className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-800 to-blue-900 border-b-4 border-blue-700">
                          <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={selectedRows.size === filteredPatients.length && filteredPatients.length > 0}
                              onChange={toggleSelectAll}
                              className="w-5 h-5 rounded border-2 border-white bg-transparent"
                            />
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Patient</th>
                          <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Dossier</th>
                          <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Contact</th>
                          <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Âge</th>
                          <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Statut</th>
                          <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {filteredPatients.map((patient) => (
                          <tr
                            key={patient._id}
                            className={`hover:bg-blue-50/50 transition-colors duration-200 group ${
                              selectedRows.has(patient._id) ? "bg-blue-50" : ""
                            }`}
                          >
                            <td className="px-8 py-6">
                              <input
                                type="checkbox"
                                checked={selectedRows.has(patient._id)}
                                onChange={() => toggleRowSelection(patient._id)}
                                className="w-5 h-5 rounded border-2 border-gray-300 checked:border-blue-900 checked:bg-blue-900"
                              />
                            </td>

                            <td className="px-8 py-6">
                              <div className="font-bold text-gray-900 text-lg">{patient.name}</div>
                              <div className="text-sm text-gray-500 font-medium">ID: {patient._id?.substring(0, 8)}</div>
                            </td>

                            <td className="px-8 py-6">
                              <span className="bg-blue-100 text-blue-900 px-4 py-2 rounded-full font-bold text-sm">
                                #{patient.dossier || "N/A"}
                              </span>
                            </td>

                            <td className="px-8 py-6">
                              <div className="space-y-2">
                                <div className="font-semibold text-gray-700">{patient.email || "Non renseigné"}</div>
                                <div className="text-gray-600">{patient.phone || "Non renseigné"}</div>
                              </div>
                            </td>

                            <td className="px-8 py-6">
                              <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-bold text-sm">
                                {patient.birthDate ? `${calcAgeFromBirthDate(patient.birthDate)} ans` : "N/A"}
                              </span>
                            </td>

                            <td className="px-8 py-6">
                              <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full border-2 ${getStatusColor(patient.status)}`}>
                                {patient.status === "active" || !patient.status ? "Actif" : patient.status}
                              </span>
                            </td>

                            <td className="px-8 py-6">
                              {/* ✅ Actions: فقط تعديل + حذف */}
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => handleEditPatient(patient)}
                                  className="p-3 text-green-700 hover:text-white hover:bg-green-700 rounded-xl transition-all duration-300 border-2 border-green-700 hover:border-green-600"
                                  title="Modifier"
                                >
                                  <FiEdit className="text-xl" />
                                </button>

                                <button
                                  onClick={() => deletePatient(patient._id)}
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

                  {filteredPatients.length > 0 && (
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                      <div className="text-gray-700 font-semibold">
                        {selectedRows.size > 0 ? (
                          <span>{selectedRows.size} patient(s) sélectionné(s)</span>
                        ) : (
                          <span>{filteredPatients.length} patient(s) au total</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modals */}
              {showModal && (
                <EditPatientModal
                  patient={selectedPatient}
                  onClose={() => setShowModal(false)}
                  onUpdatePatient={updatePatientInList}
                />
              )}

              {showAddModal && (
                <AddPatientModal
                  onClose={() => setShowAddModal(false)}
                  onPatientAdded={(newPatient) => {
                    const next = [newPatient, ...patients];
                    setPatients(next);
                    calculateStats(next);
                    setShowAddModal(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientsList;

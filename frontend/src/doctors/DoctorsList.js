import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiUserPlus,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiDownload,
  FiUsers,
  FiActivity,
  FiAlertCircle,
} from "react-icons/fi";
import { getDoctors, deleteDoctor } from "./doctorService";
import Sidebar from "../Sidebar";

const SPECIALTIES = [
  { value: "", label: "Toutes spécialités" },
  { value: "medecin_generaliste", label: "Médecin Généraliste" },
  { value: "cardiologue", label: "Cardiologue" },
  { value: "pediatre", label: "Pédiatre" },
  { value: "chirurgien", label: "Chirurgien" },
  { value: "radiologue", label: "Radiologue" },
];

const STATUS = [
  { value: "", label: "Tous statuts" },
  { value: "Disponible", label: "Disponible" },
  { value: "Occupé", label: "Occupé" },
  { value: "Absent", label: "Absent" },
  { value: "En congé", label: "En congé" },
];

const specialtyLabel = (value) => {
  const found = SPECIALTIES.find((s) => s.value === value);
  return found ? found.label : value || "Non spécifié";
};

export default function DoctorsList() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const displayPhoto = (photo) => {
    if (!photo) return null;
    if (photo.startsWith("http")) return photo;
    return `${API_BASE}${photo}`;
  };

  const fetchDoctors = async (params = {}) => {
    try {
      setError(null);
      setLoading(true);
      const data = await getDoctors(params);
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur fetch doctors:", err);
      setDoctors([]);
      setError("Impossible de charger la liste des médecins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrage local (rapide)
  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return (doctors || []).filter((d) => {
      const matchSearch =
        !q ||
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.email && d.email.toLowerCase().includes(q)) ||
        (d.phone && String(d.phone).toLowerCase().includes(q));

      const matchSpec = !specialtyFilter || d.specialty === specialtyFilter;

      const matchStatus =
        !statusFilter ||
        (d.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchSpec && matchStatus;
    });
  }, [doctors, search, specialtyFilter, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression du médecin ?")) return;
    try {
      setError(null);
      await deleteDoctor(id);
      setDoctors((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Erreur suppression :", err);
      setError("Impossible de supprimer le médecin.");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSpecialtyFilter("");
    setStatusFilter("");
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "disponible":
        return "bg-green-100 text-green-800 border-green-300";
      case "occupé":
      case "occupe":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "absent":
        return "bg-red-100 text-red-800 border-red-300";
      case "en congé":
      case "en conge":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Export CSV (sur filtered)
  const exportCSV = () => {
    const rows = filtered.map((d) => ({
      name: d.name || "",
      specialty: specialtyLabel(d.specialty),
      email: d.email || "",
      phone: d.phone || "",
      status: d.status || "",
    }));

    const headers = ["Nom", "Spécialité", "Email", "Téléphone", "Statut"];

    const csv = [
      headers.join(";"),
      ...rows.map((r) =>
        [r.name, r.specialty, r.email, r.phone, r.status]
          .map((v) => `"${String(v).replaceAll('"', '""')}"`)
          .join(";")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medecins_neohealth.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const totalDoctors = doctors.length;
  const totalAvailable = doctors.filter(
    (d) => (d.status || "").toLowerCase() === "disponible"
  ).length;
  const totalBusy = doctors.filter((d) =>
    (d.status || "").toLowerCase().includes("occup")
  ).length;
  const totalAbsent = doctors.filter((d) =>
    (d.status || "").toLowerCase().includes("absent")
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="docteurs"
      />

      <div
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        {/* HEADER NeoHealth (même style Personnel) */}
        <header className="bg-gradient-to-r from-blue-800 via-royalblue-900 to-blue-900 text-white p-8 -mt-8 -mx-8 mb-8 shadow-2xl border-b-4 border-gold-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <FiUsers className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Gestion des Médecins
                </h1>
                <p className="text-blue-100 mt-2 text-lg">
                  Spécialités, disponibilités, contacts et suivi
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right mr-6">
                <div className="text-blue-200 text-sm">Hôpital NeoHealth</div>
                <div className="text-white font-semibold">
                  Direction Médicale
                </div>
              </div>
              <button
                onClick={() => navigate("/docteurs/ajouter")}
                className="flex items-center space-x-3 bg-white text-blue-900 hover:bg-blue-50 px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-white"
              >
                <FiUserPlus className="text-xl" />
                <span>Nouveau Médecin</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 pb-12">
          {/* Barre recherche + filtres + actions */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 mb-8">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-2xl">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                  placeholder="Rechercher par nom, email, téléphone..."
                />
              </div>

              <div className="flex items-center space-x-4 ml-6">
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200"
                  title="Filtrer par spécialité"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200"
                  title="Filtrer par statut"
                >
                  {STATUS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={resetFilters}
                  className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200"
                >
                  Réinitialiser
                </button>

                <button
                  onClick={exportCSV}
                  className="flex items-center space-x-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200"
                >
                  <FiDownload className="text-lg" />
                  <span>Exporter</span>
                </button>

                <button
                  onClick={() => fetchDoctors()}
                  className="flex items-center space-x-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200"
                >
                  <FiRefreshCw className="text-lg" />
                  <span>Actualiser</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Total Médecins</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {totalDoctors}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiUsers className="text-2xl text-blue-900" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Disponibles</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {totalAvailable}
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiActivity className="text-2xl text-green-900" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Occupés</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {totalBusy}
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FiBriefcase className="text-2xl text-yellow-900" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Absents</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {totalAbsent}
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <FiAlertCircle className="text-2xl text-red-900" />
              </div>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-medium flex items-center">
              <FiAlertCircle className="mr-3 text-red-500" />
              {error}
            </div>
          )}

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-6"></div>
                <h3 className="text-xl font-bold text-gray-800">
                  Chargement des médecins...
                </h3>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-7xl mb-6">🩺</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {doctors.length === 0 ? "Aucun médecin enregistré" : "Aucun résultat"}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {doctors.length === 0
                    ? "Commencez par ajouter le premier médecin."
                    : "Aucun médecin ne correspond à votre recherche / filtres."}
                </p>
                <button
                  onClick={() => navigate("/docteurs/ajouter")}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl border-2 border-blue-900"
                >
                  <FiUserPlus className="text-xl" />
                  <span>Ajouter un Médecin</span>
                </button>
              </div>
            ) : (
              <>
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
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {filtered.map((d) => (
                        <tr
                          key={d._id}
                          className="hover:bg-blue-50/50 transition-colors duration-200 group"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                {d.photo ? (
                                  <img
                                    src={displayPhoto(d.photo)}
                                    alt={d.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-900 font-bold border-2 border-white shadow-lg">
                                    {(d.name || "D").charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-lg">
                                  {d.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {d._id?.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-8 py-6">
                            <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-medium text-sm">
                              {specialtyLabel(d.specialty)}
                            </span>
                          </td>

                          <td className="px-8 py-6">
                            <div className="space-y-2">
                              <div className="flex items-center text-gray-700 font-medium">
                                <FiPhone className="mr-3 text-blue-900" />
                                {d.phone || "-"}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <FiMail className="mr-3 text-blue-900" />
                                {d.email || "-"}
                              </div>
                            </div>
                          </td>

                          <td className="px-8 py-6">
                            <span
                              className={`inline-flex px-4 py-2 text-sm font-bold rounded-full border-2 ${getStatusColor(
                                d.status
                              )}`}
                            >
                              {d.status || "—"}
                            </span>
                          </td>

                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => navigate(`/docteurs/${d._id}`)}
                                className="px-4 py-2 text-blue-900 hover:text-white hover:bg-blue-900 rounded-xl transition-all duration-300 border-2 border-blue-900 hover:border-blue-800 font-semibold"
                              >
                                Voir
                              </button>

                              <button
                                onClick={() => navigate(`/docteurs/${d._id}/edit`)}
                                className="p-3 text-green-700 hover:text-white hover:bg-green-700 rounded-xl transition-all duration-300 border-2 border-green-700 hover:border-green-600"
                                title="Modifier"
                              >
                                <FiEdit className="text-xl" />
                              </button>

                              <button
                                onClick={() => handleDelete(d._id)}
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

                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-700 font-semibold">
                      {filtered.length} médecin(s) affiché(s)
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Page 1 sur 1</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

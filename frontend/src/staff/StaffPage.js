// src/staff/StaffPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiSearch,
  FiUserPlus,
  FiUser,
  FiPhone,
  FiMail,
  FiBriefcase,
  FiShield,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiUsers,
  FiActivity,
  FiTrendingUp,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import Sidebar from "../Sidebar";

/* ============================
   MODAL AJOUT PERSONNEL
   ============================ */
function AddStaffModal({ onClose, onAddStaff }) {
  const [formData, setFormData] = useState({
    name: "",
    role: "Infirmier(e)",
    specialty: "",
    phone: "",
    email: "",
    status: "Actif",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddStaff(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden border-2 border-gray-100">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <FiUserPlus className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Ajouter un Membre</h2>
                <p className="text-blue-100">
                  Nouveau membre du personnel médical / paramédical
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <FiX className="text-2xl text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nom et prénom"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                />
              </div>

              {/* Rôle */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Fonction
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                >
                  <option>Infirmier(e)</option>
                  <option>Aide-soignant(e)</option>
                  <option>Technicien(ne) de bloc</option>
                  <option>Secrétaire médicale</option>
                  <option>Responsable logistique</option>
                  <option>Agent d’accueil</option>
                </select>
              </div>

              {/* Spécialité */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Service / Spécialité
                </label>
                <input
                  type="text"
                  name="specialty"
                  placeholder="Bloc opératoire, Urgences..."
                  value={formData.specialty}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+212..."
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2 space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Email professionnel
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="prenom.nom@neohealth.ma"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                />
              </div>

              {/* Statut */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                >
                  <option>Actif</option>
                  <option>Inactif</option>
                  <option>En congé</option>
                  <option>En formation</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ============================
   MODAL EDIT PERSONNEL
   ============================ */
function EditStaffModal({ onClose, onEditStaff, staff }) {
  const [formData, setFormData] = useState({
    name: "",
    role: "Infirmier(e)",
    specialty: "",
    phone: "",
    email: "",
    status: "Actif",
    _id: "",
  });

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || "",
        role: staff.role || "Infirmier(e)",
        specialty: staff.specialty || "",
        phone: staff.phone || "",
        email: staff.email || "",
        status: staff.status || "Actif",
        _id: staff._id || "",
      });
    }
  }, [staff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onEditStaff(formData);
    onClose();
  };

  if (!staff) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden border-2 border-gray-100">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <FiEdit className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Modifier le Membre</h2>
                <p className="text-blue-100">Mise à jour du profil</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg:white/20 rounded-xl transition-colors"
            >
              <FiX className="text-2xl text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nom et prénom"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                />
              </div>

              {/* Rôle */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Fonction
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                >
                  <option>Infirmier(e)</option>
                  <option>Aide-soignant(e)</option>
                  <option>Technicien(ne) de bloc</option>
                  <option>Secrétaire médicale</option>
                  <option>Responsable logistique</option>
                  <option>Agent d’accueil</option>
                </select>
              </div>

              {/* Spécialité */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Service / Spécialité
                </label>
                <input
                  type="text"
                  name="specialty"
                  placeholder="Bloc opératoire, Urgences..."
                  value={formData.specialty}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+212..."
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2 space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Email professionnel
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="prenom.nom@neohealth.ma"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                />
              </div>

              {/* Statut */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                >
                  <option>Actif</option>
                  <option>Inactif</option>
                  <option>En congé</option>
                  <option>En formation</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Mettre à jour
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ============================
   PAGE PRINCIPALE PERSONNEL
   ============================ */
const StaffPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger personnel
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get("http://localhost:5000/api/staff", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStaff(res.data || []);
      } catch (err) {
        console.error("Erreur chargement personnel:", err);
        setError("Impossible de charger le personnel médical.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredStaff = staff.filter((member) => {
    const s = search.toLowerCase();
    return (
      member.name?.toLowerCase().includes(s) ||
      member.role?.toLowerCase().includes(s) ||
      member.specialty?.toLowerCase().includes(s) ||
      member.email?.toLowerCase().includes(s)
    );
  });

  const addStaff = async (data) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post("http://localhost:5000/api/staff", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff((prev) => [...prev, res.data]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Erreur ajout personnel:", err);
      setError("Erreur lors de l'ajout du membre du personnel.");
    }
  };

  const editStaff = async (updated) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.put(
        `http://localhost:5000/api/staff/${updated._id}`,
        updated,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStaff((prev) =>
        prev.map((m) => (m._id === updated._id ? res.data : m))
      );
      setIsEditModalOpen(false);
      setSelectedStaff(null);
    } catch (err) {
      console.error("Erreur modification personnel:", err);
      setError("Erreur lors de la modification du membre du personnel.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression de ce membre du personnel ?"))
      return;

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:5000/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Erreur suppression personnel:", err);
      setError("Erreur lors de la suppression.");
    }
  };

  // Stats rapides
  const totalStaff = staff.length;
  const totalNurses = staff.filter((m) =>
    (m.role || "").toLowerCase().includes("infirmier")
  ).length;
  const totalAssistants = staff.filter((m) =>
    (m.role || "").toLowerCase().includes("aide")
  ).length;
  const totalActive = staff.filter(
    (m) => (m.status || "").toLowerCase() === "actif"
  ).length;

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "actif":
        return "bg-green-100 text-green-800 border-green-300";
      case "inactif":
        return "bg-red-100 text-red-800 border-red-300";
      case "en congé":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "en formation":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="personnel"
      />

      <div
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        {/* HEADER (même style que DoctorsList) */}
        <header className="bg-gradient-to-r from-blue-800 via-royalblue-900 to-blue-900 text-white p-8 -mt-8 -mx-8 mb-8 shadow-2xl border-b-4 border-gold-500">
          <div className="flex items-center justify-between">
            {/* Titre */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <FiUsers className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Gestion du Personnel Médical & Paramédical
                  </h1>
                  <p className="text-blue-100 mt-2 text-lg">
                    Organisation du corps infirmier, aides-soignants et
                    personnel de support
                  </p>
                </div>
              </div>
            </div>

            {/* Infos + bouton */}
            <div className="flex items-center space-x-4">
              <div className="text-right mr-6">
                <div className="text-blue-200 text-sm">Hôpital NeoHealth</div>
                <div className="text-white font-semibold">
                  Direction des Ressources Médicales
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-3 bg-white text-blue-900 hover:bg-blue-50 px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-white"
              >
                <FiUserPlus className="text-xl" />
                <span>Nouveau Membre</span>
              </button>
            </div>
          </div>
        </header>

        {/* CONTENU PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-4 pb-12">
          {/* Barre de recherche + actions */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 mb-8">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-2xl">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                  placeholder="Rechercher par nom, rôle, service, email..."
                />
              </div>
              <div className="flex items-center space-x-4 ml-6">
                <button className="flex items-center space-x-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200">
                  <FiFilter className="text-lg" />
                  <span>Filtrer</span>
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

          {/* Petites cartes stats (comme mini-dashboard) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Total Personnel</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {totalStaff}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiUsers className="text-2xl text-blue-900" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Infirmier(e)s</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {totalNurses}
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiShield className="text-2xl text-green-900" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Aides / Support</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {totalAssistants}
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiBriefcase className="text-2xl text-purple-900" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Actifs</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {totalActive}
                </div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <FiActivity className="text-2xl text-emerald-900" />
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

          {/* TABLEAU PERSONNEL */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-6"></div>
                <h3 className="text-xl font-bold text-gray-800">
                  Chargement du personnel...
                </h3>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-7xl mb-6">🏥</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {staff.length === 0
                    ? "Aucun membre enregistré"
                    : "Aucun résultat"}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {staff.length === 0
                    ? "Commencez par ajouter le premier membre du personnel."
                    : "Aucun membre ne correspond à votre recherche."}
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl border-2 border-blue-900"
                >
                  <FiUserPlus className="text-xl" />
                  <span>Ajouter un Membre</span>
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-800 to-blue-900 border-b-4 border-blue-700">
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Membre
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Fonction
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Service / Spécialité
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
                      {filteredStaff.map((member) => (
                        <tr
                          key={member._id}
                          className="hover:bg-blue-50/50 transition-colors duration-200 group"
                        >
                          {/* Membre */}
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                {member.photo ? (
                                  <img
                                    src={`http://localhost:5000${member.photo}`}
                                    alt={member.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-900 font-bold border-2 border-white shadow-lg">
                                    {member.name?.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-lg">
                                  {member.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {member._id?.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Rôle */}
                          <td className="px-8 py-6">
                            <div className="flex items-center text-gray-900 font-medium">
                              <FiBriefcase className="mr-3 text-blue-900" />
                              {member.role}
                            </div>
                          </td>

                          {/* Service */}
                          <td className="px-8 py-6">
                            <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-medium text-sm">
                              {member.specialty || "Non spécifié"}
                            </span>
                          </td>

                          {/* Contact */}
                          <td className="px-8 py-6">
                            <div className="space-y-2">
                              <div className="flex items-center text-gray-700 font-medium">
                                <FiPhone className="mr-3 text-blue-900" />
                                {member.phone || "-"}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <FiMail className="mr-3 text-blue-900" />
                                {member.email || "-"}
                              </div>
                            </div>
                          </td>

                          {/* Statut */}
                          <td className="px-8 py-6">
                            <span
                              className={`inline-flex px-4 py-2 text-sm font-bold rounded-full border-2 ${getStatusColor(
                                member.status
                              )}`}
                            >
                              {member.status || "Actif"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => {
                                  alert(
                                    `Détails de ${member.name}\n\nFonction: ${
                                      member.role
                                    }\nService: ${
                                      member.specialty || "Non renseigné"
                                    }\nStatut: ${
                                      member.status || "Actif"
                                    }\nTéléphone: ${
                                      member.phone || "—"
                                    }\nEmail: ${member.email || "—"}`
                                  );
                                }}
                                className="p-3 text-blue-900 hover:text-white hover:bg-blue-900 rounded-xl transition-all duration-300 border-2 border-blue-900 hover:border-blue-800"
                                title="Voir détails"
                              >
                                👁
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedStaff(member);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-3 text-green-700 hover:text-white hover:bg-green-700 rounded-xl transition-all duration-300 border-2 border-green-700 hover:border-green-600"
                                title="Modifier"
                              >
                                <FiEdit className="text-xl" />
                              </button>
                              <button
                                onClick={() => handleDelete(member._id)}
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

                {/* Footer tableau */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-700 font-semibold">
                      {filteredStaff.length} membre(s) affiché(s)
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

        {/* MODALS */}
        {isAddModalOpen && (
          <AddStaffModal
            onClose={() => setIsAddModalOpen(false)}
            onAddStaff={addStaff}
          />
        )}

        {isEditModalOpen && (
          <EditStaffModal
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedStaff(null);
            }}
            onEditStaff={editStaff}
            staff={selectedStaff}
          />
        )}
      </div>
    </div>
  );
};

export default StaffPage;

import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { 
  FiLayers, FiPlus, FiTool, FiTrash2, FiEdit, FiSearch, 
  FiFilter, FiDownload, FiRefreshCw, FiEye, FiClock,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiHome,
  FiUsers, FiActivity, FiBarChart2
} from "react-icons/fi";

const initialRoomForm = {
  name: "",
  code: "",
  type: "",
  floor: "",
  capacity: 1,
  status: "disponible",
};

const initialEquipmentForm = {
  name: "",
  category: "",
  quantity: 1,
  status: "fonctionnel",
  lastMaintenance: "",
};

function SallesBlocs() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [roomForm, setRoomForm] = useState(initialRoomForm);
  const [equipmentForm, setEquipmentForm] = useState(initialEquipmentForm);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [search, setSearch] = useState("");

  const API_URL = "http://localhost:5000/api/salles";

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      const res = await axios.get(API_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setRooms(res.data || []);
    } catch (err) {
      console.error("Erreur fetchRooms:", err);
      setError("Erreur lors du chargement des salles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddRoomModal = () => {
    setIsEditMode(false);
    setRoomForm(initialRoomForm);
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (room) => {
    setIsEditMode(true);
    setRoomForm({
      name: room.name || "",
      code: room.code || "",
      type: room.type || "",
      floor: room.floor || "",
      capacity: room.capacity || 1,
      status: room.status || "disponible",
      _id: room._id,
    });
    setIsRoomModalOpen(true);
  };

  const handleRoomFormChange = (e) => {
    const { name, value } = e.target;
    setRoomForm((prev) => ({
      ...prev,
      [name]: name === "capacity" ? Number(value) : value,
    }));
  };

  const handleEquipmentFormChange = (e) => {
    const { name, value } = e.target;
    setEquipmentForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleSubmitRoom = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      let res;
      if (isEditMode && roomForm._id) {
        res = await axios.put(`${API_URL}/${roomForm._id}`, roomForm, config);
        setRooms((prev) =>
          prev.map((r) => (r._id === roomForm._id ? res.data : r))
        );
      } else {
        res = await axios.post(API_URL, roomForm, config);
        setRooms((prev) => [...prev, res.data]);
      }

      setIsRoomModalOpen(false);
      setRoomForm(initialRoomForm);
    } catch (err) {
      console.error("Erreur handleSubmitRoom:", err);
      setError("Erreur lors de l'enregistrement de la salle / bloc");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Confirmer la suppression de cette salle ?")) return;

    try {
      setError(null);
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/${roomId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
      if (selectedRoom && selectedRoom._id === roomId) {
        setSelectedRoom(null);
      }
    } catch (err) {
      console.error("Erreur handleDeleteRoom:", err);
      setError("Erreur lors de la suppression de la salle");
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setEquipmentForm(initialEquipmentForm);
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;

    try {
      setError(null);
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        `${API_URL}/${selectedRoom._id}/equipements`,
        equipmentForm,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const updatedRoom = res.data;

      setRooms((prev) =>
        prev.map((r) => (r._id === updatedRoom._id ? updatedRoom : r))
      );
      setSelectedRoom(updatedRoom);
      setEquipmentForm(initialEquipmentForm);
    } catch (err) {
      console.error("Erreur handleAddEquipment:", err);
      setError("Erreur lors de l'ajout de l'équipement");
    }
  };

  const handleDeleteEquipment = async (roomId, equipementId) => {
    if (!window.confirm("Supprimer cet équipement ?")) return;

    try {
      setError(null);
      const token = localStorage.getItem("authToken");
      const res = await axios.delete(
        `${API_URL}/${roomId}/equipements/${equipementId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const updatedRoom = res.data;

      setRooms((prev) =>
        prev.map((r) => (r._id === updatedRoom._id ? updatedRoom : r))
      );
      if (selectedRoom && selectedRoom._id === updatedRoom._id) {
        setSelectedRoom(updatedRoom);
      }
    } catch (err) {
      console.error("Erreur handleDeleteEquipment:", err);
      setError("Erreur lors de la suppression de l'équipement");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const term = search.toLowerCase();
    return (
      room.name?.toLowerCase().includes(term) ||
      room.code?.toLowerCase().includes(term) ||
      room.type?.toLowerCase().includes(term) ||
      room.floor?.toLowerCase().includes(term)
    );
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "disponible":
        return "bg-green-100 text-green-800 border-green-300";
      case "occupée":
        return "bg-red-100 text-red-800 border-red-300";
      case "en_maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "hors_service":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getEquipmentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "fonctionnel":
        return "bg-green-100 text-green-800";
      case "en_maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "hors_service":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status?.toLowerCase() === "disponible").length,
    inUse: rooms.filter(r => r.status?.toLowerCase() === "occupée").length,
    maintenance: rooms.filter(r => r.status?.toLowerCase() === "en_maintenance").length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="salles"
      />

      <div className={`transition-all duration-300 min-h-screen ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-800 via-royalblue-900 to-blue-900 text-white p-8 -mt-8 -mx-8 mb-8 shadow-2xl border-b-4 border-gold-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <FiHome className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Salles & Blocs Opératoires</h1>
                  <p className="text-blue-100 mt-2 text-lg">
                    Centre Hospitalier NeoHealth • Gestion des infrastructures médicales
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={openAddRoomModal}
              className="flex items-center space-x-3 bg-white text-blue-900 hover:bg-blue-50 px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-white"
            >
              <FiPlus className="text-xl" />
              <span>Nouvelle Salle</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Total Salles</div>
                  <div className="text-3xl font-bold text-white mt-2">{stats.total}</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiHome className="text-2xl text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Disponibles</div>
                  <div className="text-3xl font-bold text-white mt-2">{stats.available}</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiCheckCircle className="text-2xl text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Occupées</div>
                  <div className="text-3xl font-bold text-white mt-2">{stats.inUse}</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiUsers className="text-2xl text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">En Maintenance</div>
                  <div className="text-3xl font-bold text-white mt-2">{stats.maintenance}</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiTool className="text-2xl text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4">
          {/* Search and Controls */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-2xl">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                  placeholder="Rechercher une salle, un bloc, un service..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                  onClick={fetchRooms}
                >
                  <FiRefreshCw className="text-lg" />
                  <span>Actualiser</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-medium flex items-center">
              <FiAlertCircle className="mr-3 text-red-500" />
              {error}
            </div>
          )}

          {/* Rooms Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            {loading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-6"></div>
                <h3 className="text-xl font-bold text-gray-800">Chargement des salles...</h3>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-7xl mb-6">🏥</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {rooms.length === 0 ? "Aucune salle enregistrée" : "Aucun résultat"}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {rooms.length === 0 
                    ? "Commencez par ajouter votre première salle ou bloc opératoire." 
                    : "Aucune salle ne correspond à votre recherche."}
                </p>
                <button
                  onClick={openAddRoomModal}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl border-2 border-blue-900"
                >
                  <FiPlus className="text-xl" />
                  <span>Ajouter une Salle</span>
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-800 to-blue-900 border-b-4 border-blue-700">
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Étage / Secteur
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Capacité
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Équipements
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredRooms.map((room) => (
                        <tr key={room._id} className="hover:bg-blue-50/50 transition-colors duration-200 group">
                          <td className="px-8 py-6">
                            <span className="bg-blue-100 text-blue-900 px-4 py-2 rounded-full font-bold text-sm">
                              {room.code}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-bold text-gray-900 text-lg">{room.name}</div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-medium text-sm">
                              {room.type}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center text-gray-700">
                              <FiLayers className="mr-3 text-blue-900" />
                              {room.floor}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-bold">
                              {room.capacity} pers.
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full border-2 ${getStatusColor(room.status)}`}>
                              {room.status || "Disponible"}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <button
                              onClick={() => handleSelectRoom(room)}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-medium transition-colors border-2 border-blue-200"
                              title="Voir les équipements"
                            >
                              <FiTool className="text-lg" />
                              <span>{room.equipments?.length || 0}</span>
                            </button>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleSelectRoom(room)}
                                className="p-3 text-blue-900 hover:text-white hover:bg-blue-900 rounded-xl transition-all duration-300 border-2 border-blue-900 hover:border-blue-800"
                                title="Voir équipements"
                              >
                                <FiEye className="text-xl" />
                              </button>
                              <button
                                onClick={() => openEditRoomModal(room)}
                                className="p-3 text-green-700 hover:text-white hover:bg-green-700 rounded-xl transition-all duration-300 border-2 border-green-700 hover:border-green-600"
                                title="Modifier"
                              >
                                <FiEdit className="text-xl" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room._id)}
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

                {/* Table Footer */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-700 font-semibold">
                      {filteredRooms.length} salle(s) trouvée(s)
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                        ← Précédent
                      </button>
                      <span className="text-gray-700">Page 1 sur 1</span>
                      <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                        Suivant →
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Equipment Panel */}
          {selectedRoom && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FiTool className="text-2xl text-blue-900" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Équipements – {selectedRoom.name}
                    </h2>
                    <p className="text-gray-600">
                      {selectedRoom.code} • {selectedRoom.type} • {selectedRoom.floor}
                    </p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-900 px-4 py-2 rounded-full font-bold text-sm">
                  {selectedRoom.equipments?.length || 0} équipement(s)
                </span>
              </div>

              {/* Add Equipment Form */}
              <form onSubmit={handleAddEquipment} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'équipement
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={equipmentForm.name}
                      onChange={handleEquipmentFormChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                      placeholder="Ex: Moniteur cardiaque"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      name="category"
                      value={equipmentForm.category}
                      onChange={handleEquipmentFormChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="imagerie">Imagerie médicale</option>
                      <option value="chirurgie">Chirurgie</option>
                      <option value="réanimation">Réanimation</option>
                      <option value="anesthésie">Anesthésie</option>
                      <option value="stérilisation">Stérilisation</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min={1}
                      name="quantity"
                      value={equipmentForm.quantity}
                      onChange={handleEquipmentFormChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      name="status"
                      value={equipmentForm.status}
                      onChange={handleEquipmentFormChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    >
                      <option value="fonctionnel">Fonctionnel</option>
                      <option value="en_maintenance">En maintenance</option>
                      <option value="hors_service">Hors service</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <FiPlus className="inline mr-2" />
                      Ajouter
                    </button>
                  </div>
                </div>
              </form>

              {/* Equipment List */}
              {selectedRoom.equipments && selectedRoom.equipments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-800 to-blue-900 border-b-4 border-blue-700">
                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Équipement
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Catégorie
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Quantité
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Dernière maintenance
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedRoom.equipments.map((eq) => (
                        <tr key={eq._id} className="hover:bg-blue-50/50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{eq.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                              {eq.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full font-bold">
                              {eq.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-sm rounded-full ${getEquipmentStatusColor(eq.status)}`}>
                              {eq.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-gray-600">
                              <FiClock className="mr-2" />
                              {eq.lastMaintenance
                                ? new Date(eq.lastMaintenance).toLocaleDateString("fr-FR")
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteEquipment(selectedRoom._id, eq._id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <FiTrash2 className="text-lg" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <FiTool className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-600 mb-2">Aucun équipement</h3>
                  <p className="text-gray-500">Ajoutez les équipements biomédicaux de cette salle</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Room Modal */}
        {isRoomModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden border-2 border-gray-100">
              <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                      <FiHome className="text-2xl text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {isEditMode ? "Modifier la salle" : "Nouvelle salle / bloc"}
                      </h2>
                      <p className="text-blue-100">Gestion des infrastructures</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsRoomModalOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmitRoom} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={roomForm.name}
                        onChange={handleRoomFormChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                        placeholder="Ex: Salle de consultation 1"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Code
                      </label>
                      <input
                        type="text"
                        name="code"
                        required
                        value={roomForm.code}
                        onChange={handleRoomFormChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                        placeholder="Ex: SC-01"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <select
                        name="type"
                        value={roomForm.type}
                        onChange={handleRoomFormChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="Consultation">Salle de consultation</option>
                        <option value="Bloc opératoire">Bloc opératoire</option>
                        <option value="Hospitalisation">Unité d'hospitalisation</option>
                        <option value="Réanimation">Réanimation</option>
                        <option value="Imagerie">Imagerie médicale</option>
                        <option value="Laboratoire">Laboratoire</option>
                        <option value="Urgences">Urgences</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Étage / Secteur
                      </label>
                      <input
                        type="text"
                        name="floor"
                        value={roomForm.floor}
                        onChange={handleRoomFormChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                        placeholder="RDC, 1er étage, Bloc A..."
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Capacité
                      </label>
                      <input
                        type="number"
                        min={1}
                        name="capacity"
                        value={roomForm.capacity}
                        onChange={handleRoomFormChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Statut
                      </label>
                      <select
                        name="status"
                        value={roomForm.status}
                        onChange={handleRoomFormChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                      >
                        <option value="disponible">Disponible</option>
                        <option value="occupée">Occupée</option>
                        <option value="en_maintenance">En maintenance</option>
                        <option value="hors_service">Hors service</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsRoomModalOpen(false)}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isEditMode ? "Enregistrer" : "Créer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SallesBlocs;
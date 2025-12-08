import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiTrash2,
  FiEdit,
  FiEye,
  FiClock,
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiAlertCircle,
  FiFilter
} from "react-icons/fi";

function ListeRendezVous({ refresh }) {
  const [rdv, setRdv] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchRdv = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRdv(res.data || []);
      } catch (err) {
        console.error("Erreur chargement RDV :", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRdv();
    }
  }, [token, refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRdv((prev) => prev.filter((item) => item && item._id !== id));
    } catch (err) {
      console.error("Erreur suppression RDV :", err);
      alert("Erreur lors de la suppression du rendez-vous.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "terminé":
        return "bg-green-100 text-green-800 border-green-300";
      case "annulé":
        return "bg-red-100 text-red-800 border-red-300";
      case "en_attente":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "planifié":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "terminé":
        return "Terminé";
      case "annulé":
        return "Annulé";
      case "en_attente":
        return "En attente";
      case "planifié":
        return "Planifié";
      default:
        return "Non défini";
    }
  };

  const filteredRdv = rdv.filter((item) => {
    if (filter === "all") return true;
    if (filter === "today") {
      const today = new Date().toDateString();
      const itemDate = new Date(item.date).toDateString();
      return today === itemDate;
    }
    if (filter === "upcoming") {
      return new Date(item.date) > new Date();
    }
    return item.status === filter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }),
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      full: date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FiCalendar className="text-2xl text-blue-900" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Liste des Rendez-vous</h3>
            <p className="text-gray-600">Toutes les consultations planifiées</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
            >
              <option value="all">Tous les RDV</option>
              <option value="planifié">Planifiés</option>
              <option value="today">Aujourd'hui</option>
              <option value="upcoming">À venir</option>
              <option value="terminé">Terminés</option>
              <option value="annulé">Annulés</option>
            </select>
          </div>
          <div className="px-4 py-2 bg-blue-900 text-white rounded-lg font-bold">
            {filteredRdv.length} RDV
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-800">Chargement des rendez-vous...</h3>
        </div>
      ) : filteredRdv.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-7xl mb-6">📅</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {rdv.length === 0 ? "Aucun rendez-vous planifié" : "Aucun résultat"}
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            {rdv.length === 0 
              ? "Commencez par planifier votre premier rendez-vous." 
              : "Aucun rendez-vous ne correspond à votre filtre."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-800 to-blue-900 border-b-4 border-blue-700">
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Médecin
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Date & Heure
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Motif
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRdv.map((item) => {
                const patientName =
                  item.patient && item.patient.name
                    ? item.patient.name
                    : "Patient inconnu";

                const medecinName =
                  item.medecin && item.medecin.name
                    ? item.medecin.name
                    : "Médecin inconnu";

                const formattedDate = item.date ? formatDate(item.date) : { date: "-", time: "-", full: "-" };

                return (
                  <tr key={item._id} className="hover:bg-blue-50/50 transition-colors duration-200 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-900 font-bold border-2 border-white">
                          {patientName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{patientName}</div>
                          <div className="text-sm text-gray-500">
                            {item.patient?.dossier ? `Dossier #${item.patient.dossier}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <FiBriefcase className="text-blue-900" />
                        <span className="font-medium text-gray-900">{medecinName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-900 font-medium">
                          <FiCalendar className="mr-2 text-blue-900" />
                          {formattedDate.date}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FiClock className="mr-2 text-blue-900" />
                          {formattedDate.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full border-2 ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate" title={item.motif || "Non spécifié"}>
                        {item.motif || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => alert(`Détails du RDV:\n${formattedDate.full}\nPatient: ${patientName}\nMédecin: ${medecinName}`)}
                          className="p-2 text-blue-900 hover:text-white hover:bg-blue-900 rounded-lg transition-all duration-300 border-2 border-blue-900 hover:border-blue-800"
                          title="Voir détails"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => alert("Modification non implémentée")}
                          className="p-2 text-green-700 hover:text-white hover:bg-green-700 rounded-lg transition-all duration-300 border-2 border-green-700 hover:border-green-600"
                          title="Modifier"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-red-700 hover:text-white hover:bg-red-700 rounded-lg transition-all duration-300 border-2 border-red-700 hover:border-red-600"
                          title="Supprimer"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ListeRendezVous;
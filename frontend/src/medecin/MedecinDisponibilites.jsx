import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar"; // npm install react-calendar
import {
  FiClock,
  FiCalendar as FiCalendarIcon,
  FiPlus,
  FiTrash2,
  FiSave,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiUser,
} from "react-icons/fi";
import ToastNotification from "../ToastNotification"; 

export default function MedecinDisponibilites() {
  const [disponibilites, setDisponibilites] = useState([]);
  const [conges, setConges] = useState([]);
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [value, setValue] = useState(new Date());

  const token = localStorage.getItem("authToken");
  const medecin = JSON.parse(localStorage.getItem("medecin"));

  // 🔹 État pour le toast
  const [toast, setToast] = useState(null);

  // Fonction pour afficher un toast
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Disparaît après 3 secondes
  };

  // 🔹 Charger les données une seule fois
  useEffect(() => {
    const fetchData = async () => {
      console.log(" 🔁 Début de fetchData"); // ✅ Log

      if (!medecin || !medecin.id) {
        console.log(" ❌ Aucun médecin connecté ou ID manquant"); // ✅ Log
        setError("Médecin non connecté ou ID manquant.");
        setLoading(false);
        return;
      }

      console.log(" 📤 Chargement des disponibilités pour le médecin:", medecin.id); // ✅ Log

      try {
        // Charger les disponibilités
        const res = await axios.get(`http://localhost:5000/api/disponibilites/medecin/${medecin.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(" ✅ Réponse des disponibilités:", res); // ✅ Log

        setDisponibilites(res.data.disponibilites);
        setConges(res.data.conges);

        // Charger les RDV du médecin
        const rdvRes = await axios.get("http://localhost:5000/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(" ✅ Réponse des RDV:", rdvRes); // ✅ Log

        const mesRdv = rdvRes.data.filter((r) => r.medecin._id === medecin.id);
        setRendezVous(mesRdv);
      } catch (err) {
        console.error(" ❌ Erreur dans fetchData:", err); // ✅ Log
        setError("Erreur lors du chargement des données. Vérifiez la console pour plus d'informations.");
        showToast("Erreur lors du chargement des données.", "error");
      } finally {
        setLoading(false); // ✅ Appel systématique
        console.log(" ✅ Fin de fetchData, chargement terminé"); // ✅ Log
      }
    };

    fetchData(); // ✅ Appel initial
  }, []); // ✅ Dépendances vides = appel une seule fois

  // Gestion des nouveaux horaires
  const [nouvelHoraire, setNouvelHoraire] = useState({
    jour: "",
    debut: "",
    fin: "",
  });

  const handleInputChange = (e) => {
    setNouvelHoraire({ ...nouvelHoraire, [e.target.name]: e.target.value });
  };

  const handleAjouterHoraire = async () => {
    if (!nouvelHoraire.jour || !nouvelHoraire.debut || !nouvelHoraire.fin) {
      showToast("Veuillez remplir tous les champs.", "error");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/disponibilites/medecin/${medecin.id}`,
        nouvelHoraire,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDisponibilites([...disponibilites, res.data]);
      setNouvelHoraire({ jour: "", debut: "", fin: "" });
      showToast("Horaire ajouté avec succès.", "success");
    } catch (err) {
      showToast("Erreur lors de l'ajout de l'horaire.", "error");
      console.error(err);
    }
  };

  const handleSupprimerHoraire = async (index) => {
    const id = disponibilites[index]._id;

    try {
      await axios.delete(`http://localhost:5000/api/disponibilites/disponibilite/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDisponibilites(disponibilites.filter((_, i) => i !== index));
      showToast("Horaire supprimé.", "success");
    } catch (err) {
      showToast("Erreur lors de la suppression de l'horaire.", "error");
      console.error(err);
    }
  };

  // Gestion des congés
  const [nouveauConge, setNouveauConge] = useState({
    dateDebut: "",
    dateFin: "",
    motif: "",
  });

  const handleCongeChange = (e) => {
    setNouveauConge({ ...nouveauConge, [e.target.name]: e.target.value });
  };

  const handleAjouterConge = async () => {
    if (!nouveauConge.dateDebut || !nouveauConge.dateFin) {
      showToast("Veuillez remplir les dates de début et de fin.", "error");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/disponibilites/conge/medecin/${medecin.id}`,
        nouveauConge,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setConges([...conges, res.data]);
      setNouveauConge({ dateDebut: "", dateFin: "", motif: "" });
      showToast("Congé ajouté avec succès.", "success");
    } catch (err) {
      showToast("Erreur lors de l'ajout du congé.", "error");
      console.error(err);
    }
  };

  const handleSupprimerConge = async (index) => {
    const id = conges[index]._id;

    try {
      await axios.delete(`http://localhost:5000/api/disponibilites/conge/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setConges(conges.filter((_, i) => i !== index));
      showToast("Congé supprimé.", "success");
    } catch (err) {
      showToast("Erreur lors de la suppression du congé.", "error");
      console.error(err);
    }
  };

  const handleEnregistrer = async () => {
    showToast("Disponibilités enregistrées.", "success");
  };

  // Fonction pour styliser les dates dans le calendrier
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];

      // Congés
      const isConge = conges.some(
        (c) => date >= new Date(c.dateDebut) && date <= new Date(c.dateFin)
      );

      // RDV
      const hasRdv = rendezVous.some((r) => r.date.split("T")[0] === dateStr);

      return isConge
        ? "bg-red-200 text-red-800"
        : hasRdv
        ? "bg-blue-200 text-blue-800"
        : null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow max-w-md w-full">
          <div className="flex items-center">
            <FiX className="text-red-500 text-2xl mr-3" />
            <h2 className="text-lg font-bold text-red-700">Erreur</h2>
          </div>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiClock className="text-blue-600 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Mes Disponibilités</h1>
                <p className="text-gray-600">Gérez vos horaires, congés et rendez-vous</p>
              </div>
            </div>
            <button
              onClick={handleEnregistrer}
              className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition"
            >
              <FiSave className="mr-2" /> Enregistrer
            </button>
          </div>
        </div>

        {/* Calendrier et légende */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <FiCalendarIcon className="text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Calendrier</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar
                onChange={setValue}
                value={value}
                locale="fr-FR"
                className="w-full"
                tileClassName={tileClassName}
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Légende :</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-4 h-4 bg-blue-200 rounded mr-2"></div>
                  <span>Rendez-vous</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 bg-red-200 rounded mr-2"></div>
                  <span>Congé</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section : Horaires de travail */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <FiClock className="text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Horaires de travail</h2>
          </div>

          {/* Formulaire pour ajouter un horaire */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Jour</label>
                <select
                  name="jour"
                  value={nouvelHoraire.jour}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Sélectionner</option>
                  <option value="Lundi">Lundi</option>
                  <option value="Mardi">Mardi</option>
                  <option value="Mercredi">Mercredi</option>
                  <option value="Jeudi">Jeudi</option>
                  <option value="Vendredi">Vendredi</option>
                  <option value="Samedi">Samedi</option>
                  <option value="Dimanche">Dimanche</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Heure de début</label>
                <input
                  type="time"
                  name="debut"
                  value={nouvelHoraire.debut}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Heure de fin</label>
                <input
                  type="time"
                  name="fin"
                  value={nouvelHoraire.fin}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAjouterHoraire}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition"
                >
                  <FiPlus className="mr-2" /> Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Liste des horaires */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-600">Jour</th>
                  <th className="py-3 px-4 text-left text-gray-600">Début</th>
                  <th className="py-3 px-4 text-left text-gray-600">Fin</th>
                  <th className="py-3 px-4 text-left text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disponibilites.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      Aucun horaire enregistré.
                    </td>
                  </tr>
                ) : (
                  disponibilites.map((h, index) => (
                    <tr key={h._id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">{h.jour}</td>
                      <td className="py-3 px-4">{h.debut}</td>
                      <td className="py-3 px-4">{h.fin}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleSupprimerHoraire(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section : Congés */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <FiCalendarIcon className="text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Congés / Indisponibilités</h2>
          </div>

          {/* Formulaire pour ajouter un congé */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Date de début</label>
                <input
                  type="date"
                  name="dateDebut"
                  value={nouveauConge.dateDebut}
                  onChange={handleCongeChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Date de fin</label>
                <input
                  type="date"
                  name="dateFin"
                  value={nouveauConge.dateFin}
                  onChange={handleCongeChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Motif (optionnel)</label>
                <input
                  type="text"
                  name="motif"
                  value={nouveauConge.motif}
                  onChange={handleCongeChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Vacances, maladie, etc."
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAjouterConge}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition"
                >
                  <FiPlus className="mr-2" /> Ajouter Congé
                </button>
              </div>
            </div>
          </div>

          {/* Liste des congés */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-600">Date de début</th>
                  <th className="py-3 px-4 text-left text-gray-600">Date de fin</th>
                  <th className="py-3 px-4 text-left text-gray-600">Motif</th>
                  <th className="py-3 px-4 text-left text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {conges.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      Aucun congé enregistré.
                    </td>
                  </tr>
                ) : (
                  conges.map((c, index) => (
                    <tr key={c._id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">{new Date(c.dateDebut).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(c.dateFin).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{c.motif || "-"}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleSupprimerConge(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ Zone pour afficher les toasts */}
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
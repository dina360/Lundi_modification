import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUser,
  FiClock,
  FiCalendar,
  FiFileText,
  FiPlus,
  FiCheck,
  FiAlertCircle,
  FiLoader
} from "react-icons/fi";

function FormulaireRendezVous({ selectedDate, onSuccess }) {
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [patient, setPatient] = useState("");
  const [medecin, setMedecin] = useState("");
  const [heure, setHeure] = useState("09:00");
  const [motif, setMotif] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [pRes, mRes] = await Promise.all([
          axios.get("http://localhost:5000/api/patients", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/medecins", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setPatients(pRes.data || []);
        setMedecins(mRes.data || []);
      } catch (err) {
        console.error("Erreur chargement données RDV:", err.response?.data || err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      loadData();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedDate) {
      setError("Veuillez d'abord sélectionner une date sur le calendrier.");
      return;
    }
    if (!heure) {
      setError("Veuillez choisir une heure.");
      return;
    }
    if (!patient || !medecin) {
      setError("Veuillez choisir un patient et un médecin.");
      return;
    }

    const finalDate = new Date(selectedDate);
    const [h, m] = heure.split(":");
    finalDate.setHours(h, m, 0, 0);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/appointments",
        {
          patient,
          medecin,
          date: finalDate,
          motif,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Rendez-vous créé avec succès !");
      setHeure("09:00");
      setMotif("");
      setPatient("");
      setMedecin("");

      setTimeout(() => {
        setSuccess("");
        if (onSuccess) onSuccess();
      }, 3000);

    } catch (err) {
      console.error("Erreur création RDV:", err.response?.data || err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création du rendez-vous."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="formulaire-rdv" className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <FiPlus className="text-2xl text-blue-900" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Nouveau Rendez-vous</h3>
          <p className="text-gray-600">Planifier une consultation</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-3" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center">
            <FiCheck className="text-green-500 mr-3" />
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* PATIENT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <FiUser className="mr-2 text-blue-900" />
                Patient
              </div>
            </label>
            <select
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300"
              disabled={loading}
            >
              <option value="">Sélectionner un patient</option>
              {patients
                .filter((p) => p && p._id && p.name)
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.dossier ? `(Dossier #${p.dossier})` : ""}
                  </option>
                ))}
            </select>
          </div>

          {/* MÉDECIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <FiUser className="mr-2 text-blue-900" />
                Médecin
              </div>
            </label>
            <select
              value={medecin}
              onChange={(e) => setMedecin(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300"
              disabled={loading}
            >
              <option value="">Sélectionner un médecin</option>
              {medecins
                .filter((m) => m && m._id && m.name)
                .map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} {m.specialty ? `- ${m.specialty}` : ""}
                  </option>
                ))}
            </select>
          </div>

          {/* DATE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <FiCalendar className="mr-2 text-blue-900" />
                Date sélectionnée
              </div>
            </label>
            <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl font-medium text-blue-900">
              {selectedDate
                ? selectedDate.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Aucune date sélectionnée"}
            </div>
          </div>

          {/* HEURE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <FiClock className="mr-2 text-blue-900" />
                Heure
              </div>
            </label>
            <input
              type="time"
              value={heure}
              onChange={(e) => setHeure(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300"
              disabled={loading}
            />
          </div>
        </div>

        {/* MOTIF */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <FiFileText className="mr-2 text-blue-900" />
              Motif de la consultation
            </div>
          </label>
          <textarea
            rows={3}
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Ex : Consultation de contrôle, douleur thoracique, bilan annuel..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 hover:shadow-2xl"
          }`}
        >
          {loading ? (
            <>
              <FiLoader className="animate-spin text-xl" />
              <span>Création en cours...</span>
            </>
          ) : (
            <>
              <FiPlus className="text-xl" />
              <span>Planifier le rendez-vous</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default FormulaireRendezVous;
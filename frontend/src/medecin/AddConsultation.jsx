import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiCalendar,
  FiClock,
  FiActivity,
  FiFileText,
  FiPackage,
  FiCheck,
  FiX,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";
import ToastNotification from "../ToastNotification"; 

export default function AddConsultation() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const medecin = JSON.parse(localStorage.getItem("medecin"));

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().substring(0, 5),
    notes: "",
    prescription: "",
    diagnostic: "",
  });

  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔹 État pour le toast
  const [toast, setToast] = useState(null);

  // Fonction pour afficher un toast
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Disparaît après 3 secondes
  };

  // Charger les infos du patient
  useEffect(() => {
    if (!patientId) {
      setError("ID patient manquant dans l'URL.");
      showToast("ID patient manquant dans l'URL.", "error");
      return;
    }

    const fetchPatient = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatient(res.data);
      } catch (err) {
        console.error("Erreur chargement patient:", err);
        const errorMsg = err.response?.data?.message || "Erreur lors du chargement des infos du patient.";
        setError(errorMsg);
        showToast(errorMsg, "error");
      }
    };

    fetchPatient();
  }, [patientId, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!medecin || !medecin.id) {
      showToast("Médecin non connecté.", "error");
      return;
    }

    try {
      const fullDateTime = new Date(`${formData.date}T${formData.time}`);

      const res = await axios.post(
        "http://localhost:5000/api/consultations",
        {
          patient: patientId,
          medecin: medecin.id,
          date: fullDateTime,
          notes: formData.notes,
          prescription: formData.prescription,
          diagnostic: formData.diagnostic,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast("Consultation enregistrée avec succès !", "success");
      setTimeout(() => {
        navigate(`/patients/${patientId}/dossier`); // Retourner au dossier du patient
      }, 1500);
    } catch (err) {
      console.error("Erreur ajout consultation:", err);
      const errorMsg = err.response?.data?.message || "Erreur lors de l'enregistrement.";
      showToast(errorMsg, "error");
    }
  };

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

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des informations du patient...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-800">Ajouter une Consultation</h1>
                <p className="text-gray-600">
                  Patient: <span className="font-semibold">{patient.name}</span>
                </p>
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

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date et Heure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-gray-700 mb-2 flex items-center">
                  <FiCalendar className="mr-2 text-blue-500" /> Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 mb-2 flex items-center">
                  <FiClock className="mr-2 text-blue-500" /> Heure
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Diagnostic */}
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 flex items-center">
                <FiActivity className="mr-2 text-blue-500" /> Diagnostic
              </label>
              <textarea
                name="diagnostic"
                value={formData.diagnostic}
                onChange={handleChange}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                placeholder="Entrez le diagnostic ici..."
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 flex items-center">
                <FiFileText className="mr-2 text-blue-500" /> Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[120px]"
                placeholder="Notes sur la consultation..."
              />
            </div>

            {/* Prescription */}
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 flex items-center">
                <FiPackage className="mr-2 text-blue-500" /> Prescription
              </label>
              <textarea
                name="prescription"
                value={formData.prescription}
                onChange={handleChange}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[120px]"
                placeholder="Prescription médicamenteuse..."
              />
            </div>

            {/* Bouton Soumettre */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-800 flex items-center justify-center shadow-md transition-all"
              >
                <FiCheck className="mr-2" /> Enregistrer la Consultation
              </button>
            </div>
          </form>
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
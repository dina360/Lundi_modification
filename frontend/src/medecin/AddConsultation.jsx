import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function AddConsultation() {
  const { patientId } = useParams(); // Récupérer l'ID du patient depuis l'URL
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const medecin = JSON.parse(localStorage.getItem("medecin"));

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0], // Date du jour
    time: new Date().toTimeString().substring(0, 5), // Heure actuelle
    notes: "",
    prescription: "",
    diagnostic: "",
  });

  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Charger les infos du patient
  useEffect(() => {
    if (!patientId) {
      setError("ID patient manquant dans l'URL.");
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
        setError("Erreur lors du chargement des infos du patient.");
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
      setError("Médecin non connecté.");
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

      setSuccess("Consultation enregistrée avec succès !");
      setTimeout(() => {
        navigate(`/patients/${patientId}/dossier`); // Retourner au dossier du patient
      }, 1500);
    } catch (err) {
      console.error("Erreur ajout consultation:", err);
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600">Erreur</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!patient) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">
        Ajouter une Consultation pour {patient.name}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Heure</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Diagnostic</label>
          <textarea
            name="diagnostic"
            value={formData.diagnostic}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Prescription</label>
          <textarea
            name="prescription"
            value={formData.prescription}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
        >
          Enregistrer la Consultation
        </button>
      </form>

      {success && <p className="mt-4 text-green-600 text-center">{success}</p>}
      {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
    </div>
  );
}
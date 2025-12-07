import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Pour rediriger vers le dossier

function MedecinPatientsList() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [rdvDate, setRdvDate] = useState("");
  const [rdvTime, setRdvTime] = useState("");
  const [rdvDuration, setRdvDuration] = useState(30);
  const [rdvNotes, setRdvNotes] = useState("");
  const [message, setMessage] = useState("");

  const medecin = JSON.parse(localStorage.getItem("medecin"));
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate(); // Pour rediriger

  const apiPatients = axios.create({
    baseURL: "http://localhost:5000/api/patients",
    headers: { Authorization: `Bearer ${token}` },
  });

  const apiRdv = axios.create({
    baseURL: "http://localhost:5000/api/appointments",
    headers: { Authorization: `Bearer ${token}` },
  });

  // ----------------------------------------
  // Charger les patients
  // ----------------------------------------
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await apiPatients.get("/");
        setPatients(res.data);
      } catch (err) {
        console.error("Erreur chargement patients :", err);
      }
    };

    loadPatients();
  }, []);

  // ----------------------------------------
  // Charger tous les RDV
  // ----------------------------------------
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const res = await apiRdv.get("/");
        setAppointments(res.data);
      } catch (err) {
        console.error("Erreur chargement RDV :", err);
      }
    };

    loadAppointments();
  }, []);

  // ----------------------------------------
  // Créer un RDV
  // ----------------------------------------
  const handleCreateRdv = async () => {
    if (!selectedPatient || !rdvDate || !rdvTime) {
      setMessage("Veuillez sélectionner un patient et une date/heure.");
      return;
    }

    const dateTime = new Date(`${rdvDate}T${rdvTime}`);
    try {
      const res = await apiRdv.post("/", {
        patient: selectedPatient._id,
        medecin: medecin.id, // Utilise `id` car ton backend renvoie `id`
        date: dateTime,
        duration: rdvDuration,
        notes: rdvNotes,
      });

      setMessage(`Rendez-vous créé avec succès pour ${selectedPatient.name}`);
      setAppointments([...appointments, res.data.rdv]);

      // Reset form
      setSelectedPatient(null);
      setRdvDate("");
      setRdvTime("");
      setRdvDuration(30);
      setRdvNotes("");
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Erreur lors de la création du rendez-vous."
      );
    }
  };

  // ----------------------------------------
  // Supprimer un RDV
  // ----------------------------------------
  const handleDeleteRdv = async (id) => {
    try {
      await apiRdv.delete(`/${id}`);
      setAppointments(appointments.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Erreur suppression RDV :", err);
    }
  };

  // ----------------------------------------
  // Voir le dossier médical
  // ----------------------------------------
  const handleViewDossier = (patientId) => {
    navigate(`/patients/${patientId}/dossier`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">
        Liste des patients
      </h1>

      {/* ------------------ */}
      {/* Tableau des patients */}
      {/* ------------------ */}
      <table className="min-w-full bg-white shadow rounded mb-8">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Téléphone</th>
            <th className="p-2 border">Adresse</th>
            <th className="p-2 border">Dossier</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p._id} className="border-b hover:bg-gray-50">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.phone}</td>
              <td className="p-2">{p.address}</td>
              <td className="p-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => handleViewDossier(p._id)}
                >
                  Voir Dossier
                </button>
              </td>
              <td className="p-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => setSelectedPatient(p)}
                >
                  Ajouter RDV
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ------------------ */}
      {/* Formulaire ajout RDV */}
      {/* ------------------ */}
      {selectedPatient && (
        <div className="bg-white shadow rounded p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Ajouter un rendez-vous pour {selectedPatient.name}
          </h2>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="date"
              value={rdvDate}
              onChange={(e) => setRdvDate(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="time"
              value={rdvTime}
              onChange={(e) => setRdvTime(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              value={rdvDuration}
              onChange={(e) => setRdvDuration(e.target.value)}
              className="border p-2 rounded w-24"
              min={10}
              max={180}
            />
          </div>

          <textarea
            value={rdvNotes}
            onChange={(e) => setRdvNotes(e.target.value)}
            placeholder="Notes / observations"
            className="border p-2 rounded w-full mb-4"
          />

          <button
            onClick={handleCreateRdv}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Créer RDV
          </button>

          {message && <p className="mt-3 text-red-600">{message}</p>}
        </div>
      )}

      {/* ------------------ */}
      {/* Liste RDV existants */}
      {/* ------------------ */}
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Rendez-vous existants</h2>

        {appointments.length === 0 && <p>Aucun rendez-vous.</p>}

        <ul>
          {appointments.map((a) => (
            <li key={a._id} className="border-b py-2 flex justify-between items-center">
              <div>
                <strong>{a.patient?.name}</strong> — {new Date(a.date).toLocaleString()} 
                {" "}({a.duration} min) — {a.notes || "Pas de notes"}
              </div>
              <button
                onClick={() => handleDeleteRdv(a._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MedecinPatientsList;
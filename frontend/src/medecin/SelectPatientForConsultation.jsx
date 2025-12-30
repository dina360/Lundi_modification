import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SelectPatientForConsultation() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/patients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
      } catch (err) {
        console.error("Erreur chargement patients:", err);
        setError("Erreur lors du chargement des patients.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [token]);

  const handleSelectPatient = (patientId) => {
    // Redirige vers une nouvelle route : /medecin/patients/:patientId/ajouter-consultation
    navigate(`/medecin/patients/${patientId}/ajouter-consultation`);
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sélectionner un patient pour ajouter une consultation</h2>
      <ul>
        {patients.map((p) => (
          <li key={p._id} className="p-2 border-b">
            <button
              onClick={() => handleSelectPatient(p._id)}
              className="text-blue-500 hover:underline"
            >
              {p.name} — {p.email}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import axios from "axios";

function ManageAppointments() {
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("authToken");
  const medecin = JSON.parse(localStorage.getItem("medecin"));

  useEffect(() => {
    if (!medecin || !medecin._id) return;

    axios
      .get("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const myRdvs = res.data.filter((r) => r.medecin._id === medecin._id);
        setRdvs(myRdvs);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [medecin, token]);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mes Rendez-vous</h2>
      <ul>
        {rdvs.map((r) => (
          <li key={r._id} className="p-2 border-b">
            {r.patient.name} — {new Date(r.date).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManageAppointments;
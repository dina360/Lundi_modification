import React, { useEffect, useState } from "react";
import axios from "axios";
import MaladeLayout from "./components/MaladeLayout";
import "./malade.css";

export default function MaladeDemandeRdv() {
  const maladeId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  const [specialites, setSpecialites] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [disponibilites, setDisponibilites] = useState([]);

  const [specialite, setSpecialite] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [loadingSpecialites, setLoadingSpecialites] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Charger les spécialités
  useEffect(() => {
    setLoadingSpecialites(true);
    axios
      .get("http://localhost:5000/api/malade/rdv/specialites", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSpecialites(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingSpecialites(false));
  }, [token]);

  const loadMedecins = async (sp) => {
    if (!sp) {
      setMedecins([]);
      return;
    }
    const res = await axios.get(`http://localhost:5000/api/malade/rdv/medecins/${sp}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMedecins(res.data);
  };

  const loadDisponibilites = async (docId, d) => {
    if (!docId || !d) {
      setDisponibilites([]);
      return;
    }
    setLoadingSlots(true);
    const res = await axios.get(
      `http://localhost:5000/api/malade/rdv/disponibilites/${docId}?date=${d}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDisponibilites(res.data.disponibilites || []);
    setLoadingSlots(false);
  };

  const resetAfterSuccess = () => {
    setSpecialite("");
    setDoctorId("");
    setDate("");
    setTime("");
    setMedecins([]);
    setDisponibilites([]);
  };

const submitRdv = async () => {
  if (!specialite || !doctorId || !date || !time) {
    alert("Veuillez remplir tous les champs !");
    return;
  }

  try {
    await axios.post(
      "http://localhost:5000/api/malade/rdv/prendre",
      { doctorId, date, time },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Rendez-vous pris avec succès !");
    resetAfterSuccess();
  } catch (err) {
    const msg = err.response?.data?.message || "Erreur lors de la prise du RDV";
    alert(msg);
  }
};



  return (
    <MaladeLayout title="📅 Prendre un rendez-vous" subtitle="Choisis spécialité, médecin, date et heure.">
      <div className="m-card">
        <div className="m-form">
          <div className="m-field">
            <label>Spécialité</label>
            <select
              value={specialite}
              onChange={(e) => {
                const sp = e.target.value;
                setSpecialite(sp);
                setDoctorId("");
                setDate("");
                setTime("");
                setDisponibilites([]);
                loadMedecins(sp);
              }}
            >
              <option value="">
                {loadingSpecialites ? "Chargement..." : "Choisir…"}
              </option>
              {specialites.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          <div className="m-field">
            <label>Médecin</label>
            <select
              value={doctorId}
              onChange={(e) => {
                const id = e.target.value;
                setDoctorId(id);
                setTime("");
                loadDisponibilites(id, date);
              }}
              disabled={!specialite}
            >
              <option value="">{specialite ? "Choisir…" : "Sélectionne une spécialité d’abord"}</option>
              {medecins.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="m-field">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                const d = e.target.value;
                setDate(d);
                setTime("");
                loadDisponibilites(doctorId, d);
              }}
              disabled={!doctorId}
            />
          </div>

          <div className="m-field">
            <label>Heure</label>
            <select value={time} onChange={(e) => setTime(e.target.value)} disabled={!doctorId || !date}>
              <option value="">
                {loadingSlots ? "Chargement..." : "Choisir…"}
              </option>
              {disponibilites.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="m-actions">
          <button className="m-btn primary" onClick={submitRdv}>
            Confirmer le rendez-vous
          </button>
          <button className="m-btn ghost" onClick={resetAfterSuccess}>
            Réinitialiser
          </button>
        </div>

        <p className="m-muted" style={{ marginTop: 12 }}>
          Le créneau est calculé selon le planning/absences du médecin + les RDV déjà réservés.
        </p>
      </div>
    </MaladeLayout>
  );
}
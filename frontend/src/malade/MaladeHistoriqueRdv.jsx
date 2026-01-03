import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FiEdit2, FiTrash2, FiArrowLeft, FiSave } from "react-icons/fi";
import MaladeLayout from "./components/MaladeLayout";
import "./malade.css";

export default function MaladeHistoriqueRdv() {
  const navigate = useNavigate();
  const { rdvId } = useParams(); // si on est sur /modifier/:rdvId

  const maladeId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // --- Edition
  const [specialites, setSpecialites] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [disponibilites, setDisponibilites] = useState([]);

  const [specialty, setSpecialty] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const currentRdv = useMemo(() => {
    if (!rdvId) return null;
    return rdvs.find((r) => r._id === rdvId) || null;
  }, [rdvId, rdvs]);


useEffect(() => {
  if (!maladeId || !token) {
    navigate("/login");
    return;
  }
  loadHistorique();  // Charger l'historique
}, [maladeId, token]);

const loadHistorique = async () => {
  setLoading(true);
  setErrMsg("");
  try {
    const res = await axios.get(
      `http://localhost:5000/api/malade/rdv/historique/${maladeId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRdvs(res.data || []);
  } catch (e) {
    setErrMsg("Erreur chargement historique");
  } finally {
    setLoading(false);
  }
};




  // ---------- Load specialites (pour page modifier)
  const loadSpecialites = async () => {
    const res = await axios.get("http://localhost:5000/api/malade/rdv/specialites", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSpecialites(res.data || []);
  };

  const loadMedecins = async (sp) => {
    if (!sp) return setMedecins([]);
    const res = await axios.get(`http://localhost:5000/api/malade/rdv/medecins/${sp}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMedecins(res.data || []);
  };

const loadDisponibilites = async (docId, d) => {
  if (!docId || !d) return setDisponibilites([]);

  const res = await axios.get(
    `http://localhost:5000/api/malade/rdv/disponibilites/${docId}?date=${d}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  let slots = res.data?.disponibilites || [];

  // ✅ En modification: garder l'heure actuelle du RDV même si elle est "réservée"
  if (currentRdv?.time && !slots.includes(currentRdv.time)) {
    slots = [currentRdv.time, ...slots];
  }

  setDisponibilites(slots);
};



  // ---------- Quand on arrive sur /modifier/:id : pré-remplir le formulaire
  useEffect(() => {
    if (!rdvId) return;

    // charger listes
    loadSpecialites().catch(() => {});
  }, [rdvId]); // eslint-disable-line

  useEffect(() => {
    if (!currentRdv) return;

    const sp = currentRdv.doctorId?.specialty || currentRdv.doctorId?.specialty;
    const doc = currentRdv.doctorId?._id || currentRdv.doctorId;
    const d = currentRdv.date;
    const t = currentRdv.time;

    setSpecialty(sp || "");
    setDoctorId(doc || "");
    setDate(d || "");
    setTime(t || "");

    if (sp) loadMedecins(sp).catch(() => {});
    if (doc && d) loadDisponibilites(doc, d).catch(() => {});
  }, [currentRdv]); // eslint-disable-line

  // ---------- Actions
  const deleteRdv = async (id) => {
    if (!window.confirm("Supprimer ce rendez-vous ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/malade/rdv/rdv/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadHistorique();
    } catch (e) {
      alert(e.response?.data?.message || "Erreur suppression");
    }
  };

  const goEdit = (rdv) => {
    navigate(`/malade/rendezvous/modifier/${rdv._id}`);
  };

  const submitUpdate = async () => {
    if (!specialty || !doctorId || !date || !time) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/malade/rdv/rdv/${rdvId}`,
        { specialty, doctorId, date, time },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Rendez-vous modifié !");
      navigate("/malade/rendezvous/historique");
      await loadHistorique();
    } catch (e) {
  console.log("UPDATE ERROR:", e.response?.status, e.response?.data);
  alert(e.response?.data?.message || "Erreur modification");
}
  };

  // =========================
  // PAGE MODIFIER (URL)
  // =========================
  if (rdvId) {
    return (
      <MaladeLayout title="✏️ Modifier le rendez-vous" subtitle="Modification possible uniquement si le RDV est en attente.">
        <div className="m-card">
          <button className="m-btn m-btn--ghost" onClick={() => navigate("/malade/rendezvous/historique")}>
            <FiArrowLeft /> Retour
          </button>

          {!currentRdv ? (
            <p className="m-muted" style={{ marginTop: 12 }}>
              Chargement du rendez-vous...
            </p>
          ) : (
            <>
              <div className="m-form" style={{ marginTop: 12 }}>
                <div className="m-field">
                  <label>Spécialité</label>
                  <select
                    value={specialty}
                    onChange={(e) => {
                      const sp = e.target.value;
                      setSpecialty(sp);
                      setDoctorId("");
                      setTime(""); 
                      setDisponibilites([]);
                      loadMedecins(sp);
                    }}
                  >
                    <option value="">Choisir…</option>
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
                        const docId = e.target.value;
                        setDoctorId(docId);
                        setTime("");                // ✅ AJOUT
                        loadDisponibilites(docId, date);
                    }}
                  >
                    <option value="">Choisir…</option>
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
                      setTime("");                // ✅ AJOUT
                      loadDisponibilites(doctorId, d);
                                        }}
                  />
                </div>

                <div className="m-field">
                  <label>Heure</label>
                  <select value={time} onChange={(e) => setTime(e.target.value)}>
                    <option value="">Choisir…</option>
                    {disponibilites.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="m-btn m-btn--secondary" onClick={submitUpdate}>
                  <FiSave /> Sauvegarder
                </button>
              </div>

              <p className="m-muted" style={{ marginTop: 10 }}>
                NB : si tu vois “Ce médecin n’est pas disponible”, c’est une validation backend.
              </p>
            </>
          )}
        </div>
      </MaladeLayout>
    );
  }

  // =========================
  // PAGE HISTORIQUE
  // =========================
  return (
    <MaladeLayout title="📘 Historique des rendez-vous" subtitle="Tes rendez-vous passés et à venir.">
      {errMsg ? <div className="m-alert m-alert--danger">{errMsg}</div> : null}

      {loading ? (
        <div className="m-card">
          <p className="m-muted">Chargement...</p>
        </div>
      ) : rdvs.length === 0 ? (
        <div className="m-card">
          <p className="m-muted">Aucun rendez-vous trouvé.</p>
        </div>
      ) : (
        <div className="m-grid">
          {rdvs.map((rdv) => (
            <div className="m-card" key={rdv._id}>
              <div className="m-row">
                <div>
                  <h3 className="m-h3">
                    {rdv.doctorId?.name || "Médecin"} — {rdv.doctorId?.specialty || "Spécialité"}
                  </h3>
                  <p className="m-muted">📅 {rdv.date} • ⏰ {rdv.time}</p>
                </div>

                <span className={`m-badge ${rdv.status === "En attente" ? "m-badge--warn" : rdv.status === "En cours" ? "m-badge--info" : "m-badge--ok"}`}>
                  {rdv.status}
                </span>
              </div>

              {rdv.status === "En attente" ? (
                <div className="m-actions">
                  <button className="m-btn m-btn--danger" onClick={() => deleteRdv(rdv._id)}>
                    <FiTrash2 /> Supprimer
                  </button>
                  <button className="m-btn m-btn--secondary" onClick={() => goEdit(rdv)}>
                    <FiEdit2 /> Modifier
                  </button>
                </div>
              ) : (
                <p className="m-muted" style={{ marginTop: 10 }}>
                  Actions désactivées (RDV {rdv.status.toLowerCase()}).
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </MaladeLayout>
  );
}
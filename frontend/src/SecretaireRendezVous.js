// src/SecretaireRendezVous.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import "./SecretaireHome.css";
import "./SecretaireRendezVous.css";
import { LuHistory } from "react-icons/lu";

import neohealthLogo from "./assets/neohealth-logo.jpg";
import {
  LuLayoutDashboard,
  LuUsers,
  LuCalendarCheck,
  LuBuilding2,
  LuLogOut,
} from "react-icons/lu";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const MAX_APPOINTMENTS_PER_DAY = 8;

function formatLocalYMD(dateObj) {
  const d = new Date(dateObj);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function SecretaireRendezVous() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  const calendarRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // NAV
  const goToHome = () => navigate("/secretaire/home");
  const goToPatients = () => navigate("/secretaire/patients");
  const goToAgenda = () => navigate("/secretaire/rendezvous");
  const goToSalles = () => navigate("/secretaire/salles");
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const todayStr = useMemo(() => formatLocalYMD(new Date()), []);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // patients
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [errorPatients, setErrorPatients] = useState("");

  // range + appointments
  const [rangeInfo, setRangeInfo] = useState({ from: null, to: null });
  const [appointments, setAppointments] = useState([]);
  const [errorRdv, setErrorRdv] = useState("");

  // form
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [motif, setMotif] = useState("");

  // modal planning
  const [planningOpen, setPlanningOpen] = useState(false);
  const [planningDate, setPlanningDate] = useState("");
  const [planningRows, setPlanningRows] = useState([]);
  const [planningLoading, setPlanningLoading] = useState(false);
  const [planningError, setPlanningError] = useState("");

  // edit
  const [editingId, setEditingId] = useState(null);
  const [editTime, setEditTime] = useState("09:00");
  const [editMotif, setEditMotif] = useState("");
  const [editStatus, setEditStatus] = useState("planifié");

  // fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      setErrorPatients("");
      try {
        const res = await fetch(`${API_BASE_URL}/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        const data = await res.json();
        setPatients(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErrorPatients("Erreur chargement patients.");
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [token, navigate]);

  const refreshRange = async (from, to) => {
    if (!from || !to) return;
    setErrorRdv("");

    try {
      const res = await fetch(`${API_BASE_URL}/appointments?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErrorRdv("Erreur chargement rendez-vous.");
      setAppointments([]);
    }
  };

  useEffect(() => {
    if (rangeInfo.from && rangeInfo.to) refreshRange(rangeInfo.from, rangeInfo.to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeInfo.from, rangeInfo.to]);

  const countByDay = useMemo(() => {
    const map = {};
    for (const a of appointments) {
      const key = formatLocalYMD(a.date);
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [appointments]);

  const getDotClassOrNull = (dateStr) => {
    const count = countByDay[dateStr] || 0;
    if (count === 0) return null;

    if (dateStr < todayStr) return "dot-green";
    if (count >= MAX_APPOINTMENTS_PER_DAY) return "dot-red";
    return "dot-yellow";
  };

  const openPlanning = async (dateStr) => {
    setPlanningOpen(true);
    setPlanningDate(dateStr);
    setPlanningRows([]);
    setPlanningError("");
    setPlanningLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/appointments/day?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const data = await res.json();
      setPlanningRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setPlanningError("Erreur chargement planning.");
    } finally {
      setPlanningLoading(false);
    }
  };

  const closePlanning = () => {
    setPlanningOpen(false);
    setPlanningDate("");
    setPlanningRows([]);
    setEditingId(null);
  };

  // ✅ CORRECTION PRINCIPALE : injecter dans .fc-daygrid-day-frame
  const renderDots = () => {
    const api = calendarRef.current?.getApi?.();
    const root = api?.el;
    if (!root) return;

    const dayCells = root.querySelectorAll(".fc-daygrid-day");
    dayCells.forEach((cell) => {
      const dateStr = cell.getAttribute("data-date");
      if (!dateStr) return;

      const frame = cell.querySelector(".fc-daygrid-day-frame");
      if (!frame) return;

      const old = frame.querySelector(".day-dot-wrap");
      if (old) old.remove();

      const dotClass = getDotClassOrNull(dateStr);
      if (!dotClass) return;

      const wrap = document.createElement("div");
      wrap.className = "day-dot-wrap";

      const dot = document.createElement("div");
      dot.className = `day-dot ${dotClass}`;
      dot.title = "Voir planning";
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openPlanning(dateStr);
      });

      wrap.appendChild(dot);
      frame.appendChild(wrap);
    });
  };

  // relance après chargement appointments (countByDay)
  useEffect(() => {
    const t = setTimeout(() => renderDots(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countByDay]);

  const submitRdv = async () => {
    if (!selectedPatient || !selectedDate || !selectedTime) {
      alert("Veuillez choisir un patient, une date et une heure.");
      return;
    }
    if (selectedDate < todayStr) {
      alert("Date passée interdite.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: selectedPatient,
          date: selectedDate,
          time: selectedTime,
          motif,
          status: "planifié",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Erreur lors de la création du rendez-vous");
        return;
      }

      alert("Rendez-vous ajouté !");
      setMotif("");

      await refreshRange(rangeInfo.from, rangeInfo.to);

      if (planningOpen && planningDate === selectedDate) {
        await openPlanning(selectedDate);
      }

      setTimeout(() => renderDots(), 0);
    } catch (e) {
      console.error(e);
      alert("Erreur serveur.");
    }
  };

  const startEdit = (row) => {
    setEditingId(row._id);
    const d = new Date(row.date);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    setEditTime(`${hh}:${mm}`);
    setEditMotif(row.notes || "");
    setEditStatus(row.status || "planifié");
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: planningDate,
          time: editTime,
          motif: editMotif,
          status: editStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Erreur modification RDV");
        return;
      }

      setEditingId(null);

      await openPlanning(planningDate);
      await refreshRange(rangeInfo.from, rangeInfo.to);
      setTimeout(() => renderDots(), 0);
    } catch (e) {
      console.error(e);
      alert("Erreur serveur modification.");
    }
  };

  const deleteRdv = async (id) => {
    if (!window.confirm("Supprimer ce rendez-vous ?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Erreur suppression");
        return;
      }

      await openPlanning(planningDate);
      await refreshRange(rangeInfo.from, rangeInfo.to);
      setTimeout(() => renderDots(), 0);
    } catch (e) {
      console.error(e);
      alert("Erreur serveur suppression.");
    }
  };

  const kpis = useMemo(() => {
    const now = new Date();
    const today = todayStr;

    let totalToday = 0;
    let done = 0;
    let canceled = 0;
    let upcoming = 0;

    for (const a of appointments) {
      const d = new Date(a.date);
      const isoLocal = formatLocalYMD(d);

      const status = (a.status || "planifié").toLowerCase();

      if (isoLocal === today) totalToday++;

      if (status === "terminé" || status === "termine") done++;
      if (status === "annulé" || status === "annule") canceled++;

      if (
        d > now &&
        status !== "annulé" &&
        status !== "annule" &&
        status !== "terminé" &&
        status !== "termine"
      ) {
        upcoming++;
      }
    }

    return { totalToday, done, upcoming, canceled };
  }, [appointments, todayStr]);

  return (
    <div className="neo-layout neo-layout-tight">
      {/* ===== SIDEBAR ===== */}
      <aside className="neo-sidebar">
        <div className="neo-brand" onClick={goToHome}>
          <img src={neohealthLogo} alt="NeoHealth logo" className="neo-brand-img" />
          <div className="neo-brand-txt">
            <div className="neo-brand-name">NeoHealth</div>
            <div className="neo-brand-sub">Medical Suite</div>
          </div>
        </div>

        <div className="neo-nav-section">GÉNÉRAL</div>
        <nav className="neo-nav">
          <div className={`neo-nav-item ${isActive("/secretaire/home") ? "active" : ""}`} onClick={goToHome}>
            <LuLayoutDashboard className="neo-nav-ico" />
            <span>Tableau de Bord</span>
          </div>

          <div className={`neo-nav-item ${isActive("/secretaire/patients") ? "active" : ""}`} onClick={goToPatients}>
            <LuUsers className="neo-nav-ico" />
            <span>Gestion Patients</span>
          </div>

          <div className={`neo-nav-item ${isActive("/secretaire/rendezvous") ? "active" : ""}`} onClick={goToAgenda}>
            <LuCalendarCheck className="neo-nav-ico" />
            <span>Rendez-vous</span>
          </div>

          <div className="neo-nav-section">ADMINISTRATION</div>

          <div className={`neo-nav-item ${isActive("/secretaire/salles") ? "active" : ""}`} onClick={goToSalles}>
            <LuBuilding2 className="neo-nav-ico" />
            <span>Salles & Blocs</span>
          </div>

          <div
            className={`neo-nav-item ${isActive("/secretaire/salles/historique") ? "active" : ""}`}
            onClick={() => navigate("/secretaire/salles/historique")}
          >
            <LuHistory className="neo-nav-ico" />
            <span>Historique réservations</span>
          </div>

          <div className="neo-nav-spacer" />

          <div className="neo-nav-item logout" onClick={logout}>
            <LuLogOut className="neo-nav-ico" />
            <span>Déconnexion</span>
          </div>
        </nav>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="neo-main neo-main-tight">
        {/* HEADER */}
        <section className="neo-header neo-header-full">
          <div className="neo-header-left">
            <div className="neo-header-icon"><span>📅</span></div>
            <div>
              <h1 className="neo-header-title">Gestion des Rendez-vous</h1>
              <p className="neo-header-subtitle">Planification intelligente avec suivi en temps réel</p>
            </div>
          </div>

          <div className="neo-header-right">
            <div className="neo-header-date">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="neo-header-online">
              <span className="neo-online-dot" />
              <span>Système en ligne</span>
            </div>
          </div>
        </section>

        <div className="neo-content">
          {/* KPI */}
          <section className="neo-kpis neo-kpis-4 rdv-kpis-like-admin">
            <div className="neo-kpi-card">
              <div className="neo-kpi-top">
                <div className="neo-kpi-icon icon-blue"><span className="neo-emoji">📌</span></div>
                <div className="neo-kpi-pill pill-green">Aujourd’hui</div>
              </div>
              <div className="neo-kpi-value">{kpis.totalToday}</div>
              <div className="neo-kpi-label">Total aujourd&apos;hui</div>
              <div className="neo-kpi-sub">Rendez-vous du jour</div>
            </div>

            <div className="neo-kpi-card">
              <div className="neo-kpi-top">
                <div className="neo-kpi-icon icon-purple"><span className="neo-emoji">✅</span></div>
                <div className="neo-kpi-pill pill-gray">Statut</div>
              </div>
              <div className="neo-kpi-value">{kpis.done}</div>
              <div className="neo-kpi-label">Terminés</div>
              <div className="neo-kpi-sub">Consultations finalisées</div>
            </div>

            <div className="neo-kpi-card">
              <div className="neo-kpi-top">
                <div className="neo-kpi-icon icon-green"><span className="neo-emoji">⏳</span></div>
                <div className="neo-kpi-pill pill-green">À venir</div>
              </div>
              <div className="neo-kpi-value">{kpis.upcoming}</div>
              <div className="neo-kpi-label">À venir</div>
              <div className="neo-kpi-sub">Prochains rendez-vous</div>
            </div>

            <div className="neo-kpi-card">
              <div className="neo-kpi-top">
                <div className="neo-kpi-icon icon-orange"><span className="neo-emoji">✖️</span></div>
                <div className="neo-kpi-pill pill-gray">Suivi</div>
              </div>
              <div className="neo-kpi-value">{kpis.canceled}</div>
              <div className="neo-kpi-label">Annulés</div>
              <div className="neo-kpi-sub">Rendez-vous annulés</div>
            </div>
          </section>

          {/* Content */}
          <section className="rdv-content">
            {/* Calendrier */}
            <div className="neo-card rdv-calendar">
              <div className="neo-card-head">
                <div>
                  <h2 className="neo-card-title">Calendrier des Rendez-vous</h2>
                  <p className="neo-card-sub">Pastille selon l’état de la journée</p>
                </div>

                <div className="rdv-legend">
                  <span><i className="dot dot-yellow" /> Places dispo</span>
                  <span><i className="dot dot-red" /> Saturé</span>
                  <span><i className="dot dot-green" /> Ancien</span>
                </div>
              </div>

              {errorRdv ? <div className="neo-alert">{errorRdv}</div> : null}

              <div className="neo-calendar-wrap">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth",
                  }}
                  events={[]}
                  datesSet={(arg) => {
                    const from = formatLocalYMD(arg.start);
                    const endDate = new Date(arg.end);
                    endDate.setDate(endDate.getDate() - 1);
                    const to = formatLocalYMD(endDate);

                    setRangeInfo({ from, to });
                    setTimeout(() => renderDots(), 0);
                  }}
                />
              </div>
            </div>

            {/* Form */}
            <div className="neo-card rdv-form">
              <div className="neo-form-head">
                <div className="neo-plus">+</div>
                <div>
                  <h2 className="neo-card-title">Nouveau Rendez-vous</h2>
                  <p className="neo-card-sub">Planifier une consultation</p>
                </div>
              </div>

              {errorPatients ? <div className="neo-alert">{errorPatients}</div> : null}

              <label className="neo-label">Patient</label>
              <select
                className="neo-input"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                disabled={loadingPatients}
              >
                <option value="">{loadingPatients ? "Chargement..." : "Sélectionner un patient"}</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Dossier: {p.dossier})
                  </option>
                ))}
              </select>

              <label className="neo-label">Date</label>
              <input
                className="neo-input"
                type="date"
                value={selectedDate}
                min={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <label className="neo-label">Heure</label>
              <input
                className="neo-input"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />

              <label className="neo-label">Motif</label>
              <textarea
                className="neo-textarea"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Ex : Consultation de contrôle..."
              />

              <button onClick={submitRdv} className="neo-btn-primary">
                + Confirmer le rendez-vous
              </button>

              <div className="neo-help">
                Capacité/jour: <b>{MAX_APPOINTMENTS_PER_DAY}</b>
              </div>
            </div>
          </section>
        </div>

        {/* MODAL */}
        {planningOpen && (
          <div className="neo-modal-overlay" onClick={closePlanning}>
            <div className="neo-modal" onClick={(e) => e.stopPropagation()}>
              <div className="neo-modal-head">
                <div>
                  <h3>Planning — {planningDate}</h3>
                  <p>Modifier / supprimer des rendez-vous</p>
                </div>
                <button className="neo-modal-close" onClick={closePlanning}>×</button>
              </div>

              {planningLoading && <div className="neo-loading">Chargement...</div>}
              {planningError && <div className="neo-alert neo-alert-pad">{planningError}</div>}

              {!planningLoading && (
                <div className="neo-table-wrap">
                  <table className="neo-table">
                    <thead>
                      <tr>
                        <th>Date/Heure</th>
                        <th>Patient</th>
                        <th>Motif</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {planningRows.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", padding: "14px" }}>
                            Aucun rendez-vous ce jour.
                          </td>
                        </tr>
                      ) : (
                        planningRows.map((r) => {
                          const d = new Date(r.date);
                          const hh = String(d.getHours()).padStart(2, "0");
                          const mm = String(d.getMinutes()).padStart(2, "0");
                          const timeStr = `${hh}:${mm}`;

                          const patientLabel = r.patient?.name
                            ? `${r.patient.name} (Dossier: ${r.patient.dossier || "-"})`
                            : "—";

                          const isEditing = editingId === r._id;

                          return (
                            <tr key={r._id}>
                              <td>
                                {isEditing ? (
                                  <input
                                    className="neo-input"
                                    type="time"
                                    value={editTime}
                                    onChange={(e) => setEditTime(e.target.value)}
                                  />
                                ) : (
                                  `${planningDate} ${timeStr}`
                                )}
                              </td>

                              <td>{patientLabel}</td>

                              <td>
                                {isEditing ? (
                                  <input
                                    className="neo-input"
                                    type="text"
                                    value={editMotif}
                                    onChange={(e) => setEditMotif(e.target.value)}
                                    placeholder="Motif..."
                                  />
                                ) : (
                                  r.notes || "—"
                                )}
                              </td>

                              <td>
                                {isEditing ? (
                                  <select
                                    className="neo-input"
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                  >
                                    <option value="planifié">planifié</option>
                                    <option value="en cours">en cours</option>
                                    <option value="terminé">terminé</option>
                                    <option value="annulé">annulé</option>
                                  </select>
                                ) : (
                                  r.status || "planifié"
                                )}
                              </td>

                              <td className="neo-actions">
                                {isEditing ? (
                                  <>
                                    <button className="neo-btn-small neo-btn-save" onClick={saveEdit}>
                                      Enregistrer
                                    </button>
                                    <button className="neo-btn-small neo-btn-cancel" onClick={() => setEditingId(null)}>
                                      Annuler
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button className="neo-btn-small neo-btn-edit" onClick={() => startEdit(r)}>
                                      Modifier
                                    </button>
                                    <button className="neo-btn-small neo-btn-del" onClick={() => deleteRdv(r._id)}>
                                      Supprimer
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="neo-modal-foot">
                RDV: <b>{planningRows.length}</b> / {MAX_APPOINTMENTS_PER_DAY}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

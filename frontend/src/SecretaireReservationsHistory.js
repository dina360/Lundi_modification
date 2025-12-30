// src/SecretaireReservationsHistory.js
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SecretaireHome.css";
import "./SecretaireReservationsHistory.css";

import neohealthLogo from "./assets/neohealth-logo.jpg";

import {
  LuLayoutDashboard,
  LuUsers,
  LuCalendarCheck,
  LuBuilding2,
  LuLogOut,
  LuHistory,
} from "react-icons/lu";

import { FiSearch, FiEdit, FiXCircle, FiSave, FiRefreshCw } from "react-icons/fi";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function ymd(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function hm(date) {
  const d = new Date(date);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function uiStatus(reservation) {
  const raw = (reservation.status || "").toLowerCase();
  if (raw === "annulée" || raw === "annulee") return "annulée";
  const now = new Date();
  const s = new Date(reservation.start);
  const e = new Date(reservation.end);
  if (now < s) return "à venir";
  if (now >= s && now <= e) return "en cours";
  return "terminée";
}

// ✅ pour CSS sans accents
function statusClassName(label) {
  const s = (label || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire accents
    .replace(/\s+/g, "-");
  // "à venir" -> "a-venir", "terminée" -> "terminee"
  return s;
}

export default function SecretaireReservationsHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("authToken");

  // NAV
  const goToHome = () => navigate("/secretaire/home");
  const goToPatients = () => navigate("/secretaire/patients");
  const goToAgenda = () => navigate("/secretaire/rendezvous");
  const goToSalles = () => navigate("/secretaire/salles");
  const goToHistorique = () => navigate("/secretaire/salles/historique");
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const headersAuth = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const headersJson = useMemo(
    () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }),
    [token]
  );

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("toutes");

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // édition
  const [editing, setEditing] = useState(null);
  const [editSalleId, setEditSalleId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editMotif, setEditMotif] = useState("");

  const [allRooms, setAllRooms] = useState([]);

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/salles/reservations`, { headers: headersAuth });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur chargement réservations");
      setReservations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur chargement réservations");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/salles`, { headers: headersAuth });
      const data = await res.json();
      if (res.ok) setAllRooms(Array.isArray(data) ? data : []);
    } catch {
      // silencieux
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = reservations.map((r) => ({ ...r, uiStatus: uiStatus(r) }));

    if (activeTab !== "toutes") list = list.filter((r) => r.uiStatus === activeTab);

    if (!q) return list;

    return list.filter((r) => {
      const salle = (r.salle?.name || "").toLowerCase();
      const type = (r.salle?.type || "").toLowerCase();
      const motif = (r.motif || "").toLowerCase();
      const by = (r.reservedBy?.name || r.reservedBy?.email || "").toLowerCase();
      return salle.includes(q) || type.includes(q) || motif.includes(q) || by.includes(q);
    });
  }, [reservations, query, activeTab]);

  const startEdit = (r) => {
    setEditing(r);
    setEditSalleId(r.salle?._id || "");
    setEditDate(ymd(r.start));
    setEditStart(hm(r.start));
    setEditEnd(hm(r.end));
    setEditMotif(r.motif || "");
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditSalleId("");
    setEditDate("");
    setEditStart("");
    setEditEnd("");
    setEditMotif("");
  };

  const saveEdit = async () => {
    if (!editing) return;

    try {
      const res = await fetch(`${API_BASE_URL}/salles/reservations/${editing._id}`, {
        method: "PUT",
        headers: headersJson,
        body: JSON.stringify({
          salleId: editSalleId,
          date: editDate,
          start: editStart,
          end: editEnd,
          motif: editMotif,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.message || "Erreur modification");
        return;
      }

      alert("Réservation modifiée !");
      cancelEdit();
      await fetchReservations();
    } catch (e) {
      console.error(e);
      alert("Erreur serveur.");
    }
  };

  // ✅ ANNULATION (corrigée) : PATCH /reservations/:id/cancel
  const cancelReservation = async (id) => {
    if (!window.confirm("Annuler cette réservation ?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/salles/reservations/${id}/cancel`, {
        method: "PATCH",
        headers: headersAuth,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.message || `Erreur annulation (HTTP ${res.status})`);
        return;
      }

      alert(data?.message || "Réservation annulée.");
      await fetchReservations();
    } catch (e) {
      console.error(e);
      alert("Erreur serveur (annulation).");
    }
  };

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
            onClick={goToHistorique}
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
        <section className="neo-header neo-header-full">
          <div className="neo-header-left">
            <div className="neo-header-icon"><span>🧾</span></div>
            <div>
              <h1 className="neo-header-title">Historique des réservations</h1>
              <p className="neo-header-subtitle">Suivi, modification et annulation</p>
            </div>
          </div>

          <div className="neo-header-right">
            <button className="hist-btn" type="button" onClick={fetchReservations}>
              <FiRefreshCw />
              Actualiser
            </button>
          </div>
        </section>

        <div className="neo-content">
          {/* Toolbar */}
          <div className="hist-toolbar">
            <div className="hist-search">
              <FiSearch className="hist-search-ico" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par salle, type, motif, réservé par..."
              />
            </div>

            <div className="hist-tabs">
              {["toutes", "à venir", "en cours", "terminée", "annulée"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`hist-tab ${activeTab === t ? "active" : ""}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t === "toutes" ? "Toutes" : t}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ ESPACE DEMANDÉ */}
          <div className="hist-space" />

          {error ? <div className="neo-alert neo-alert-pad">{error}</div> : null}

          <div className="neo-card">
            <div className="neo-card-head">
              <div>
                <h2 className="neo-card-title">Liste des réservations</h2>
                <p className="neo-card-sub">Statut calculé (à venir / en cours / terminée) + annulée</p>
              </div>
            </div>

            <div className="neo-card-body">
              {loading ? (
                <div className="neo-loading">Chargement...</div>
              ) : filtered.length === 0 ? (
                <div className="neo-empty">Aucune réservation trouvée.</div>
              ) : (
                <div className="neo-table-wrap">
                  <table className="neo-table">
                    <thead>
                      <tr>
                        <th>Salle</th>
                        <th>Créneau</th>
                        <th>Motif</th>
                        <th>Réservé par</th>
                        <th>Statut</th>
                        <th style={{ width: 180 }}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.map((r) => {
                        const st = r.uiStatus;
                        const stClass = statusClassName(st); // ✅ sans accents
                        const blocked = st === "annulée" || st === "terminée";

                        return (
                          <tr key={r._id}>
                            <td>
                              <b>{r.salle?.name || "—"}</b>
                              <div className="muted">{r.salle?.type || ""}</div>
                            </td>

                            <td>
                              {ymd(r.start)}{" "}
                              <span className="muted">
                                {hm(r.start)} → {hm(r.end)}
                              </span>
                            </td>

                            <td>{r.motif || "—"}</td>

                            <td>{r.reservedBy?.name || r.reservedBy?.email || "—"}</td>

                            <td>
                              <span className={`hist-badge st-${stClass}`}>
                                {st}
                              </span>
                            </td>

                            <td>
                              <div className="hist-actions">
                                <button
                                  className="hist-action"
                                  type="button"
                                  onClick={() => startEdit(r)}
                                  disabled={blocked}
                                  title="Modifier"
                                >
                                  <FiEdit />
                                </button>

                                <button
                                  className="hist-action danger"
                                  type="button"
                                  onClick={() => cancelReservation(r._id)}
                                  disabled={blocked}
                                  title="Annuler"
                                >
                                  <FiXCircle />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* MODAL EDIT */}
          {editing ? (
            <div className="hist-modal-overlay" onClick={cancelEdit} role="presentation">
              <div className="hist-modal" onClick={(e) => e.stopPropagation()} role="presentation">
                <div className="hist-modal-head">
                  <h3>Modifier réservation</h3>
                  <button className="hist-close" type="button" onClick={cancelEdit}>×</button>
                </div>

                <div className="hist-form">
                  <label className="neo-label">Salle</label>
                  <select className="neo-input" value={editSalleId} onChange={(e) => setEditSalleId(e.target.value)}>
                    <option value="">— Choisir —</option>
                    {allRooms.map((rm) => (
                      <option key={rm._id} value={rm._id}>
                        {rm.name} ({rm.type || "Salle"})
                      </option>
                    ))}
                  </select>

                  <div className="hist-grid">
                    <div>
                      <label className="neo-label">Date</label>
                      <input className="neo-input" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="neo-label">Début</label>
                      <input className="neo-input" type="time" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
                    </div>
                    <div>
                      <label className="neo-label">Fin</label>
                      <input className="neo-input" type="time" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
                    </div>
                  </div>

                  <label className="neo-label">Motif</label>
                  <input className="neo-input" value={editMotif} onChange={(e) => setEditMotif(e.target.value)} />

                  <div className="hist-modal-actions">
                    <button className="hist-btn ghost" type="button" onClick={cancelEdit}>
                      Annuler
                    </button>
                    <button className="hist-btn primary" type="button" onClick={saveEdit}>
                      <FiSave />
                      Enregistrer
                    </button>
                  </div>

                  <div className="muted small">
                    Note: modification/annulation bloquées pour “terminée” et “annulée”.
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

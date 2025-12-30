// src/SecretaireSalles.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SecretaireHome.css";
import "./SecretaireSalles.css";
import { LuHistory } from "react-icons/lu";

import neohealthLogo from "./assets/neohealth-logo.jpg";

import {
  LuLayoutDashboard,
  LuUsers,
  LuCalendarCheck,
  LuBuilding2,
  LuLogOut,
} from "react-icons/lu";

import {
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiUsers,
  FiCheck,
} from "react-icons/fi";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function ymd(d = new Date()) {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SecretaireSalles() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("authToken");

  // NAV
  const goToHome = () => navigate("/secretaire/home");
  const goToPatients = () => navigate("/secretaire/patients");
  const goToAgenda = () => navigate("/secretaire/rendezvous");
  const goToSalles = () => navigate("/secretaire/salles");
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // filtres
  const [query, setQuery] = useState("");
  const [date, setDate] = useState(ymd());
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");

  // data
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [errorRooms, setErrorRooms] = useState("");

  // réservation (panel droit)
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [motif, setMotif] = useState("");

  const headersAuth = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const headersJson = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchAvailableRooms = async () => {
    setLoadingRooms(true);
    setErrorRooms("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/salles/available?date=${date}&start=${start}&end=${end}`,
        { headers: headersAuth }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur chargement salles");

      setRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErrorRooms(e.message || "Erreur chargement salles");
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchAvailableRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, start, end]);

  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => {
      const name = (r.name || "").toLowerCase();
      const type = (r.type || "").toLowerCase();
      const desc = (r.description || "").toLowerCase();
      return name.includes(q) || type.includes(q) || desc.includes(q);
    });
  }, [rooms, query]);

  const reserveSelected = async () => {
    if (!selectedRoom) {
      alert("Sélectionnez une salle d’abord.");
      return;
    }
    if (!date || !start || !end) {
      alert("Veuillez choisir date + début + fin.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/salles/reservations`, {
        method: "POST",
        headers: headersJson,
        body: JSON.stringify({
          salleId: selectedRoom._id,
          date,
          start,
          end,
          motif,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Erreur réservation");
        return;
      }

      alert("Réservation confirmée !");
      setMotif("");
      setSelectedRoom(null);

      // refresh dispo
      await fetchAvailableRooms();
    } catch (e) {
      console.error(e);
      alert("Erreur serveur.");
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
            <div className="neo-header-icon"><span>🏢</span></div>
            <div>
              <h1 className="neo-header-title">Salles & Blocs</h1>
              <p className="neo-header-subtitle">Salles disponibles + réservation</p>
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
          {/* ===== BARRE (comme Patients) ===== */}
          <div className="salles-toolbar">
            <div className="salles-search">
              <FiSearch className="salles-search-ico" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une salle par nom, type ou description..."
              />
            </div>

            <div className="salles-actions">
              <div className="salles-inline">
                <FiCalendar />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="salles-inline">
                <FiClock />
                <input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>

              <div className="salles-inline">
                <FiClock />
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>

              <button className="salles-btn" onClick={fetchAvailableRooms} type="button">
                <FiRefreshCw />
                Actualiser
              </button>
            </div>
          </div>

          {errorRooms ? <div className="neo-alert neo-alert-pad">{errorRooms}</div> : null}

          {/* ===== 2 COLONNES : CARTES + FORMULAIRE ===== */}
          <section className="salles-layout">
            {/* LEFT: cards */}
            <div className="salles-left">
              {loadingRooms ? (
                <div className="neo-loading">Chargement...</div>
              ) : filteredRooms.length === 0 ? (
                <div className="neo-empty salles-empty">
                  Aucune salle disponible pour ce créneau.
                </div>
              ) : (
                <div className="salles-cards">
                  {filteredRooms.map((r) => {
                    const isSel = selectedRoom?._id === r._id;
                    return (
                      <div
                        key={r._id}
                        className={`salle-card ${isSel ? "selected" : ""}`}
                        onClick={() => setSelectedRoom(r)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="salle-card-head">
                          <div className="salle-avatar">
                            {(r.name || "S").slice(0, 1).toUpperCase()}
                          </div>

                          <div className="salle-meta">
                            <div className="salle-name">{r.name}</div>
                            <div className="salle-sub">
                              {r.type || "Salle"} • Capacité {r.capacity || 0}
                            </div>
                          </div>

                          <div className="salle-status">
                            <span className="salle-dot" />
                            <span>Disponible</span>
                          </div>
                        </div>

                        <div className="salle-card-body">
                          <div className="salle-row">
                            <FiUsers />
                            <span>{r.capacity || 0} places</span>
                          </div>

                          <div className="salle-equip">
                            {Array.isArray(r.equipements) && r.equipements.length > 0 ? (
                              r.equipements.slice(0, 4).map((e) => (
                                <span className="chip" key={e._id || `${e.name}-${e.quantity}`}>
                                  {e.name} ×{e.quantity}
                                </span>
                              ))
                            ) : (
                              <span className="chip muted">Aucun équipement</span>
                            )}
                            {Array.isArray(r.equipements) && r.equipements.length > 4 ? (
                              <span className="chip muted">+{r.equipements.length - 4}</span>
                            ) : null}
                          </div>
                        </div>

                        <div className="salle-card-foot">
                          <div className="salle-foot-left">
                            {isSel ? <span className="badge-sel">Sélectionnée</span> : null}
                          </div>
                          <button
                            type="button"
                            className="mini-reserve"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setSelectedRoom(r);
                            }}
                          >
                            Choisir
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: form */}
            <aside className="salles-right">
              <div className="reserve-panel">
                <div className="reserve-panel-head">
                  <div className="reserve-icon">+</div>
                  <div>
                    <h3>Réserver une salle</h3>
                    <p>Remplir puis confirmer</p>
                  </div>
                </div>

                <div className="reserve-block">
                  <div className="reserve-kv">
                    <span>Date</span>
                    <b>{date}</b>
                  </div>
                  <div className="reserve-kv">
                    <span>Créneau</span>
                    <b>{start} → {end}</b>
                  </div>
                </div>

                <div className="reserve-picked">
                  <div className="label">Salle sélectionnée</div>
                  <div className="value">
                    {selectedRoom ? `${selectedRoom.name} (${selectedRoom.type || "Salle"})` : "Aucune"}
                  </div>
                </div>

                <label className="neo-label">Motif</label>
                <input
                  className="neo-input"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Ex: TP, réunion, maintenance..."
                />

                <button className="neo-btn-primary reserve-submit" onClick={reserveSelected} type="button">
                  <FiCheck />
                  Confirmer la réservation
                </button>

                <div className="reserve-help">
                  Conseil: sélectionne une salle à gauche, puis confirme.
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

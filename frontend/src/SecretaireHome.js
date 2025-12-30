// src/SecretaireHome.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SecretaireHome.css";
import neohealthLogo from "./assets/neohealth-logo.jpg";
import { LuHistory } from "react-icons/lu";

// 📊 Recharts
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

import {
  LuLayoutDashboard,
  LuUsers,
  LuCalendarCheck,
  LuBuilding2,
  LuLogOut,
} from "react-icons/lu";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const AUTO_REFRESH_MS = 15000;

export default function SecretaireHome() {
  const navigate = useNavigate();
  const location = useLocation();

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

  // data
  const [rdvToday, setRdvToday] = useState([]);
  const [nombrePatients, setNombrePatients] = useState(0);
  const [nombreRdvAujourdHui, setNombreRdvAujourdHui] = useState(0);
  const [rdvParMois, setRdvParMois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const abortRef = useRef(null);

  const fetchDashboard = useCallback(
    async ({ soft = false } = {}) => {
      if (soft) setRefreshing(true);
      else setLoading(true);

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const token = localStorage.getItem("authToken");

        const res = await fetch(`${API_BASE_URL}/secretaire/dashboard`, {
          credentials: "include",
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (res.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        if (!res.ok) {
          const t = await res.text();
          throw new Error(`Dashboard error ${res.status}: ${t}`);
        }

        const data = await res.json();

        setNombrePatients(data?.nombrePatients || 0);
        setNombreRdvAujourdHui(data?.nombreRdvAujourdHui || 0);
        setRdvToday(Array.isArray(data?.rdvToday) ? data.rdvToday : []);
        setRdvParMois(Array.isArray(data?.rdvParMois) ? data.rdvParMois : []);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Erreur dashboard secrétaire :", err);
      } finally {
        if (soft) setRefreshing(false);
        else setLoading(false);
      }
    },
    [navigate]
  );

  // first load + polling
  useEffect(() => {
    fetchDashboard({ soft: false });

    const id = setInterval(() => {
      fetchDashboard({ soft: true });
    }, AUTO_REFRESH_MS);

    return () => {
      clearInterval(id);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchDashboard]);

  // refresh when focus / tab visible
  useEffect(() => {
    const onFocus = () => fetchDashboard({ soft: true });
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchDashboard({ soft: true });
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchDashboard]);

  // refresh when arriving on route
  useEffect(() => {
    if (location.pathname === "/secretaire/home") fetchDashboard({ soft: true });
  }, [location.pathname, fetchDashboard]);

  const totalRdvMois = useMemo(
    () => rdvParMois.reduce((sum, m) => sum + (m.rdv || 0), 0),
    [rdvParMois]
  );

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
          <div
            className={`neo-nav-item ${isActive("/secretaire/home") ? "active" : ""}`}
            onClick={goToHome}
          >
            <LuLayoutDashboard className="neo-nav-ico" />
            <span>Tableau de Bord</span>
          </div>

          <div
            className={`neo-nav-item ${isActive("/secretaire/patients") ? "active" : ""}`}
            onClick={goToPatients}
          >
            <LuUsers className="neo-nav-ico" />
            <span>Gestion Patients</span>
          </div>

          <div
            className={`neo-nav-item ${isActive("/secretaire/rendezvous") ? "active" : ""}`}
            onClick={goToAgenda}
          >
            <LuCalendarCheck className="neo-nav-ico" />
            <span>Rendez-vous</span>
          </div>

          <div className="neo-nav-section">ADMINISTRATION</div>

          <div
            className={`neo-nav-item ${isActive("/secretaire/salles") ? "active" : ""}`}
            onClick={goToSalles}
          >
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
        <section className="neo-header neo-header-full">
          <div className="neo-header-left">
            <div className="neo-header-icon">
              <span>📊</span>
            </div>
            <div>
              <h1 className="neo-header-title">Tableau de Bord Médical</h1>
              <p className="neo-header-subtitle">
                Vue d’ensemble en temps réel{refreshing ? " • mise à jour..." : ""}
              </p>
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
          {/* KPI cards */}
          <section className="neo-kpis neo-kpis-3">
            <div className="neo-kpi-card">
              <div className="neo-kpi-top">
                <div className="neo-kpi-icon icon-blue">
                  <span className="neo-emoji">👤</span>
                </div>
                <div className="neo-kpi-pill pill-green">+12.5%</div>
              </div>
              <div className="neo-kpi-value">{loading ? "..." : nombrePatients}</div>
              <div className="neo-kpi-label">Patients</div>
              <div className="neo-kpi-sub">Mise à jour temps réel</div>
            </div>

            <div className="neo-kpi-card">
              <div className="neo-kpi-top">
                <div className="neo-kpi-icon icon-green">
                  <span className="neo-emoji">📅</span>
                </div>
                <div className="neo-kpi-pill pill-green">+8.2%</div>
              </div>
              <div className="neo-kpi-value">{loading ? "..." : nombreRdvAujourdHui}</div>
              <div className="neo-kpi-label">Rendez-vous aujourd’hui</div>
              <div className="neo-kpi-sub">Suivi du planning</div>
            </div>

            <div className="neo-kpi-card">
              <div className="neo-kpi-top">
                <div className="neo-kpi-icon icon-purple">
                  <span className="neo-emoji">📈</span>
                </div>
                <div className="neo-kpi-pill pill-gray">Mois</div>
              </div>
              <div className="neo-kpi-value">{loading ? "..." : totalRdvMois}</div>
              <div className="neo-kpi-label">Total rendez-vous (mois)</div>
              <div className="neo-kpi-sub">Somme des rendez-vous mensuels</div>
            </div>
          </section>

          {/* ✅ Admissions Patients : plein écran */}
          <section className="neo-grid neo-grid-1col">
            <div className="neo-card">
              <div className="neo-card-head">
                <div>
                  <h2 className="neo-card-title">Admissions Patients</h2>
                  <p className="neo-card-sub">Nouveaux patients / RDV par mois</p>
                </div>
              </div>

              <div className="neo-card-body">
                {rdvParMois.length === 0 ? (
                  <p className="neo-empty">
                    {loading ? "Chargement..." : "Aucune donnée statistique pour le moment."}
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={rdvParMois}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {/* ✅ Patients en rouge */}
                      <Bar dataKey="patients" name="Patients" fill="#ff4d4f" />
                      <Bar dataKey="rdv" name="Rendez-vous" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>

          {/* ✅ Table RDV : enlever Motif + Salle */}
          <div className="neo-card">
            <div className="neo-card-head">
              <div>
                <h2 className="neo-card-title">Rendez-vous d’aujourd’hui</h2>
                <p className="neo-card-sub">Liste des consultations planifiées</p>
              </div>
            </div>

            <div className="neo-card-body">
              <div className="neo-table-wrap">
                <table className="neo-table">
                  <thead>
                    <tr>
                      <th>Heure</th>
                      <th>Patient</th>
                      <th>Statut</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!loading && rdvToday.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: "center", padding: "14px" }}>
                          Aucun rendez-vous prévu pour aujourd&apos;hui.
                        </td>
                      </tr>
                    )}

                    {rdvToday.map((rdv) => (
                      <tr key={rdv._id || rdv.id}>
                        <td>{rdv.heure}</td>
                        <td>{rdv.patient}</td>
                        <td>
                          <span
                            className={`neo-badge badge-${(rdv.statut || "")
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {rdv.statut}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {loading && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: "center", padding: "14px" }}>
                          Chargement...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

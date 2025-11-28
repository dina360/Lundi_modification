// src/Dashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

import "./Dashboard.css";
import "./Home.css";       // layout + sidebar
import Sidebar from "./Sidebar";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [globalStats, setGlobalStats] = useState({});
  const [patientsPerMonth, setPatientsPerMonth] = useState([]);
  const [rdvWeek, setRdvWeek] = useState([]);
  const [medecinsActivity, setMedecinsActivity] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  // état pour ouvrir/fermer le sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [global, monthly, weekly, medActivity, recent] = await Promise.all([
          axios.get("http://localhost:5000/api/dashboard/advanced/global-stats", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:5000/api/dashboard/advanced/patients-per-month", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:5000/api/dashboard/advanced/rdv-week", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:5000/api/dashboard/advanced/medecins-activity", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:5000/api/dashboard/advanced/recent-activities", {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        setGlobalStats(global.data);
        setPatientsPerMonth(monthly.data);
        setRdvWeek(weekly.data);
        setMedecinsActivity(medActivity.data);
        setRecentActivities(recent.data);

      } catch (err) {
        console.error("Erreur dashboard avancé:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-container">
          <div className="medical-spinner">
            <div className="pulse-animation"></div>
          </div>
          <h3>Chargement des données médicales</h3>
          <p>Initialisation du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* 🔹 Sidebar réutilisable */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="dashboard"
      />

      {/* 🔹 Contenu principal qui se décale selon l’état du sidebar */}
      <div className={`main-content ${sidebarOpen ? "content-shifted" : ""}`}>
        <div className="medical-dashboard">
          {/* HEADER */}
          <header className="dashboard-header">
            <div className="header-main">
              <div className="header-title">
                <h1>Tableau de Bord Médical</h1>
                <p>Centre Hospitalier NeoHealth - Vue d'ensemble en temps réel</p>
              </div>
              <div className="header-info">
                <div className="time-display">
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="status-indicator">
                  <span className="status-dot"></span>
                  Système en ligne
                </div>
              </div>
            </div>
          </header>

          {/* KPI CARDS */}
          <section className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <div className="kpi-icon patient-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="kpi-trend positive">+12.5%</div>
              </div>
              <div className="kpi-content">
                <div className="kpi-value">{globalStats.totalPatients ?? 0}</div>
                <div className="kpi-label">Patients enregistrés</div>
              </div>
              <div className="kpi-footer">
                <span className="kpi-detail">Mise à jour: Maintenant</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <div className="kpi-icon doctor-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 11.5v5M9.5 14h5M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="kpi-trend neutral">±0%</div>
              </div>
              <div className="kpi-content">
                <div className="kpi-value">{globalStats.totalMedecins ?? 0}</div>
                <div className="kpi-label">Médecins actifs</div>
              </div>
              <div className="kpi-footer">
                <span className="kpi-detail">Taux d'occupation: 78%</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <div className="kpi-icon appointment-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="kpi-trend positive">+8.2%</div>
              </div>
              <div className="kpi-content">
                <div className="kpi-value">{globalStats.appointmentsToday ?? 0}</div>
                <div className="kpi-label">Rendez-vous aujourd'hui</div>
              </div>
              <div className="kpi-footer">
                <span className="kpi-detail">Prochain RDV: 08:30</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <div className="kpi-icon staff-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="kpi-trend positive">+3.1%</div>
              </div>
              <div className="kpi-content">
                <div className="kpi-value">{globalStats.totalSecretaires ?? 0}</div>
                <div className="kpi-label">Personnel administratif</div>
              </div>
              <div className="kpi-footer">
                <span className="kpi-detail">Disponibilité: 92%</span>
              </div>
            </div>
          </section>

          {/* MAIN DASHBOARD GRID */}
          <div className="dashboard-grid">
            {/* LEFT COLUMN - ANALYTICS */}
            <div className="analytics-column">
              {/* Patients Growth Chart */}
              <div className="analytics-card">
                <div className="card-header">
                  <h3>Évolution des Admissions Patients</h3>
                  <div className="card-actions">
                    <button className="btn-period active">Mensuel</button>
                    <button className="btn-period">Trimestriel</button>
                    <button className="btn-period">Annuel</button>
                  </div>
                </div>
                <div className="chart-wrapper">
                  <Line
                    data={{
                      labels: [
                        "Jan",
                        "Fév",
                        "Mar",
                        "Avr",
                        "Mai",
                        "Jun",
                        "Jul",
                        "Août",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Déc",
                      ],
                      datasets: [
                        {
                          label: "Nouveaux patients",
                          data: patientsPerMonth,
                          borderColor: "#2563eb",
                          backgroundColor: "rgba(37, 99, 235, 0.1)",
                          borderWidth: 3,
                          tension: 0.4,
                          fill: true,
                          pointBackgroundColor: "#2563eb",
                          pointBorderColor: "#ffffff",
                          pointBorderWidth: 2,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: "#1e293b",
                          titleColor: "#f8fafc",
                          bodyColor: "#f8fafc",
                          borderColor: "#334155",
                          borderWidth: 1,
                          cornerRadius: 8,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: "rgba(226, 232, 240, 0.5)",
                            drawBorder: false,
                          },
                          ticks: {
                            color: "#64748b",
                          },
                        },
                        x: {
                          grid: { display: false },
                          ticks: {
                            color: "#64748b",
                          },
                        },
                      },
                      interaction: {
                        intersect: false,
                        mode: "index",
                      },
                    }}
                  />
                </div>
              </div>

              {/* Doctors Performance */}
              <div className="analytics-card">
                <div className="card-header">
                  <h3>Performance des Médecins</h3>
                  <div className="card-subtitle">Consultations réalisées</div>
                </div>
                <div className="chart-wrapper">
                  {medecinsActivity.length > 0 ? (
                    <Bar
                      data={{
                        labels: medecinsActivity.map((m) => m.name),
                        datasets: [
                          {
                            label: "Consultations",
                            data: medecinsActivity.map((m) => m.totalConsultations),
                            backgroundColor: "rgba(139, 92, 246, 0.8)",
                            borderRadius: 6,
                            borderSkipped: false,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: "#1e293b",
                            titleColor: "#f8fafc",
                            bodyColor: "#f8fafc",
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: "rgba(226, 232, 240, 0.5)",
                              drawBorder: false,
                            },
                            ticks: {
                              color: "#64748b",
                            },
                          },
                          x: {
                            grid: { display: false },
                            ticks: {
                              color: "#64748b",
                              maxRotation: 45,
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <p>Aucune donnée d'activité disponible</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - ACTIVITIES */}
            <div className="activities-column">
              {/* Weekly Overview */}
              <div className="analytics-card">
                <div className="card-header">
                  <h3>Activité Hebdomadaire</h3>
                  <div className="card-subtitle">Semaine en cours</div>
                </div>
                <div className="mini-charts">
                  <div className="mini-chart-container">
                    <div className="mini-chart-header">
                      <span>Rendez-vous par jour</span>
                    </div>
                    <div className="chart-wrapper-small">
                      <Bar
                        data={{
                          labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
                          datasets: [
                            {
                              data: rdvWeek,
                              backgroundColor: "rgba(16, 185, 129, 0.8)",
                              borderRadius: 4,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                        }}
                      />
                    </div>
                  </div>
                  <div className="mini-chart-container">
                    <div className="mini-chart-header">
                      <span>Répartition du personnel</span>
                    </div>
                    <div className="chart-wrapper-small">
                      <Doughnut
                        data={{
                          labels: ["Médecins", "Secrétaires"],
                          datasets: [
                            {
                              data: [
                                globalStats.totalMedecins || 0,
                                globalStats.totalSecretaires || 0,
                              ],
                              backgroundColor: ["#2563eb", "#8b5cf6"],
                              borderWidth: 3,
                              borderColor: "#ffffff",
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                padding: 15,
                                usePointStyle: true,
                              },
                            },
                          },
                          cutout: "65%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Patient Activity */}
              <div className="analytics-card">
                <div className="card-header">
                  <h3>Activité Patients Récente</h3>
                  <div className="card-subtitle">Dernières 24 heures</div>
                </div>
                <div className="activity-feed">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((patient) => (
                      <div key={patient._id} className="activity-item">
                        <div className="activity-indicator"></div>
                        <div className="activity-avatar">
                          {patient.name?.charAt(0).toUpperCase() || "P"}
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">
                            {patient.name || "Patient anonyme"}
                          </div>
                          <div className="activity-description">
                            Dossier mis à jour
                          </div>
                        </div>
                        <div className="activity-time">
                          {new Date(patient.updatedAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">👥</div>
                      <p>Aucune activité récente</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 🔻 Partie Alertes supprimée comme demandé */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

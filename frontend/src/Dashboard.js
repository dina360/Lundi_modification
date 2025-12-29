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
  Filler,
} from "chart.js";
import {
  FiUsers,
  FiUserPlus,
  FiCalendar,
  FiBriefcase,
  FiActivity,
  FiTrendingUp,
  FiClock,
  FiEye,
  FiChevronRight,
  FiBarChart2,
  FiPieChart,
  FiGlobe,
} from "react-icons/fi";

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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [global, monthly, weekly, medActivity, recent] = await Promise.all([
          axios.get("http://localhost:5000/api/dashboard/advanced/global-stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            "http://localhost:5000/api/dashboard/advanced/patients-per-month",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get("http://localhost:5000/api/dashboard/advanced/rdv-week", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            "http://localhost:5000/api/dashboard/advanced/medecins-activity",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            "http://localhost:5000/api/dashboard/advanced/recent-activities",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setGlobalStats(global.data || {});
        setPatientsPerMonth(Array.isArray(monthly.data) ? monthly.data : []);
        setRdvWeek(Array.isArray(weekly.data) ? weekly.data : []);
        setMedecinsActivity(
          Array.isArray(medActivity.data) ? medActivity.data : []
        );
        setRecentActivities(
          Array.isArray(recent.data) ? recent.data : []
        );
      } catch (err) {
        console.error("Erreur dashboard avancé:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Chargement des données médicales
          </h3>
          <p className="text-gray-600">Initialisation du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Sécuriser les données pour les graphiques
  const monthlyPatientsData = Array.isArray(patientsPerMonth)
    ? [...patientsPerMonth]
    : [];
  while (monthlyPatientsData.length < 12) {
    monthlyPatientsData.push(0);
  }

  const rdvWeekData = Array.isArray(rdvWeek) ? [...rdvWeek] : [];
  while (rdvWeekData.length < 7) {
    rdvWeekData.push(0);
  }

  const safeMedecins = Array.isArray(medecinsActivity)
    ? medecinsActivity.filter((m) => m && m.name)
    : [];

  // 📊 KPI calculées à partir des vraies données
  const totalPatients = globalStats.totalPatients || 0;
  const totalMedecins = globalStats.totalMedecins || 0;
  const totalSecretaires = globalStats.totalSecretaires || 0;
  const totalStaff = totalMedecins + totalSecretaires;

  const todayAppointments = globalStats.appointmentsToday || 0;
  const rdvThisWeek = rdvWeekData.reduce(
    (sum, v) => sum + (typeof v === "number" ? v : 0),
    0
  );

  const now = new Date();
  const currentMonthIndex = now.getMonth(); // 0–11
  const patientsThisMonth = monthlyPatientsData[currentMonthIndex] || 0;
  const prevMonthIndex = (currentMonthIndex - 1 + 12) % 12;
  const patientsPrevMonth = monthlyPatientsData[prevMonthIndex] || 0;

  let patientsGrowth = null;
  if (patientsPrevMonth > 0) {
    patientsGrowth = (
      ((patientsThisMonth - patientsPrevMonth) / patientsPrevMonth) *
      100
    ).toFixed(1);
  }

  const medecinsBarData = {
    labels: safeMedecins.map((m) => m.name),
    datasets: [
      {
        label: "Consultations",
        data: safeMedecins.map((m) => m.totalConsultations || 0),
        backgroundColor: "rgba(30, 64, 175, 0.8)",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="dashboard"
      />

      <div
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-800 via-royalblue-900 to-blue-900 text-white p-8 -mt-8 -mx-8 mb-8 shadow-2xl border-b-4 border-gold-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <FiActivity className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Tableau de Bord Administrateur
                  </h1>
                  <p className="text-blue-100 mt-2 text-lg">
                    Vue d&apos;ensemble de l&apos;activité de NeoHealth
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right mr-6">
                <div className="text-blue-200 text-sm">
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="text-white font-semibold flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Système en ligne
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Patients Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FiUsers className="text-2xl text-blue-900" />
                </div>
                {patientsGrowth !== null ? (
                  <span className="flex items-center text-green-600 font-bold text-sm">
                    <FiTrendingUp className="mr-1" /> {patientsGrowth}% ce mois
                  </span>
                ) : (
                  <span className="text-gray-500 text-xs">
                    Suivi démarré ce mois
                  </span>
                )}
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-gray-900">
                  {totalPatients}
                </div>
                <div className="text-gray-600 font-medium">
                  Patients enregistrés
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Nouveaux ce mois :{" "}
                <span className="font-semibold">{patientsThisMonth}</span>
              </div>
            </div>

            {/* Médecins Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FiBriefcase className="text-2xl text-purple-900" />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-gray-900">
                  {totalMedecins}
                </div>
                <div className="text-gray-600 font-medium">Médecins actifs</div>
              </div>
              <div className="text-sm text-gray-500">
                Inclut tous les comptes avec le rôle « médecin »
              </div>
            </div>

            {/* RDV Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FiCalendar className="text-2xl text-green-900" />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-gray-900">
                  {todayAppointments}
                </div>
                <div className="text-gray-600 font-medium">
                  Rendez-vous aujourd&apos;hui
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Sur la semaine :{" "}
                <span className="font-semibold">{rdvThisWeek}</span> RDV planifiés
              </div>
            </div>

            {/* Personnel Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <FiUserPlus className="text-2xl text-orange-900" />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-gray-900">
                  {totalStaff}
                </div>
                <div className="text-gray-600 font-medium">
                  Personnel médical & administratif
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Médecins :{" "}
                <span className="font-semibold">{totalMedecins}</span> ·
                Secrétaires :{" "}
                <span className="font-semibold">{totalSecretaires}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Charts */}
            <div className="space-y-8">
              {/* Évolution Patients */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Admissions Patients
                    </h3>
                    <p className="text-gray-600">
                      Nouveaux patients par mois (année courante)
                    </p>
                  </div>
                </div>
                <div className="h-80">
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
                          data: monthlyPatientsData,
                          borderColor: "#1e40af",
                          backgroundColor: "rgba(30, 64, 175, 0.1)",
                          borderWidth: 3,
                          tension: 0.4,
                          fill: true,
                          pointBackgroundColor: "#1e40af",
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
                          grid: { color: "rgba(226, 232, 240, 0.5)" },
                          ticks: { color: "#64748b" },
                        },
                        x: {
                          grid: { display: false },
                          ticks: { color: "#64748b" },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Performance Médecins */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Activité estimée des Médecins
                    </h3>
                    <p className="text-gray-600">
                      Volume de consultations (valeurs simulées pour le moment)
                    </p>
                  </div>
                  <FiBarChart2 className="text-2xl text-blue-900" />
                </div>
                <div className="h-80">
                  {safeMedecins.length > 0 ? (
                    <Bar
                      data={medecinsBarData}
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
                            grid: { color: "rgba(226, 232, 240, 0.5)" },
                            ticks: { color: "#64748b" },
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
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <FiBarChart2 className="text-5xl mb-4" />
                      <p className="text-lg font-medium">
                        Aucune donnée d&apos;activité disponible
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Activities */}
            <div className="space-y-8">
              {/* Activité Hebdomadaire */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Activité Hebdomadaire
                    </h3>
                    <p className="text-gray-600">Répartition des RDV</p>
                  </div>
                  <FiCalendar className="text-2xl text-blue-900" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* RDV par jour */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-800">
                        Rendez-vous par jour
                      </h4>
                      <FiEye className="text-gray-500" />
                    </div>
                    <div className="h-48">
                      <Bar
                        data={{
                          labels: [
                            "Lun",
                            "Mar",
                            "Mer",
                            "Jeu",
                            "Ven",
                            "Sam",
                            "Dim",
                          ],
                          datasets: [
                            {
                              data: rdvWeekData,
                              backgroundColor: "rgba(16, 185, 129, 0.8)",
                              borderRadius: 4,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { display: false },
                            x: { grid: { display: false } },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Répartition personnel */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-800">
                        Répartition du personnel
                      </h4>
                      <FiPieChart className="text-gray-500" />
                    </div>
                    <div className="h-48">
                      <Doughnut
                        data={{
                          labels: ["Médecins", "Secrétaires"],
                          datasets: [
                            {
                              data: [totalMedecins, totalSecretaires],
                              backgroundColor: ["#1e40af", "#7c3aed"],
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
                              labels: { padding: 15 },
                            },
                          },
                          cutout: "65%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Activité Récente */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Activité Patients Récente
                    </h3>
                    <p className="text-gray-600">
                      Dernières mises à jour de dossiers
                    </p>
                  </div>
                  <FiClock className="text-2xl text-blue-900" />
                </div>

                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((patient, index) => (
                      <div
                        key={patient._id || index}
                        className="flex items-center p-4 hover:bg-blue-50 rounded-xl transition-colors duration-200 group"
                      >
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-900 font-bold text-lg border-2 border-white shadow-lg">
                            {patient.name
                              ? patient.name.charAt(0).toUpperCase()
                              : "P"}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900">
                              {patient.name || "Patient anonyme"}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {patient.updatedAt
                                ? new Date(
                                    patient.updatedAt
                                  ).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "--:--"}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">
                            Dossier médical mis à jour
                          </p>
                        </div>
                        <FiChevronRight className="text-gray-400 group-hover:text-blue-900 ml-4" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FiGlobe className="text-5xl mx-auto mb-4" />
                      <p className="text-lg font-medium">
                        Aucune activité récente
                      </p>
                      <p className="text-sm mt-2">
                        Les dernières modifications de dossiers apparaîtront
                        ici.
                      </p>
                    </div>
                  )}
                </div>

                {recentActivities.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button className="w-full py-3 bg-blue-50 text-blue-900 font-medium rounded-xl hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center">
                      Voir toutes les activités
                      <FiChevronRight className="ml-2" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

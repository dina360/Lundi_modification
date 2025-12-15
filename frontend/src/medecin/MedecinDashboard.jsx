import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { FiUser, FiCalendar, FiClock, FiFileText, FiMessageSquare } from "react-icons/fi";
import MedecinChat from "./MedecinChat";

function MedecinDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    consultationsThisMonth: 0,
    totalConsultations: 0,
  });
  const [monthlyConsultations, setMonthlyConsultations] = useState([]);
  const [weeklyRdv, setWeeklyRdv] = useState([]);
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [rdvsToday, setRdvsToday] = useState([]);
  const [nextRdv, setNextRdv] = useState(null); // ✅ Prochaine consultation d'aujourd'hui
  const [error, setError] = useState("");

  const medecin = JSON.parse(localStorage.getItem("medecin"));
  const token = localStorage.getItem("authToken");

  // 🔁 Charger les données du médecin
  useEffect(() => {
    if (!medecin || !medecin.id) return;

    const fetchStats = async () => {
      try {
        // Charger les RDV du médecin
        const rdvRes = await axios.get("http://localhost:5000/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const myRdvs = rdvRes.data.filter((r) => r.medecin._id === medecin.id);

        // 🔥 Filtrer les RDV du jour uniquement
        const today = new Date().toISOString().split("T")[0];
        const todayList = myRdvs.filter((r) => r.date.split("T")[0] === today);
        setRdvsToday(todayList);

        // 🔥 Prochaine consultation d'aujourd'hui (pas du futur)
        const futureToday = todayList
          .filter((r) => r.date >= new Date().toISOString())
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setNextRdv(futureToday[0] || null);

        // 🔥 Calcul des consultations du mois
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const consultationsThisMonth = myRdvs.filter((r) => {
          const date = new Date(r.date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;

        // Statistiques personnelles (maintenant dynamiques)
        setStats({
          totalPatients: todayList.length, // ✅ Patients vus aujourd'hui
          consultationsThisMonth,          // ✅ Réel nombre de consultations ce mois
          totalConsultations: myRdvs.length, // Total des RDV
        });

        // Graphiques
        setMonthlyConsultations([
          { name: "Jan", value: 10 },
          { name: "Fév", value: 15 },
          { name: "Mar", value: 12 },
          { name: "Avr", value: 18 },
          { name: "Mai", value: 22 },
          { name: "Jun", value: 19 },
          { name: "Jul", value: 25 },
          { name: "Aoû", value: 20 },
          { name: "Sep", value: 24 },
          { name: "Oct", value: 21 },
          { name: "Nov", value: 26 },
          { name: "Déc", value: 28 },
        ]);

        setWeeklyRdv([
          { name: "Lun", value: 3 },
          { name: "Mar", value: 5 },
          { name: "Mer", value: 2 },
          { name: "Jeu", value: 6 },
          { name: "Ven", value: 4 },
          { name: "Sam", value: 0 },
          { name: "Dim", value: 0 },
        ]);

        // 🔥 Afficher les 3 dernières consultations d'aujourd'hui
        setRecentConsultations(todayList.slice(0, 3)); // ✅ 3 consultations récentes

      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
        setError("Impossible de charger vos données.");
      }
    };

    fetchStats();
  }, [medecin, token]);

  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!medecin) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600">Erreur : Médecin non connecté</h2>
        <p>Reconnectez-vous pour accéder à votre profil.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bonjour {medecin.name.split(" ").pop()}</h1>
          <p className="text-gray-600 mt-2">Voici un aperçu de votre activité aujourd'hui.</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg p-6 transform transition hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Patients aujourd'hui</p>
                <p className="text-3xl font-bold">{rdvsToday.length}</p>
              </div>
              <div className="bg-blue-400 p-3 rounded-full">
                <FiUser size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg p-6 transform transition hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Rendez-vous du jour</p>
                <p className="text-3xl font-bold">{rdvsToday.length}</p>
              </div>
              <div className="bg-green-400 p-3 rounded-full">
                <FiCalendar size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg p-6 transform transition hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100">Prochaine consultation</p>
                <p className="text-xl font-bold">
                  {nextRdv
                    ? `${new Date(nextRdv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : "Aucune"}
                </p>
              </div>
              <div className="bg-amber-400 p-3 rounded-full">
                <FiClock size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-2xl shadow-lg p-6 transform transition hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Consultations ce mois</p>
                <p className="text-3xl font-bold">{stats.consultationsThisMonth}</p>
              </div>
              <div className="bg-purple-400 p-3 rounded-full">
                <FiFileText size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Consultations par mois</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyConsultations}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Rendez-vous cette semaine</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyRdv}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consultations récentes */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Consultations récentes</h2>
          {recentConsultations.length === 0 ? (
            <p className="text-gray-500">Aucune consultation aujourd'hui.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentConsultations.map((r) => (
                <div key={r._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-gray-800">{r.patient.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">
                    {r.notes || "Aucune note"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton flottant pour le chat */}
        <button
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-800 transition z-50 flex items-center justify-center"
          onClick={() => {
            // Tu peux ouvrir un modal ou une sidebar ici
            // Pour l'instant, on suppose que MedecinChat gère l'ouverture
          }}
        >
          <FiMessageSquare size={24} />
        </button>

        {/* ✅ Intégration du chat */}
        <MedecinChat />
      </div>
    </div>
  );
}

export default MedecinDashboard;
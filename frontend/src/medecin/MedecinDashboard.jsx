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
import { FiUser, FiCalendar, FiClock, FiFileText } from "react-icons/fi";

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
  const [nextRdv, setNextRdv] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  // 🔹 Charger le médecin depuis localStorage
  const medecinStr = localStorage.getItem("medecin");
  let medecin = null;

  try {
    if (medecinStr) {
      medecin = JSON.parse(medecinStr);
      if (!medecin.id && !medecin._id) {
        throw new Error("Objet médecin invalide");
      }
    }
  } catch (e) {
    console.error("Erreur parsing medecin:", e);
    medecin = null;
  }

  // 🔁 Charger les données du médecin
  useEffect(() => {
    if (!medecin || !medecin.id) {
      setError("Profil médecin introuvable. Reconnectez-vous.");
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // Charger les RDV du médecin
        const rdvRes = await axios.get("http://localhost:5000/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const myRdvs = rdvRes.data.filter((r) => r.medecin._id === medecin.id);

        // RDV du jour
        const today = new Date().toISOString().split("T")[0];
        const todayList = myRdvs.filter((r) => r.date.split("T")[0] === today);
        setRdvsToday(todayList);

        // Prochaine consultation
        const future = myRdvs
          .filter((r) => r.date >= new Date().toISOString())
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setNextRdv(future[0] || null);

        // Statistiques personnelles (à implémenter côté backend)
        // Pour l’instant, on simule les données
        setStats({
          totalPatients: todayList.length, // Exemple : patients vus aujourd'hui
          consultationsThisMonth: 15,      // Exemple
          totalConsultations: 120,         // Exemple
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

        setRecentConsultations(todayList.slice(0, 5)); // 5 dernières consultations

      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
        setError("Impossible de charger vos données.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [medecin, token]);

  if (loading) return <p className="p-4">Chargement...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!medecin) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600">Erreur : Médecin non connecté</h2>
        <p>Reconnectez-vous pour accéder à votre profil.</p>
      </div>
    );
  }

  // 🔸 Gestion du chemin de la photo
  const photoUrl = medecin?.photo && !medecin.photo.startsWith('http')
    ? `http://localhost:5000${medecin.photo}`
    : medecin?.photo || "https://via.placeholder.com/120";

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* TITRE */}
      <h1 className="text-3xl font-bold mb-2 text-blue-700">
        👋 Bienvenue {medecin?.name}
      </h1>
      <p className="text-gray-600 mb-6">
        Voici votre tableau de bord personnel.
      </p>

      {/* PHOTO + INFO MEDECIN */}
      <div className="bg-white shadow rounded p-6 flex items-center gap-6 mb-6">
        <img
          src={photoUrl}
          alt="Photo de profil"
          className="w-24 h-24 rounded-full border-2 border-blue-500"
        />
        <div>
          <p className="text-xl font-semibold">Dr. {medecin?.name}</p>
          <p className="text-gray-600">{medecin?.specialite || "Médecin Généraliste"}</p>
          <p className="text-gray-500">Email : {medecin?.email}</p>
        </div>
      </div>

      {/* CARTES STATISTIQUES PERSONNELLES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded p-6 flex items-center">
          <FiUser className="text-4xl text-blue-500 mr-4" />
          <div>
            <p className="text-gray-500">Patients aujourd'hui</p>
            <p className="text-2xl font-bold">{rdvsToday.length}</p>
          </div>
        </div>

        <div className="bg-white shadow rounded p-6 flex items-center">
          <FiCalendar className="text-4xl text-green-500 mr-4" />
          <div>
            <p className="text-gray-500">Rendez-vous du jour</p>
            <p className="text-2xl font-bold">{rdvsToday.length}</p>
          </div>
        </div>

        <div className="bg-white shadow rounded p-6 flex items-center">
          <FiClock className="text-4xl text-yellow-500 mr-4" />
          <div>
            <p className="text-gray-500">Prochaine consultation</p>
            <p className="text-lg font-bold">
              {nextRdv ? `${new Date(nextRdv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Aucune"}
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded p-6 flex items-center">
          <FiFileText className="text-4xl text-purple-500 mr-4" />
          <div>
            <p className="text-gray-500">Consultations ce mois</p>
            <p className="text-2xl font-bold">{stats.consultationsThisMonth}</p>
          </div>
        </div>
      </div>

      {/* CHARTS PERSONNELS */}
      <div className="bg-white shadow rounded p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Consultations par mois</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyConsultations}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white shadow rounded p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Rendez-vous cette semaine</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={weeklyRdv}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CONSULTATIONS RÉCENTES */}
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Consultations récentes</h2>
        {recentConsultations.length === 0 ? (
          <p className="text-gray-500">Aucune consultation aujourd'hui.</p>
        ) : (
          <ul>
            {recentConsultations.map((r) => (
              <li key={r._id} className="border-b py-3">
                <strong>{r.patient.name}</strong> — {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MedecinDashboard;
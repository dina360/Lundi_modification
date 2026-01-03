import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Recharts
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import MaladeLayout from "./components/MaladeLayout";
import "./malade.css";

export default function MaladeHome() {
  const navigate = useNavigate();
  const maladeId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    termines: 0,
    prochain: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!maladeId) return;

    setLoading(true);
    axios
      .get(`http://localhost:5000/api/malade/rdv/stats/${maladeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [maladeId, token]);

  const pieData = useMemo(
    () => [
      { name: "En attente", value: stats.enAttente },
      { name: "Terminés", value: stats.termines },
    ],
    [stats.enAttente, stats.termines]
  );

  const colors = ["#f59e0b", "#10b981"];

  return (
    <MaladeLayout
      title="📊 Dashboard du patient"
      subtitle="Statistiques rapides, prochain rendez-vous et répartition."
    >
      <div className="m-grid-3">
        <div className="m-card m-stat">
          <div className="label">Total des RDV</div>
          <div className="value">{loading ? "…" : stats.total}</div>
        </div>

        <div className="m-card m-stat" style={{ borderColor: "rgba(245,158,11,0.35)" }}>
          <div className="label">En attente</div>
          <div className="value">{loading ? "…" : stats.enAttente}</div>
        </div>

        <div className="m-card m-stat" style={{ borderColor: "rgba(16,185,129,0.35)" }}>
          <div className="label">Terminés</div>
          <div className="value">{loading ? "…" : stats.termines}</div>
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="m-card">
        <h3 style={{ margin: 0, fontSize: 16 }}>📅 Prochain rendez-vous</h3>

        <div style={{ marginTop: 10 }}>
          {stats.prochain ? (
            <>
              <div className="m-chip run">
                <span>📌</span>
                <span>
                  <strong>{stats.prochain.date}</strong> à <strong>{stats.prochain.time}</strong>
                </span>
              </div>

              <p className="m-muted" style={{ marginTop: 10 }}>
                Avec : <strong>{stats.prochain.doctorId?.name || "—"}</strong>
              </p>

              <div className="m-actions">
                <button className="m-btn primary" onClick={() => navigate("/malade/rendezvous/historique")}>
                  Voir l’historique
                </button>
                <button className="m-btn" onClick={() => navigate("/malade/rendezvous/demande")}>
                  Demander un autre RDV
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="m-muted">Aucun rendez-vous prévu.</p>
              <div className="m-actions">
                <button className="m-btn primary" onClick={() => navigate("/malade/rendezvous/demande")}>
                  Prendre un rendez-vous
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="m-card">
        <h3 style={{ margin: 0, fontSize: 16 }}>📈 Répartition des rendez-vous</h3>

        <div style={{ marginTop: 10, height: 320 }}>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={5}
                label={({ name, value }) => `${name} : ${value}`}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MaladeLayout>
  );
}
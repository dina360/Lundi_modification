// src/ListeRendezVous.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";

function formatLocalYMD(dateObj) {
  const d = new Date(dateObj);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatHHMM(dateObj) {
  const d = new Date(dateObj);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function ListeRendezVous({ refresh }) {
  const navigate = useNavigate();
  const todayStr = useMemo(() => formatLocalYMD(new Date()), []);

  const [date, setDate] = useState(todayStr);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDay = async (d) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/appointments/day?date=${d}`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      setError(e?.response?.data?.message || "Erreur chargement planning.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDay(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, refresh]);

  const deleteRdv = async (id) => {
    if (!window.confirm("Supprimer ce rendez-vous ?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      await loadDay(date);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      alert(e?.response?.data?.message || "Erreur suppression.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Planning du jour</h2>
          <p className="text-gray-600 mt-1">Affichage basé sur /api/appointments/day</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={() => loadDay(date)}
            className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800"
          >
            Actualiser
          </button>
        </div>
      </div>

      {error ? (
        <div className="m-6 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="p-10 text-center text-gray-700 font-semibold">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Heure</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Patient</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Motif</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Statut</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucun rendez-vous pour {date}.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const timeStr = formatHHMM(r.date);
                  const patientLabel = r.patient?.name
                    ? `${r.patient.name} (Dossier: ${r.patient.dossier || "-"})`
                    : "—";
                  return (
                    <tr key={r._id} className="hover:bg-blue-50/40">
                      <td className="px-6 py-4 font-semibold text-gray-900">{timeStr}</td>
                      <td className="px-6 py-4 text-gray-800">{patientLabel}</td>
                      <td className="px-6 py-4 text-gray-700">{r.notes || r.motif || "—"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-900 border-blue-200">
                          {r.status || "planifié"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteRdv(r._id)}
                          className="px-3 py-2 rounded-xl border-2 border-red-200 text-red-700 font-semibold hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

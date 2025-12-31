// src/FormulaireRendezVous.js
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

export default function FormulaireRendezVous({ selectedDate, onSuccess }) {
  const navigate = useNavigate();
  const todayStr = useMemo(() => formatLocalYMD(new Date()), []);

  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [errorPatients, setErrorPatients] = useState("");

  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState(selectedDate || "");
  const [time, setTime] = useState("");
  const [motif, setMotif] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDate(selectedDate || "");
  }, [selectedDate]);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      setErrorPatients("");
      try {
        const res = await api.get("/patients");
        setPatients(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        if (e?.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        setErrorPatients(e?.response?.data?.message || "Erreur chargement patients.");
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [navigate]);

  const submit = async () => {
    if (!patientId || !date || !time) {
      alert("Veuillez choisir un patient, une date et une heure.");
      return;
    }
    if (date < todayStr) {
      alert("Date passée interdite.");
      return;
    }

    setSubmitting(true);
    try {
      // ✅ même payload que SecretaireRendezVous
      const res = await api.post("/appointments", {
        patientId,
        date,
        time,
        motif,
        status: "planifié",
      });

      alert("Rendez-vous ajouté !");
      setMotif("");
      setTime("");
      setPatientId("");
      onSuccess?.(res.data);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      alert(e?.response?.data?.message || "Erreur lors de la création du rendez-vous.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900">Nouveau Rendez-vous</h2>
      <p className="text-gray-600 mt-1">Planifier une consultation</p>

      {errorPatients ? (
        <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
          {errorPatients}
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Patient</label>
          <select
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={loadingPatients || submitting}
          >
            <option value="">{loadingPatients ? "Chargement..." : "Sélectionner un patient"}</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} (Dossier: {p.dossier || "-"})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={date}
            min={todayStr}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
            disabled={submitting}
          />
          {selectedDate ? (
            <div className="text-xs text-gray-500 mt-2">
              Date sélectionnée depuis le calendrier : <b>{selectedDate}</b>
            </div>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Heure</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Motif</label>
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Ex : Consultation de contrôle..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-900 focus:ring-2 focus:ring-blue-200 min-h-[110px]"
            disabled={submitting}
          />
        </div>

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-60"
        >
          {submitting ? "Enregistrement..." : "+ Confirmer le rendez-vous"}
        </button>
      </div>
    </div>
  );
}

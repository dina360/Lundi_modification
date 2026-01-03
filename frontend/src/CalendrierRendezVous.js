// src/CalendrierRendezVous.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import { api } from "./api";

const MAX_APPOINTMENTS_PER_DAY = 8;

function formatLocalYMD(dateObj) {
  const d = new Date(dateObj);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendrierRendezVous({ onDateSelect, refresh }) {
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  const todayStr = useMemo(() => formatLocalYMD(new Date()), []);
  const [rangeInfo, setRangeInfo] = useState({ from: null, to: null });
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  const refreshRange = async (from, to) => {
    if (!from || !to) return;
    setError("");
    try {
      const res = await api.get(`/api/appointments?from=${from}&to=${to}`);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      setError(e?.response?.data?.message || "Erreur chargement rendez-vous.");
      setAppointments([]);
    }
  };

  useEffect(() => {
    if (rangeInfo.from && rangeInfo.to) refreshRange(rangeInfo.from, rangeInfo.to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeInfo.from, rangeInfo.to, refresh]);

  const countByDay = useMemo(() => {
    const map = {};
    for (const a of appointments) {
      const key = formatLocalYMD(a.date);
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [appointments]);

  const getDotClassOrNull = (dateStr) => {
    const count = countByDay[dateStr] || 0;
    if (count === 0) return null;
    if (dateStr < todayStr) return "dot-green";
    if (count >= MAX_APPOINTMENTS_PER_DAY) return "dot-red";
    return "dot-yellow";
  };

  // ✅ Injecter une pastille cliquable dans chaque cellule du calendrier
  const renderDots = () => {
    const apiCal = calendarRef.current?.getApi?.();
    const root = apiCal?.el;
    if (!root) return;

    const dayCells = root.querySelectorAll(".fc-daygrid-day");
    dayCells.forEach((cell) => {
      const dateStr = cell.getAttribute("data-date");
      if (!dateStr) return;

      const frame = cell.querySelector(".fc-daygrid-day-frame");
      if (!frame) return;

      const old = frame.querySelector(".day-dot-wrap");
      if (old) old.remove();

      const dotClass = getDotClassOrNull(dateStr);
      if (!dotClass) return;

      const wrap = document.createElement("div");
      wrap.className = "day-dot-wrap";

      const dot = document.createElement("div");
      dot.className = `day-dot ${dotClass}`;
      dot.title = "Sélectionner ce jour";
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        onDateSelect?.(dateStr); // ✅ renvoyer YYYY-MM-DD au parent
      });

      wrap.appendChild(dot);
      frame.appendChild(wrap);
    });
  };

  useEffect(() => {
    const t = setTimeout(() => renderDots(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countByDay]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Calendrier des Rendez-vous</h2>
        <p className="text-gray-600 mt-1">Clique sur une pastille pour choisir la date</p>

        {error ? (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex gap-4 text-sm">
          <span className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400" /> Places dispo</span>
          <span className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-red-500" /> Saturé</span>
          <span className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-green-500" /> Ancien</span>
        </div>
      </div>

      <div className="p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth",
          }}
          events={[]}
          dateClick={(info) => {
            onDateSelect?.(info.dateStr); // YYYY-MM-DD
          }}
          datesSet={(arg) => {
            const from = formatLocalYMD(arg.start);
            const endDate = new Date(arg.end);
            endDate.setDate(endDate.getDate() - 1);
            const to = formatLocalYMD(endDate);

            setRangeInfo({ from, to });
            setTimeout(() => renderDots(), 0);
          }}
        />
      </div>

      {/* ✅ styles internes minimalistes (si tu n’as pas de CSS) */}
      <style>{`
        .day-dot-wrap{
          position:absolute;
          bottom:6px;
          right:6px;
          z-index:5;
        }
        .day-dot{
          width:10px;
          height:10px;
          border-radius:999px;
          cursor:pointer;
          box-shadow:0 0 0 2px rgba(255,255,255,0.9);
        }
        .dot-yellow{ background:#facc15; }
        .dot-red{ background:#ef4444; }
        .dot-green{ background:#22c55e; }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { FiCalendar, FiClock, FiUser, FiAlertCircle } from "react-icons/fi";

function CalendrierRendezVous({ onDateSelect, refresh }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/appointments");
        const formatted = (res.data || []).map((app) => {
          const patientName =
            app.patient && app.patient.name
              ? app.patient.name
              : "Patient inconnu";

          const medecinName =
            app.medecin && app.medecin.name
              ? app.medecin.name
              : "Médecin inconnu";

          // Couleur basée sur le statut
          let backgroundColor = "#3b82f6"; // Bleu par défaut
          if (app.status === "annulé") backgroundColor = "#ef4444";
          if (app.status === "terminé") backgroundColor = "#10b981";
          if (app.status === "en_attente") backgroundColor = "#f59e0b";

          return {
            id: app._id,
            title: `${patientName}`,
            date: app.date,
            extendedProps: {
              medecin: medecinName,
              motif: app.motif || "Non spécifié",
              status: app.status || "planifié"
            },
            backgroundColor,
            borderColor: backgroundColor,
            textColor: "#ffffff",
          };
        });

        setEvents(formatted);
      } catch (err) {
        console.error("Erreur chargement RDV calendrier :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [refresh]);

  const handleEventClick = (clickInfo) => {
    alert(
      `Rendez-vous avec: ${clickInfo.event.title}\n` +
      `Médecin: ${clickInfo.event.extendedProps.medecin}\n` +
      `Motif: ${clickInfo.event.extendedProps.motif}\n` +
      `Statut: ${clickInfo.event.extendedProps.status}`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Calendrier des Rendez-vous</h3>
          <p className="text-gray-600">Visualisation et planification</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Planifié</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Terminé</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Annulé</span>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={frLocale}
          selectable={true}
          events={events}
          height="500px"
          dateClick={(info) => {
            onDateSelect(info.date);
            // Scroll vers le formulaire
            document.getElementById('formulaire-rdv').scrollIntoView({ behavior: 'smooth' });
          }}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          buttonText={{
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour"
          }}
          dayMaxEvents={3}
          eventDisplay="block"
        />
      </div>
    </div>
  );
}

export default CalendrierRendezVous;
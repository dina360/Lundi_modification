import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

function CalendrierRendezVous({ onDateSelect, refresh }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/appointments")
      .then(res => {
        const formatted = res.data.map(app => ({
          id: app._id,
          title: `${app.patient.name} avec Dr.${app.medecin.name}`,
          date: app.date
        }));
        setEvents(formatted);
      });
  }, [refresh]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      locale={frLocale}
      selectable={true}
      events={events}
      height="600px"
      dateClick={(info) => onDateSelect(info.date)}
    />
  );
}

export default CalendrierRendezVous;

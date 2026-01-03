import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api";

export default function SecretaireRooms() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [motif, setMotif] = useState("");

  const token = localStorage.getItem("authToken");

  /* =====================
     LOAD ROOMS
  ===================== */
  useEffect(() => {
    fetch(`${API_BASE_URL}/salles`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setRooms)
      .catch(console.error);
  }, [token]);

  /* =====================
     CONFIRM RESERVATION
  ===================== */
  const confirmReservation = async () => {
    if (!selectedRoom || !date || !startTime || !endTime) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    try {
      const res = await fetch(`${API_BASE_URL}/salles/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          salleId: selectedRoom._id,
          start: start.toISOString(),
          end: end.toISOString(),
          motif,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Réservation confirmée !");
      setSelectedRoom(null);
      setMotif("");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la réservation");
    }
  };

  return (
    <div className="sec-main">
      <h1>Gestion des Salles</h1>

      <div className="room-grid">
        {rooms.map(room => (
          <div key={room._id} className="room-card">
            <h3>{room.name}</h3>
            <p>Type : {room.type}</p>
            <p>Capacité : {room.capacity}</p>

            <button onClick={() => setSelectedRoom(room)}>
              Réserver
            </button>
          </div>
        ))}
      </div>

      {selectedRoom && (
        <div className="modal">
          <h2>Réserver {selectedRoom.name}</h2>

          <input type="date" min={new Date().toISOString().slice(0,10)} value={date} onChange={e => setDate(e.target.value)} />
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          <textarea placeholder="Motif" value={motif} onChange={e => setMotif(e.target.value)} />

          <button onClick={confirmReservation}>Confirmer réservation</button>
          <button onClick={() => setSelectedRoom(null)}>Annuler</button>
        </div>
      )}
    </div>
  );
}

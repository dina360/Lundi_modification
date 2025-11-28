import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCalendar, FiUser, FiClock, FiSearch } from 'react-icons/fi';
import "./RV.css";

function ListeRendezVous({ refresh }) {
  const [rdv, setRdv] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/appointments");
        setRdv(res.data);
      } catch (error) {
        console.error("Erreur chargement RDV:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [refresh]);

  const filteredRdv = rdv.filter(app => 
    app.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.medecin?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.motif?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmé': return 'status-confirmed';
      case 'annulé': return 'status-cancelled';
      case 'terminé': return 'status-completed';
      default: return 'status-pending';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  return (
    <div className="rdv-list-modern">
      <div className="list-header">
        <h3 className="list-title">Liste des rendez-vous</h3>
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un rendez-vous..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des rendez-vous...</p>
        </div>
      ) : filteredRdv.length === 0 ? (
        <div className="empty-state">
          <FiCalendar className="empty-icon" />
          <p>Aucun rendez-vous trouvé</p>
        </div>
      ) : (
        <div className="rdv-grid">
          {filteredRdv.map(app => {
            const { date, time } = formatDateTime(app.date);
            return (
              <div key={app._id} className="rdv-card">
                <div className="rdv-header">
                  <div className="rdv-date">
                    <FiCalendar className="date-icon" />
                    <span className="date-text">{date}</span>
                  </div>
                  <div className="rdv-time">
                    <FiClock className="time-icon" />
                    <span className="time-text">{time}</span>
                  </div>
                </div>

                <div className="rdv-content">
                  <div className="rdv-person">
                    <FiUser className="person-icon" />
                    <div className="person-info">
                      <span className="person-name">{app.patient?.name}</span>
                      <span className="person-role">Patient</span>
                    </div>
                  </div>

                  <div className="rdv-person">
                    <FiUser className="person-icon doctor" />
                    <div className="person-info">
                      <span className="person-name">Dr. {app.medecin?.name}</span>
                      <span className="person-role">Médecin</span>
                    </div>
                  </div>

                  {app.motif && (
                    <div className="rdv-motif">
                      <p className="motif-text">{app.motif}</p>
                    </div>
                  )}
                </div>

                <div className="rdv-footer">
                  <span className={`rdv-status ${getStatusColor(app.status)}`}>
                    {app.status || 'En attente'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ListeRendezVous;
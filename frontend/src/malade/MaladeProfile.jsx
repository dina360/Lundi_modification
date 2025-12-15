import React, { useEffect, useState } from "react";
import axios from "axios";
import MaladeLayout from "./components/MaladeLayout";
import "./malade.css";

export default function MaladeProfile() {
  const maladeId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!maladeId) return;

    setLoading(true);
    axios
      .get(`http://localhost:5000/api/malade/rdv/profile/${maladeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [maladeId, token]);

  return (
    <MaladeLayout title="👤 Mon Profil" subtitle="Informations du compte patient.">
      <div className="m-card">
        {loading ? (
          <p className="m-muted">Chargement...</p>
        ) : !profile ? (
          <p className="m-muted">Profil introuvable.</p>
        ) : (
          <div className="m-form">
            <div className="m-field">
              <label>Nom complet</label>
              <input value={profile.name || ""} readOnly />
            </div>

            <div className="m-field">
              <label>Email</label>
              <input value={profile.email || ""} readOnly />
            </div>
          </div>
        )}
      </div>
    </MaladeLayout>
  );
}

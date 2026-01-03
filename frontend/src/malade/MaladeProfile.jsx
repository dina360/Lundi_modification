import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MaladeLayout from "./components/MaladeLayout";
import "./malade.css";

import { MdMale, MdFemale } from "react-icons/md";
import { FiUser, FiMail, FiCopy, FiCheckCircle, FiCalendar, FiLogOut } from "react-icons/fi";

export default function MaladeProfile() {
  const navigate = useNavigate();

  const maladeId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Genre stocké localement (sans BD)
  const [localGender, setLocalGender] = useState(localStorage.getItem("patientGender") || "unknown");
  const [copied, setCopied] = useState(false);

useEffect(() => {
  if (!maladeId || !token) return;
  setLoading(true);
  axios
    .get(`http://localhost:5000/api/malade/rdv/profile/${maladeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setProfile(res.data))
    .catch((err) => console.error(err))
    .finally(() => setLoading(false));
}, [maladeId, token]);



  // Si API renvoie un gender un jour, il écrase le local (optionnel)
  const gender = useMemo(() => {
    const apiGender = profile?.gender; // "male" | "female" | undefined
    return apiGender || localGender || "unknown";
  }, [profile, localGender]);

  const GenderIcon = useMemo(() => {
    if (gender === "female") return MdFemale;
    if (gender === "male") return MdMale;
    return FiUser;
  }, [gender]);

  const setGender = (g) => {
    setLocalGender(g);
    localStorage.setItem("patientGender", g);
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(maladeId || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      alert("Impossible de copier (autorisation navigateur).");
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("patientGender");
    navigate("/login");
  };

  return (
    <MaladeLayout title="👤 Mon Profil" subtitle="Vos informations patient et accès rapides.">
      <div className="p-profile-grid">
        {/* ====== HERO / IDENTITÉ ====== */}
        <div className="m-card p-profile-hero">
          {loading ? (
            <p className="m-muted">Chargement...</p>
          ) : !profile ? (
            <p className="m-muted">Profil introuvable.</p>
          ) : (
            <>
              <div className="p-profile-hero-top">
                <div className="p-avatar">
                  <GenderIcon />
                </div>

                <div className="p-identity">
                  <h2 className="p-name">{profile.name || "Patient"}</h2>

                  <div className="p-line">
                    <FiMail />
                    <span>{profile.email || "—"}</span>
                  </div>

                  <div className="p-chips">
                    <span className="p-chip p-chip-info">
                      <FiCheckCircle /> Compte actif
                    </span>
                    <span className="p-chip">
                      <FiCalendar /> Espace Patient
                    </span>
                  </div>
                </div>
              </div>

              {/* ID patient + copier */}
              <div className="p-id-row">
                <div className="p-id-box">
                  <span className="p-id-label">Identifiant patient</span>
                  <span className="p-id-value">{maladeId || "—"}</span>
                </div>

                <button className="m-btn" onClick={copyId}>
                  <FiCopy />
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>

             
            </>
          )}
        </div>

        {/* ====== CARTE RACCOURCIS ====== */}
        <div className="m-card p-profile-side">
          <h3 className="p-side-title">Accès rapides</h3>

          <div className="p-side-actions">
            <button className="m-btn primary" onClick={() => navigate("/malade/rendezvous/demande")}>
              Prendre un RDV
            </button>

            <button className="m-btn" onClick={() => navigate("/malade/rendezvous/historique")}>
              Voir l’historique
            </button>

            <button className="m-btn" onClick={() => navigate("/malade/ia")}>
              Prédiction (IA)
            </button>

            <button className="m-btn danger" onClick={logout}>
              <FiLogOut /> Déconnexion
            </button>
          </div>

          <div className="p-tip">
            <strong>Conseil :</strong> gardez votre email à jour pour recevoir les notifications de RDV.
          </div>
        </div>
      </div>
    </MaladeLayout>
  );
}
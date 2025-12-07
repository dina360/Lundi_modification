import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./MedecinLayout.css";

function MedecinLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/medecin/home" },
    { name: "Liste des patients", path: "/medecin/patients" },

    // 🔥 Tu voulais garder celui-ci → je n'ai pas supprimé
    { name: "Ajouter consultation", path: "/medecin/PatientDetails" },

    { name: "Gérer les rendez-vous", path: "/medecin/manage-appointments" },

    // 📌 Nouveau bouton pour profil Médecin (upload photo + infos)
    { name: "Profil", path: "/medecin/profile" }, 
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // 🔹 Récupérer le médecin depuis localStorage
  const medecinStr = localStorage.getItem("medecin");
  let medecinName = "Médecin"; // Valeur par défaut

  try {
    if (medecinStr) {
      const medecin = JSON.parse(medecinStr);
      if (medecin.name) {
        medecinName = medecin.name.replace("Dr.", "").trim(); // Supprimer "Dr." si présent
      }
    }
  } catch (e) {
    console.error("Erreur parsing medecin:", e);
  }

  return (
    <div className="medecin-container">
      {/* ====== Sidebar ====== */}
      <aside className="medecin-sidebar">
        <h2>👨‍⚕️ Médecin</h2>

        {/* Bloc Bienvenue */}
        <div className="welcome-box">
          <p>
            Bienvenue<br />
            <b>Dr.{medecinName}</b> 👋
          </p>
        </div>

        {/* Menu Navigation */}
        <nav className="medecin-nav">
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.path}
                className={
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + "/")
                    ? "active"
                    : ""
                }
              >
                <Link to={item.path}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Déconnexion */}
        <button
          className="logout-btn"
          onClick={handleLogout}
          style={{ backgroundColor: "#ef4444", color: "#fff" }}
        >
          🔓 Déconnexion
        </button>
      </aside>

      {/* ====== Zone Contenu ====== */}
      <main className="medecin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default MedecinLayout;
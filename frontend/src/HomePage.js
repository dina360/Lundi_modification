import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

import logo from "./assets/neohealth-logo.jpg";
import hero1 from "./assets/hero1.jpeg";
import hero2 from "./assets/hero2.jpg";
import hero3 from "./assets/hero3.jpeg";
import hero4 from "./assets/hero4.jpg";
import hero5 from "./assets/hero5.jpg";

function HomePage() {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  // 🧭 Ajout des références
  const servicesRef = useRef(null);
  const accesRef = useRef(null);

  const images = [hero1, hero2, hero3, hero4, hero5];

  // 🧭 Fonction pour scroller jusqu’à une section
  // eslint-disable-next-line no-unused-vars
  const scrollToSection = (ref) => {
    window.scrollTo({
      top: ref.current.offsetTop - 70, // -70 pour ajuster selon la hauteur du header
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
     <div className="homepage">
      {/* HEADER / NAVBAR */}
      <header className="header">
        <div className="logo-section">
          <img src={logo} alt="NeoHealth Logo" className="logo" />
          <h1>NeoHealth</h1>
        </div>
        <nav className="navbar">
          <a href="#services">Services</a>
          <a href="#acces">Accès</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      {/* HERO SECTION AVEC SLIDER */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${images[currentImage]})` }}
      >
        <div className="hero-overlay">
          <h2>Bienvenue à Clinique NeoHealth</h2>
          <p>
            Un hôpital intelligent qui combine soins humains et technologies
            modernes pour améliorer la santé et le bien-être des patients.
          </p>
          <button className="btn-hero" onClick={() => navigate("/register")}>
            Rejoindre Maintenant
          </button>
        </div>
      </section>

      {/* SECTION SERVICES */}
      <section ref={servicesRef} id="services" className="services-section">
        <h2>Nos Services Médicaux</h2>
        <p>
          Découvrez nos services de santé modernes et nos outils numériques
          conçus pour faciliter votre expérience hospitalière.
        </p>

        <div className="services-grid">

  <div className="service-card">
    <h3>🧬 Consultations & Analyses</h3>
    <p>Des spécialistes à votre écoute, avec un suivi médical précis.</p>
  </div>

  {/* ⬇️ BOUTON REDIRIGE VERS /patients */}
  <div className="service-card" onClick={() => navigate("/patients")}>
    <h3>💊 Gestion des Patients</h3>
    <p>Visualisez et gérez vos dossiers médicaux, ordonnances et historiques de soins.</p>
    <button className="btn-access">Voir les Patients</button>
  </div>

  <div className="service-card">
    <h3>📅 Prise de Rendez-vous</h3>
    <p>Planifiez facilement vos rendez-vous avec nos docteurs.</p>
  </div>

  <div className="service-card">
    <h3>🩺 Suivi à Distance</h3>
    <p>Surveillez votre santé via notre plateforme intelligente.</p>
  </div>

</div>
      </section>

      {/* SECTION ACCÈS */}
      <section ref={accesRef} id="acces" className="acces-section">
        <h2>Accéder à la Plateforme</h2>
        <div className="acces-container">
          <div className="acces-card admin">
            <h3>👨‍⚕️ Espace Médecin / Admin</h3>
            <p>Gérez les patients, les salles et les consultations.</p>
            <button className="btn-access" onClick={() => navigate("/login")}>
              Accéder en tant qu'Admin
            </button>
          </div>
          <div className="acces-card patient">
            <h3>🧑‍💻 Espace Patient</h3>
            <p>Consultez votre dossier médical et vos rendez-vous.</p>
            <button className="btn-access" onClick={() => navigate("/login")}>
              Accéder en tant que Patient
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="footer">
        <div>
          <h3>🏥 Clinique NeoHealth</h3>
          <p>
            45 Avenue Hassan II, Casablanca, Maroc  
            <br />📞 +212 522 45 67 89 | 📧 contact@neohealth.ma
          </p>
        </div>
        <p className="copyright">
          © 2025 Clinique NeoHealth — Casablanca, Maroc. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}

export default HomePage;

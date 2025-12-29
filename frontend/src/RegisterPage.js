import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';

// Import des images
import logo from './assets/neohealth-logo.jpg';
import medicalImage from './assets/hero2.jpg';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        { name: fullName, email, password }      // 👈 rôle = patient côté backend
      );

      localStorage.setItem('authToken', response.data.token);

      // Redirection vers l'interface PATIENT
      navigate('/patient/home');

    } catch (err) {
      const serverError = err.response?.data?.message;
      setError(serverError || "Erreur lors de la création du compte");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="split-auth-page">
      {/* Côté gauche - Formulaire */}
      <div className="split-form-side">
        <div className="split-form-container">
          {/* Logo */}
          <div className="split-logo">
            <img src={logo} alt="NeoHealth Logo" className="split-logo-img" />
            <h1>Clinique NeoHealth</h1>
          </div>

          {/* En-tête */}
          <div className="split-header">
            <h2>Créer un compte patient</h2>
            <p>Accédez à vos rendez-vous et à votre dossier médical en ligne.</p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="split-error-message">
              <FiShield className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleRegister} className="split-form">
            <div className="split-form-group">
              <label className="split-form-label">
                <FiUser className="icon" />
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="split-form-input"
                placeholder="Ex: Hajar Elibrahimi"
                required
              />
            </div>

            <div className="split-form-group">
              <label className="split-form-label">
                <FiMail className="icon" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="split-form-input"
                placeholder="vous@example.com"
                required
              />
            </div>

            <div className="split-form-group">
              <label className="split-form-label">
                <FiLock className="icon" />
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="split-form-input"
                placeholder="Minimum 6 caractères"
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="split-submit-button"
            >
              <FiUser className="button-icon" />
              <span>{isLoading ? 'Création du compte...' : 'Créer mon compte patient'}</span>
              <FiArrowRight className="arrow-icon" />
            </button>
          </form>

          {/* Lien de connexion */}
          <div className="split-auth-footer">
            <p>
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="split-auth-link">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Côté droit - Image */}
      <div className="split-image-side">
        <div 
          className="split-image-container"
          style={{ backgroundImage: `url(${medicalImage})` }}
        >
          <div className="split-image-overlay">
            <div className="split-image-content">
              <h3>Espace patient sécurisé</h3>
              <p>Consultez vos rendez-vous, ordonnances et résultats en toute sécurité.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

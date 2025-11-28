// frontend/src/RegisterPage.js
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';

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
      // 🚨 Inscription patient UNIQUEMENT
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        { 
          name: fullName, 
          email, 
          password,
          role: "patient" // forcé côté backend aussi
        }
      );

      // Pas besoin de token ici (patient simple), mais si tu veux :
      localStorage.setItem('authToken', response.data.token);

      // Redirection vers interface patient
      navigate('/homePatient');

    } catch (err) {
      const serverError = err.response?.data?.message;
      setError(serverError || "Erreur lors de la création du compte");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="split-auth-page">

      {/* Côté gauche */}
      <div className="split-form-side">
        <div className="split-form-container">

          {/* Logo */}
          <div className="split-logo">
            <img src={logo} alt="NeoHealth Logo" className="split-logo-img" />
            <h1>Clinique NeoHealth</h1>
          </div>

          {/* Titre */}
          <div className="split-header">
            <h2>Create Your Account</h2>
            <p>Patient Registration</p>
          </div>

          {/* Erreur */}
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
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="split-form-input"
                placeholder="Ex: Sarah Johnson"
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
                placeholder="example@mail.com"
                required
              />
            </div>

            <div className="split-form-group">
              <label className="split-form-label">
                <FiLock className="icon" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="split-form-input"
                placeholder="Minimum 6 characters"
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
              <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
              <FiArrowRight className="arrow-icon" />
            </button>
          </form>

          {/* Lien login */}
          <div className="split-auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="split-auth-link">
                Sign in here
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Côté image */}
      <div className="split-image-side">
        <div
          className="split-image-container"
          style={{ backgroundImage: `url(${medicalImage})` }}
        >
          <div className="split-image-overlay">
            <div className="split-image-content">
              <h3>Welcome to NeoHealth</h3>
              <p>Your secure medical space</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default RegisterPage;

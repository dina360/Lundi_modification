import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLogIn, FiMail, FiLock, FiArrowRight, FiShield, FiHeart, FiCalendar, FiUsers } from 'react-icons/fi';

// Import des images
import logo from './assets/neohealth-logo.jpg';
import medicalImage from './assets/imag1.jpeg';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
  email,
  password
});

// ⬅️ on stocke aussi le rôle & nom
localStorage.setItem('authToken', response.data.token);
localStorage.setItem('userRole', response.data.user.role);
localStorage.setItem('userName', response.data.user.name);

const role = response.data.user.role;

if (role === "admin" || role === "medecin" || role === "secretaire") {
    navigate("/home");  // interface staff
} else {
    navigate("/homePatient");  // interface patient
}
      
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
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
            <h2>Welcome Back!</h2>
            <p>Log in to your medical account</p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="split-error-message">
              <FiShield className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="split-form">
            <div className="split-form-group">
              <label className="split-form-label">
                <FiMail className="icon" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="split-form-input"
                placeholder="Enter your professional email"
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
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="split-submit-button"
            >
              <FiLogIn className="button-icon" />
              <span>{isLoading ? 'Signing in...' : 'Log in'}</span>
              <FiArrowRight className="arrow-icon" />
            </button>
          </form>

          {/* Lien d'inscription */}
          <div className="split-auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="split-auth-link">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Features list */}
          <div className="split-features">
            <div className="split-feature-item">
              <FiCalendar className="feature-icon" />
              <span>Easy Appointment Scheduling</span>
            </div>
            <div className="split-feature-item">
              <FiUsers className="feature-icon" />
              <span>Patient Management Tools</span>
            </div>
            <div className="split-feature-item">
              <FiShield className="feature-icon" />
              <span>Secure Medical Records</span>
            </div>
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
              <h3>Advanced Healthcare Solutions</h3>
              <p>Join thousands of medical professionals using our platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
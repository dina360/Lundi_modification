import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLogIn, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Effet de particules flottantes
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-cyan-400/20 rounded-full';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animation = `float ${8 + Math.random() * 12}s infinite`;
      return particle;
    };

    const container = document.querySelector('.particle-container');
    for (let i = 0; i < 50; i++) {
      container.appendChild(createParticle());
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      localStorage.setItem('authToken', response.data.token);
      navigate('/home');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Effet de particules */}
      <div className="particle-container absolute inset-0 pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-3xl blur-xl opacity-20 animate-pulse" />
        
        <div className="relative backdrop-blur-2xl bg-black/30 rounded-3xl border border-cyan-400/20 p-8 space-y-8 shadow-2xl shadow-cyan-400/10">
          {/* En-tête */}
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl">
              <FiLogIn className="w-12 h-12 text-cyan-400 mx-auto animate-bounce" />
            </div>
            <h2 className="text-5xl font-bold text-indigo-600 text-center mb-6">
              Bienvenue
            </h2>
            <p className="text-lg text-cyan-100/80">Authentification sécurisée</p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-900/50 border border-red-400/30 p-4 rounded-xl flex items-center space-x-3 backdrop-blur-sm">
              <div className="h-6 w-6 bg-red-400/20 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse" />
              </div>
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              {/* Champ Email */}
              <div className="group relative">
                <label className="block text-sm font-medium text-cyan-300 mb-3">
                  <FiMail className="inline mr-2 -mt-1" />
                  Adresse Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border-2 border-cyan-400/20 rounded-xl py-4 px-6 text-gray-100 placeholder-gray-500/70 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300"
                    placeholder="contact@clinique.com"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl pointer-events-none border-2 border-transparent group-hover:border-cyan-400/30 transition-all duration-300" />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div className="group relative">
                <label className="block text-sm font-medium text-cyan-300 mb-3">
                  <FiLock className="inline mr-2 -mt-1" />
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border-2 border-cyan-400/20 rounded-xl py-4 px-6 text-gray-100 placeholder-gray-500/70 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl pointer-events-none border-2 border-transparent group-hover:border-cyan-400/30 transition-all duration-300" />
                </div>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-xl font-bold text-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center justify-center space-x-3">
                <span>{isLoading ? 'Connexion en cours...' : 'Accéder au système'}</span>
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </form>

          {/* Lien d'inscription */}
          <p className="text-center text-cyan-200/80">
            Nouveau membre ?{' '}
            <Link 
              to="/register" 
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-all duration-300 hover:underline hover:underline-offset-4"
            >
              Créer un compte professionnel
            </Link>
          </p>
        </div>
      </div>

      {/* Styles d'animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(10px) translateX(-10px); }
          75% { transform: translateY(-10px) translateX(-5px); }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
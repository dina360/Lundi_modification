import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        { name: fullName, email, password }
      );

      localStorage.setItem('authToken', response.data.token);
      navigate('/home');

    } catch (err) {
      const serverError = err.response?.data?.message;
      setError(serverError || "Erreur lors de la création du compte");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-blue-500 rounded-2xl blur opacity-30 animate-pulse"></div>

        <div className="relative backdrop-blur-xl bg-black/30 rounded-2xl shadow-lg border border-pink-400/20 p-8 space-y-8">
          <div className="text-center">
          <h2 className="text-4xl font-bold text-indigo-600 text-center mb-6">
              Nouveau Compte
            </h2>
            
            <p className="mt-2 text-gray-400">Accès professionnel</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-400/30 p-4 rounded-lg flex items-center space-x-3">
              <span className="text-red-300">{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-pink-300">Nom complet</label>
                <div className="mt-1 group relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/40 border-2 border-pink-400/20 rounded-xl py-3 px-4 text-gray-100 placeholder-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition-all"
                    placeholder="Dr. Jane Smith"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-pink-300">Email</label>
                <div className="mt-1 group relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border-2 border-pink-400/20 rounded-xl py-3 px-4 text-gray-100 placeholder-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition-all"
                    placeholder="contact@clinique.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-pink-300">Mot de passe</label>
                <div className="mt-1 group relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border-2 border-pink-400/20 rounded-xl py-3 px-4 text-gray-100 placeholder-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition-all"
                    placeholder="••••••••"
                    required
                    minLength="6"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-400 hover:to-blue-500 rounded-xl font-bold text-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Création...' : 'Créer un Compte'}
            </button>
          </form>

          <p className="text-center text-gray-400">
            Déjà inscrit ?{' '}
            <a 
              href="/login" 
              className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
            >
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
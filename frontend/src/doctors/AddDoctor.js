// src/doctors/AddDoctor.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiActivity as FiStethoscope,
  FiFileText,
  FiCamera,
  FiArrowLeft,
  FiPlus,
} from "react-icons/fi";

import Sidebar from "../Sidebar";

const AddDoctor = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: "",
    notes: "",
    status: "Disponible",
    photo: null,
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) payload.append(key, value);
    });

    try {
      await axios.post("http://localhost:5000/api/doctors", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/docteurs");
    } catch (err) {
      console.error("Erreur création médecin:", err);
      setError(err.response?.data?.message || "Erreur lors de l'ajout.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="docteurs"
      />

      <div className={`transition-all duration-300 min-h-screen ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        {/* En-tête Royal */}
        <header className="bg-gradient-to-r from-blue-800 via-royalblue-900 to-blue-900 text-white p-8 -mt-8 -mx-8 mb-8 shadow-2xl border-b-4 border-gold-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/docteurs")}
                className="flex items-center space-x-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-white/30"
              >
                <FiArrowLeft className="text-lg" />
                <span>Retour</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <FiPlus className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Ajouter un Médecin</h1>
                  <p className="text-blue-100 mt-2 text-lg">
                    Enregistrez un nouveau praticien dans le système NeoHealth
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-blue-200 text-sm">Hôpital NeoHealth</div>
              <div className="text-white font-semibold">Plateforme Médicale</div>
            </div>
          </div>
        </header>

        {/* Formulaire */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Nom */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <FiUser className="mr-3 text-blue-900 text-lg" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    placeholder="Dr. Hajar Elibrahimi"
                  />
                </div>

                {/* Spécialité */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <FiStethoscope className="mr-3 text-blue-900 text-lg" />
                    Spécialité médicale
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    required
                    value={formData.specialty}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    placeholder="Cardiologie, Pédiatrie..."
                  />
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <FiMail className="mr-3 text-blue-900 text-lg" />
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    placeholder="medecin@neohealth.ma"
                  />
                </div>

                {/* Téléphone */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <FiPhone className="mr-3 text-blue-900 text-lg" />
                    Téléphone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    placeholder="+212 6 00 00 00 00"
                  />
                </div>

                {/* Statut */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Statut professionnel
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Occupé">Occupé</option>
                    <option value="Absent">Absent</option>
                    <option value="En congé">En congé</option>
                  </select>
                </div>

                {/* Photo */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <FiCamera className="mr-3 text-blue-900 text-lg" />
                    Photo de profil
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-900 file:text-white hover:file:bg-blue-800"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 uppercase tracking-wide">
                  <FiFileText className="mr-3 text-blue-900 text-lg" />
                  Notes supplémentaires
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                  placeholder="Informations supplémentaires (langues, services, horaires spécifiques...)"
                />
              </div>

              {/* Boutons */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/docteurs")}
                  className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all duration-300 hover:shadow-lg border-2 border-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-blue-900"
                >
                  Enregistrer le Médecin
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDoctor;
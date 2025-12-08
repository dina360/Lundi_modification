// src/doctors/AddDoctor.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiStethoscope,
  FiFileText,
  FiCamera,
  FiArrowLeft,
} from "react-icons/fi";

import Sidebar from "../Sidebar";
import "../Home.css";

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
    <div className="admin-layout">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="docteurs"
      />

      <div className={`main-content ${sidebarOpen ? "content-shifted" : ""}`}>
        <header className="content-header">
          <div className="header-actions">
            <button
              className="add-patient-btn secondary"
              onClick={() => navigate("/docteurs")}
            >
              <FiArrowLeft className="btn-icon" />
              Retour à la liste
            </button>
            <h1>Ajouter un Médecin</h1>
            <p className="header-subtitle">
              Enregistrer un nouveau médecin dans la plateforme NeoHealth.
            </p>
          </div>
        </header>

        <div className="patients-table-wrapper">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 max-w-3xl mx-auto bg-white/70 rounded-2xl shadow-lg p-8"
          >
            {error && (
              <div className="p-3 rounded-xl bg-red-100 text-red-700 mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-2" />
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Dr. Hajar Elibrahimi"
                />
              </div>

              {/* Spécialité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiStethoscope className="inline mr-2" />
                  Spécialité
                </label>
                <input
                  type="text"
                  name="specialty"
                  required
                  value={formData.specialty}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Cardiologie, Pédiatrie..."
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline mr-2" />
                  Email professionnel
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="medecin@neohealth.ma"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="inline mr-2" />
                  Téléphone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="+212 6 00 00 00 00"
                />
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Occupé">Occupé</option>
                  <option value="Absent">Absent</option>
                  <option value="En congé">En congé</option>
                </select>
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCamera className="inline mr-2" />
                  Photo de profil
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiFileText className="inline mr-2" />
                Notes (optionnel)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Informations supplémentaires (langues, services, horaires spécifiques...)."
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/docteurs")}
                className="px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
              >
                Enregistrer le médecin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDoctor;

import React, { useEffect, useState } from "react";
import { FiUser, FiFileText, FiPhone, FiHome, FiCalendar, FiX } from "react-icons/fi";

const EditPatientModal = ({ patient, onClose, onEditPatient }) => {
  const [formData, setFormData] = useState({
    name: "",
    dossier: "",
    phone: "",
    address: "",
    lastAppointment: "",
    nextAppointment: ""
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || "",
        dossier: patient.dossier || "",
        phone: patient.phone || "",
        address: patient.address || "",
        lastAppointment: patient.lastAppointment || "",
        nextAppointment: patient.nextAppointment || ""
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onEditPatient({ ...patient, ...formData });
      onClose();
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-indigo-600 text-center mb-6">
              Modifier Patient
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <FiUser className="inline mr-2 text-indigo-500" />
                  Nom complet
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Dr. John Doe"
                  required
                />
              </div>

              {/* Dossier */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <FiFileText className="inline mr-2 text-indigo-500" />
                  Numéro de dossier
                </label>
                <input
                  name="dossier"
                  value={formData.dossier}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Dossier #"
                  required
                />
              </div>

              {/* Téléphone */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <FiPhone className="inline mr-2 text-indigo-500" />
                  Téléphone
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="+212 600-000000"
                  required
                />
              </div>

              {/* Adresse */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <FiHome className="inline mr-2 text-indigo-500" />
                  Adresse
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Adresse complète"
                  required
                />
              </div>

              {/* Dernier RDV */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <FiCalendar className="inline mr-2 text-indigo-500" />
                  Dernier rendez-vous
                </label>
                <input
                  type="datetime-local"
                  name="lastAppointment"
                  value={formData.lastAppointment ? new Date(formData.lastAppointment).toISOString().slice(0,16) : ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* Prochain RDV */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <FiCalendar className="inline mr-2 text-indigo-500" />
                  Prochain rendez-vous
                </label>
                <input
                  type="datetime-local"
                  name="nextAppointment"
                  value={formData.nextAppointment ? new Date(formData.nextAppointment).toISOString().slice(0,16) : ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all duration-300 font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-indigo-200"
              >
                Sauvegarder les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPatientModal;
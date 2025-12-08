// src/AddPatientModal.js
import React, { useState } from 'react';
import { FiUser, FiFileText, FiPhone, FiHome, FiCamera, FiX } from 'react-icons/fi';

function AddPatientModal({ onClose, onAddPatient }) {
  const [formData, setFormData] = useState({
    name: "",
    dossier: "",
    phone: "",
    address: "",
    photo: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formPayload.append(key, value);
    });

    try {
      // 👉 C’est le parent qui fait l’appel axios
      await onAddPatient(formPayload);
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout du patient", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 text-center mb-6">
              Nouveau Patient
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

              {/* Photo */}
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <FiCamera className="inline mr-2 text-indigo-500" />
                  Photo d'identité
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-4 border-dashed border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all rounded-2xl cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-5">
                      <FiCamera className="w-8 h-8 text-indigo-400" />
                      <p className="pt-1 text-sm text-gray-500">
                        {formData.photo ? formData.photo.name : 'Glissez-déposez ou cliquez pour uploader'}
                      </p>
                    </div>
                    <input
                      type="file"
                      name="photo"
                      onChange={handlePhotoChange}
                      className="opacity-0"
                      accept="image/*"
                    />
                  </label>
                </div>
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
                Ajouter le Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPatientModal;
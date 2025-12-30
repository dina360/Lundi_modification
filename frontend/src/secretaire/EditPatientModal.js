import React, { useEffect, useState } from "react";
import { FiUser, FiFileText, FiPhone, FiHome, FiCalendar, FiX, FiMail, FiCheck } from "react-icons/fi";
import { api } from "./api";

const EditPatientModal = ({ patient, onClose, onUpdatePatient }) => {
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    dossier: "",
    phone: "",
    email: "",
    address: "",
    birthDate: "",       // ✅ même nom que backend
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    notes: "",
    status: "active",
  });

  useEffect(() => {
    if (!patient) return;

    const toDateInput = (v) => {
      if (!v) return "";
      const d = new Date(v);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    };

    setFormData({
      name: patient.name || "",
      dossier: patient.dossier || "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      birthDate: toDateInput(patient.birthDate),
      bloodType: patient.bloodType || "",
      allergies: patient.allergies || "",
      medicalHistory: patient.medicalHistory || "",
      notes: patient.notes || "",
      status: patient.status || "active",
    });
  }, [patient]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!patient?._id) return setErrorMsg("Patient invalide (ID manquant).");
    if (!formData.name.trim() || !formData.dossier.trim() || !formData.phone.trim() || !formData.address.trim()) {
      return setErrorMsg("Champs obligatoires: Nom, Dossier, Téléphone, Adresse.");
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      dossier: formData.dossier.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      birthDate: formData.birthDate ? formData.birthDate : null,
      bloodType: formData.bloodType.trim(),
      allergies: formData.allergies.trim(),
      medicalHistory: formData.medicalHistory.trim(),
      notes: formData.notes.trim(),
      status: formData.status || "active",
    };

    try {
      setSaving(true);
      const res = await api.put(`/patients/${patient._id}`, payload);

      // ✅ met à jour la liste dans PatientsList
      onUpdatePatient?.(res.data);
      onClose?.();
    } catch (err) {
      console.error("Erreur lors de la modification:", err);
      setErrorMsg(err?.response?.data?.message || "Erreur lors de la modification du patient.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative overflow-hidden border-2 border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6 text-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <FiUser className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Modifier le Patient</h2>
                <p className="text-blue-100">Sauvegarde directe dans MongoDB</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors border border-transparent hover:border-white/30"
            >
              <FiX size={24} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* Informations personnelles */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <FiUser className="mr-3 text-blue-900" />
                Informations Personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Numéro de dossier</label>
                  <input
                    name="dossier"
                    value={formData.dossier}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <FiPhone className="inline mr-2 text-blue-900" />
                    Téléphone
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <FiMail className="inline mr-2 text-blue-900" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <FiHome className="inline mr-2 text-blue-900" />
                    Adresse
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <FiCalendar className="inline mr-2 text-blue-900" />
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Informations médicales */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <FiFileText className="mr-3 text-blue-900" />
                Informations Médicales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Groupe sanguin</label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                  >
                    <option value="">Sélectionner</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Allergies</label>
                  <input
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <label className="block text-sm font-medium text-gray-700">Antécédents médicaux</label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                />
              </div>

              <div className="mt-6 space-y-3">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-8 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all duration-300 hover:shadow-lg border-2 border-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold rounded-xl shadow-2xl transition-all duration-300 border-2 border-blue-900 flex items-center space-x-2 disabled:opacity-60"
              >
                <FiCheck className="text-xl" />
                <span>{saving ? "Sauvegarde..." : "Sauvegarder"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPatientModal;

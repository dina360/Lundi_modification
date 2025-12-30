// src/AddPatientModal.js
import React, { useState } from "react";
import { api } from "./api";

const AddPatientModal = ({ onClose, onPatientAdded }) => {
  const [form, setForm] = useState({
    name: "",
    dossier: "",
    phone: "",
    email: "",
    address: "",
    birthDate: "", // YYYY-MM-DD
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    notes: "",
    status: "active",
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.name.trim() || !form.dossier.trim() || !form.phone.trim() || !form.address.trim()) {
      return setErrorMsg("Champs obligatoires: Nom, Dossier, Téléphone, Adresse.");
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      dossier: form.dossier.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      birthDate: form.birthDate ? form.birthDate : null,
      bloodType: form.bloodType.trim(),
      allergies: form.allergies.trim(),
      medicalHistory: form.medicalHistory.trim(),
      notes: form.notes.trim(),
      status: form.status || "active",
    };

    try {
      setSaving(true);

      // ✅ Endpoint correct : /api/patients
      const res = await api.post("/patients", payload);

      onPatientAdded?.(res.data);
      onClose?.();
    } catch (err) {
      console.error("Erreur ajout patient:", err);
      setErrorMsg(err?.response?.data?.message || "Erreur lors de l'ajout du patient.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white flex items-center justify-between">
          <h3 className="text-lg font-bold">Ajouter un patient</h3>
          <button onClick={onClose} className="text-white/90 hover:text-white text-xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[78vh] overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Infos personnelles */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h4 className="text-lg font-extrabold text-gray-900 mb-4">Informations Personnelles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700">Nom *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-900 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Numéro de dossier *</label>
                <input
                  name="dossier"
                  value={form.dossier}
                  onChange={onChange}
                  className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-900 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Téléphone *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-900 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-900 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Adresse *</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-900 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Date de naissance</label>
                <input
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={onChange}
                  className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Infos médicales */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h4 className="text-lg font-extrabold text-gray-900 mb-4">Informations Médicales</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700">Groupe sanguin</label>
                <select
                  name="bloodType"
                  value={form.bloodType}
                  onChange={onChange}
                  className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-900 outline-none"
                >
                  <option value="">Sélectionner</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Allergies</label>
                <input
                  name="allergies"
                  value={form.allergies}
                  onChange={onChange}
                  className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-900 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Antécédents médicaux</label>
                <textarea
                  name="medicalHistory"
                  value={form.medicalHistory}
                  onChange={onChange}
                  rows={4}
                  className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-900 outline-none resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={onChange}
                  rows={3}
                  className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-900 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border-2 border-gray-200 font-semibold hover:bg-gray-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? "Ajout..." : "Ajouter Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;

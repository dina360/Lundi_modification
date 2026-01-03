import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiX,
  FiCamera,
  FiClock,
  FiCalendar,
  FiUserPlus,
} from "react-icons/fi";
import { createDoctor } from "./doctorService";
import Sidebar from "../Sidebar";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const SPECIALTIES = [
  { value: "", label: "Choisir spécialité" },
  { value: "medecin_generaliste", label: "Médecin Généraliste" },
  { value: "cardiologue", label: "Cardiologue" },
  { value: "pediatre", label: "Pédiatre" },
  { value: "chirurgien", label: "Chirurgien" },
  { value: "radiologue", label: "Radiologue" },
];

const STATUS = ["Disponible", "Occupé", "Absent", "En congé"];

export default function AddDoctor() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: "",
    notes: "",
    status: "Disponible",
    schedule: DAYS.map((d) => ({ day: d, slots: [] })),
    absences: [],
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const addSlot = (dayIndex) => {
    const copy = structuredClone(form.schedule);
    copy[dayIndex].slots.push({ start: "", end: "" });
    setForm((prev) => ({ ...prev, schedule: copy }));
  };

  const updateSlot = (dayIndex, slotIndex, key, value) => {
    const copy = structuredClone(form.schedule);
    copy[dayIndex].slots[slotIndex][key] = value;
    setForm((prev) => ({ ...prev, schedule: copy }));
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const copy = structuredClone(form.schedule);
    copy[dayIndex].slots.splice(slotIndex, 1);
    setForm((prev) => ({ ...prev, schedule: copy }));
  };

  const addAbsence = () =>
    setForm((prev) => ({
      ...prev,
      absences: [...prev.absences, { from: "", to: "", reason: "" }],
    }));

  const updateAbsence = (i, k, v) => {
    const copy = [...form.absences];
    copy[i][k] = v;
    setForm((prev) => ({ ...prev, absences: copy }));
  };

  const removeAbsence = (i) =>
    setForm((prev) => ({
      ...prev,
      absences: prev.absences.filter((_, idx) => idx !== i),
    }));

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const validate = () => {
    if (!form.name.trim() || !form.specialty.trim() || !form.email.trim()) {
      setError("Nom, spécialité et email sont requis.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setError(null);

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("specialty", form.specialty);
      fd.append("email", form.email);
      fd.append("phone", form.phone || "");
      fd.append("notes", form.notes || "");
      fd.append("status", form.status || "Disponible");
      fd.append("schedule", JSON.stringify(form.schedule));
      fd.append("absences", JSON.stringify(form.absences));
      if (photo) fd.append("photo", photo);

      const res = await createDoctor(fd);
      navigate(`/docteurs/${res._id}`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Erreur création médecin.");
    } finally {
      setSaving(false);
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
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-800 via-royalblue-900 to-blue-900 text-white p-8 -mt-8 -mx-8 mb-8 shadow-2xl border-b-4 border-gold-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <FiUserPlus className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Ajouter un Médecin</h1>
                <p className="text-blue-100 mt-2 text-lg">Créer une fiche médecin (profil + planning)</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/docteurs")}
              className="flex items-center space-x-2 bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold transition-all duration-300 border-2 border-white"
            >
              <FiX className="text-xl" />
              <span>Retour</span>
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 pb-12">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Card infos */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Informations</h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Photo
                  </label>
                  <div className="relative group">
                    <div className="w-44 h-44 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <FiCamera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Ajouter une photo</p>
                        </div>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all cursor-pointer rounded-2xl">
                      <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiCamera className="w-6 h-6 text-white" />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Fields */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Nom complet *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                      placeholder="Dr. ..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Spécialité *</label>
                    <select
                      value={form.specialty}
                      onChange={(e) => setField("specialty", e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                      required
                    >
                      {SPECIALTIES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                      placeholder="prenom.nom@neohealth.ma"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                      placeholder="+212..."
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <select
                      value={form.status}
                      onChange={(e) => setField("status", e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                    >
                      {STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setField("notes", e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                      placeholder="Bio / Diplômes / Expériences..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Horaires */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiClock className="text-blue-900" /> Horaires
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {form.schedule.map((d, di) => (
                  <div key={d.day} className="border-2 border-gray-100 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-gray-900">{d.day}</div>
                      <button
                        type="button"
                        onClick={() => addSlot(di)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200"
                      >
                        <FiPlus /> Ajouter
                      </button>
                    </div>

                    {d.slots.length === 0 ? (
                      <div className="text-sm text-gray-500">Aucun créneau</div>
                    ) : (
                      <div className="space-y-3">
                        {d.slots.map((s, si) => (
                          <div key={si} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <input
                              type="time"
                              value={s.start}
                              onChange={(e) => updateSlot(di, si, "start", e.target.value)}
                              className="px-3 py-2 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                            />
                            <span className="text-gray-500 font-semibold">—</span>
                            <input
                              type="time"
                              value={s.end}
                              onChange={(e) => updateSlot(di, si, "end", e.target.value)}
                              className="px-3 py-2 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => removeSlot(di, si)}
                              className="ml-auto px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-semibold transition-all duration-300 border-2 border-red-200"
                            >
                              Suppr
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Absences */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiCalendar className="text-blue-900" /> Absences
              </h2>

              {form.absences.length === 0 ? (
                <div className="text-sm text-gray-500">Aucune absence</div>
              ) : (
                <div className="space-y-4">
                  {form.absences.map((a, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <input
                        type="date"
                        value={a.from}
                        onChange={(e) => updateAbsence(i, "from", e.target.value)}
                        className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                      />
                      <input
                        type="date"
                        value={a.to}
                        onChange={(e) => updateAbsence(i, "to", e.target.value)}
                        className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                      />
                      <input
                        value={a.reason}
                        onChange={(e) => updateAbsence(i, "reason", e.target.value)}
                        placeholder="Raison"
                        className="md:col-span-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => removeAbsence(i)}
                        className="md:col-span-4 justify-self-end px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-semibold transition-all duration-300 border-2 border-red-200"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addAbsence}
                className="mt-4 flex items-center gap-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200"
              >
                <FiPlus /> Ajouter une absence
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/docteurs")}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

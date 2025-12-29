import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoctorById, updateDoctor } from "./doctorService";
import { FiCamera, FiTrash2, FiSave, FiX, FiPlus, FiClock, FiCalendar } from "react-icons/fi";
import Sidebar from "../Sidebar"; // Import du Sidebar

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function EditDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", 
    specialty: "", 
    email: "", 
    phone: "", 
    notes: "", 
    status: "Disponible",
    schedule: DAYS.map(d => ({ day: d, slots: [] })), 
    absences: []
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [serverPhoto, setServerPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true); // Gérer l'état du Sidebar

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
  const displayedPhoto = photoPreview || (serverPhoto ? `${API_BASE}${serverPhoto}` : null);

  // Charger les données du médecin
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const data = await getDoctorById(id);
        
        // Normaliser le schedule
        const normalizeSchedule = (raw) => {
          if (!raw) return DAYS.map(d => ({ day: d, slots: [] }));
          if (typeof raw === "string") {
            try { raw = JSON.parse(raw); } catch { return DAYS.map(d => ({ day: d, slots: [] })); }
          }
          if (Array.isArray(raw)) {
            return DAYS.map((d, i) => {
              const found = raw.find(r => (r.day || "").toLowerCase() === d.toLowerCase()) || raw[i];
              return found ? { 
                day: found.day || d, 
                slots: Array.isArray(found.slots) ? found.slots.map(slot => ({
                  start: slot.start || "",
                  end: slot.end || ""
                })) : [] 
              } : { day: d, slots: [] };
            });
          }
          return DAYS.map(d => ({ day: d, slots: [] }));
        };

        const schedule = normalizeSchedule(data.schedule);
        const absences = Array.isArray(data.absences) ? data.absences.map(abs => ({
          from: abs.from ? abs.from.split('T')[0] : "",
          to: abs.to ? abs.to.split('T')[0] : "",
          reason: abs.reason || ""
        })) : [];

        setForm({
          name: data.name || "",
          specialty: data.specialty || "",
          email: data.email || "",
          phone: data.phone || "",
          notes: data.notes || "",
          status: data.status || "Disponible",
          schedule: schedule,
          absences: absences
        });
        
        if (data.photo) {
          setServerPhoto(data.photo);
        }
      } catch (err) {
        console.error("Erreur chargement médecin:", err);
        alert("Impossible de charger les données du médecin");
        navigate("/docteurs");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id, navigate]);

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = "Le nom est requis";
    if (!form.specialty.trim()) newErrors.specialty = "La spécialité est requise";
    if (!form.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "L'email est invalide";
    }

    // Validation des créneaux horaires
    form.schedule.forEach((day, dayIndex) => {
      day.slots.forEach((slot, slotIndex) => {
        if (slot.start && slot.end && slot.start >= slot.end) {
          newErrors[`slot-${dayIndex}-${slotIndex}`] = "L'heure de fin doit être après l'heure de début";
        }
      });
    });

    // Validation des absences
    form.absences.forEach((absence, index) => {
      if (absence.from && absence.to && new Date(absence.from) > new Date(absence.to)) {
        newErrors[`absence-${index}`] = "La date de fin doit être après la date de début";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    if (!form.name || !form.specialty || !form.email) {
      return alert("Nom, spécialité et email sont requis");
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("specialty", form.specialty);
      formData.append("email", form.email);
      formData.append("phone", form.phone || "");
      formData.append("notes", form.notes || "");
      formData.append("status", form.status || "Disponible");
      formData.append("schedule", JSON.stringify(form.schedule));
      formData.append("absences", JSON.stringify(form.absences));
      
      if (photo) {
        formData.append("photo", photo);
      }

      await updateDoctor(id, formData);
      alert("Médecin modifié avec succès !");
      navigate(`/docteurs/${id}`);
    } catch (err) {
      console.error("Erreur modification:", err);
      alert(err?.response?.data?.message || "Erreur lors de la modification du médecin");
    } finally {
      setSaving(false);
    }
  };

  const addSlot = (dayIndex) => {
    const updatedSchedule = [...form.schedule];
    updatedSchedule[dayIndex].slots.push({ start: "", end: "" });
    setForm(prev => ({ ...prev, schedule: updatedSchedule }));
  };

  const updateSlot = (dayIndex, slotIndex, field, value) => {
    const updatedSchedule = [...form.schedule];
    updatedSchedule[dayIndex].slots[slotIndex][field] = value;
    setForm(prev => ({ ...prev, schedule: updatedSchedule }));
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const updatedSchedule = [...form.schedule];
    updatedSchedule[dayIndex].slots.splice(slotIndex, 1);
    setForm(prev => ({ ...prev, schedule: updatedSchedule }));
  };

  const addAbsence = () => {
    setForm(prev => ({
      ...prev,
      absences: [...prev.absences, { from: "", to: "", reason: "" }]
    }));
  };

  const updateAbsence = (index, field, value) => {
    const updatedAbsences = [...form.absences];
    updatedAbsences[index][field] = value;
    setForm(prev => ({ ...prev, absences: updatedAbsences }));
  };

  const removeAbsence = (index) => {
    setForm(prev => ({
      ...prev,
      absences: prev.absences.filter((_, i) => i !== index)
    }));
  };

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ quand l'utilisateur modifie
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données du médecin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="docteurs" // Mettre l'onglet actif à "docteurs"
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-72" : "ml-20"} w-full`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button 
                onClick={() => navigate(`/docteurs/${id}`)}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 transition-colors"
              >
                <FiX className="text-lg" />
                Retour au profil
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Modifier le médecin</h1>
              <p className="text-gray-600 mt-2">Mettez à jour les informations du profil médical</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section Informations de base */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                  Informations personnelles
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Photo */}
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Photo de profil</label>
                    <div className="relative group">
                      <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
                        {displayedPhoto ? (
                          <img src={displayedPhoto} alt={form.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <FiCamera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Ajouter une photo</p>
                          </div>
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all cursor-pointer rounded-2xl">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFile}
                          className="hidden" 
                        />
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiCamera className="w-6 h-6 text-white" />
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom complet *
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setField("name", e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Dr. Jean Dupont"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Spécialité *
                        </label>
                        <select
                          value={form.specialty}
                          onChange={(e) => setField("specialty", e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                            errors.specialty ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Choisir une spécialité</option>
                          <option value="medecin_generaliste">Médecin Généraliste</option>
                          <option value="cardiologue">Cardiologue</option>
                          <option value="pediatre">Pédiatre</option>
                          <option value="chirurgien">Chirurgien</option>
                          <option value="radiologue">Radiologue</option>
                        </select>
                        {errors.specialty && <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setField("email", e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="jean.dupont@hopital.com"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="text"
                          value={form.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                      <select
                        value={form.status}
                        onChange={(e) => setField("status", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                        <option value="Disponible">🟢 Disponible</option>
                        <option value="Occupé">🟡 Occupé</option>
                        <option value="Absent">🔴 Absent</option>
                        <option value="En congé">🟠 En congé</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Biographie / Notes</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setField("notes", e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="Diplômes, spécialités, expériences..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Horaires */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FiClock className="text-indigo-600" />
                  Horaires de consultation
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {form.schedule.map((day, dayIndex) => (
                    <div key={day.day} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-800">{day.day}</h3>
                        <button 
                          type="button"
                          onClick={() => addSlot(dayIndex)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          <FiPlus className="w-4 h-4" />
                          Ajouter
                        </button>
                      </div>

                      {day.slots.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          Aucun créneau horaire défini
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {day.slots.map((slot, slotIndex) => (
                            <div key={slotIndex} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <div>
                                                                    <input 
                                    type="time" 
                                    value={slot.start}
                                    onChange={(e) => updateSlot(dayIndex, slotIndex, "start", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                </div>
                                <div>
                                  <input 
                                    type="time" 
                                    value={slot.end}
                                    onChange={(e) => updateSlot(dayIndex, slotIndex, "end", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                </div>
                              </div>
                              <button 
                                type="button"
                                onClick={() => removeSlot(dayIndex, slotIndex)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Absences */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FiCalendar className="text-indigo-600" />
                  Absences
                </h2>

                <div className="space-y-4">
                  {form.absences.map((absence, index) => (
                    <div key={index} className="flex items-center gap-4 border-b border-gray-200 pb-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Motif de l'absence</label>
                        <input
                          type="text"
                          value={absence.reason}
                          onChange={(e) => updateAbsence(index, "reason", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="Maladie, Congé, etc."
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Du</label>
                        <input
                          type="date"
                          value={absence.from}
                          onChange={(e) => updateAbsence(index, "from", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Au</label>
                        <input
                          type="date"
                          value={absence.to}
                          onChange={(e) => updateAbsence(index, "to", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeAbsence(index)}
                        className="text-red-500 hover:text-red-700 transition-all"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button 
                    type="button"
                    onClick={addAbsence}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <FiPlus className="w-4 h-4" />
                    Ajouter une absence
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => navigate(`/docteurs/${id}`)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                >
                  Annuler
                </button>

                <button 
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

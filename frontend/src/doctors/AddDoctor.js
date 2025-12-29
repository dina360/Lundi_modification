import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDoctor } from "./doctorService";
import Sidebar from "../Sidebar"; // Importation du Sidebar

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function AddDoctor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", specialty: "", email: "", phone: "", notes: "", status: "Disponible",
    schedule: DAYS.map(d => ({ day: d, slots: [] })), absences: []
  });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Gérer l'état du Sidebar

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const addSlot = (dayIndex) => {
    const copy = JSON.parse(JSON.stringify(form.schedule));
    copy[dayIndex].slots.push({ start: "", end: "" });
    setForm(prev => ({ ...prev, schedule: copy }));
  };

  const updateSlot = (dayIndex, slotIndex, key, value) => {
    const copy = JSON.parse(JSON.stringify(form.schedule));
    copy[dayIndex].slots[slotIndex][key] = value;
    setForm(prev => ({ ...prev, schedule: copy }));
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const copy = JSON.parse(JSON.stringify(form.schedule));
    copy[dayIndex].slots.splice(slotIndex, 1);
    setForm(prev => ({ ...prev, schedule: copy }));
  };

  const addAbsence = () => setForm(prev => ({ ...prev, absences: [...prev.absences, { from: "", to: "", reason: "" }] }));
  
  const updateAbsence = (i, k, v) => { 
    const copy = [...form.absences]; 
    copy[i][k] = v; 
    setForm(prev => ({ ...prev, absences: copy })); 
  };

  const removeAbsence = (i) => setForm(prev => ({ ...prev, absences: prev.absences.filter((_, idx) => idx !== i) }));

  const handleFile = e => setPhoto(e.target.files?.[0] || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.specialty || !form.email) return alert("Nom, spécialité et email requis.");
    try {
      setSaving(true);
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
      alert(err?.response?.data?.message || "Erreur création médecin");
    } finally { setSaving(false); }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="docteurs" // Mettre l'onglet actif à "docteurs"
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-72" : "ml-20"} w-full`}>
        <div className="p-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Ajouter un médecin</h1>
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
            <input
              name="name"
              value={form.name}
              onChange={e => setField("name", e.target.value)}
              placeholder="Nom complet"
              className="border p-2 w-full"
              required
            />
            <select
              value={form.specialty}
              onChange={e => setField("specialty", e.target.value)}
              className="border p-2 w-full"
              required
            >
              <option value="">Choisir spécialité</option>
              <option value="medecin_generaliste">Médecin Généraliste</option>
              <option value="cardiologue">Cardiologue</option>
              <option value="pediatre">Pédiatre</option>
              <option value="chirurgien">Chirurgien</option>
              <option value="radiologue">Radiologue</option>
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={e => setField("email", e.target.value)}
                placeholder="Email"
                className="border p-2"
                required
              />
              <input
                name="phone"
                value={form.phone}
                onChange={e => setField("phone", e.target.value)}
                placeholder="Téléphone"
                className="border p-2"
              />
            </div>

            <textarea
              value={form.notes}
              onChange={e => setField("notes", e.target.value)}
              className="border p-2 w-full"
              placeholder="Notes / bio"
            />

            <div>
              <label className="block font-medium">Statut</label>
              <select
                value={form.status}
                onChange={e => setField("status", e.target.value)}
                className="border p-2 w-full"
              >
                <option value="Disponible">Disponible</option>
                <option value="Occupé">Occupé</option>
                <option value="Absent">Absent</option>
                <option value="En congé">En congé</option>
              </select>
            </div>

            <div>
              <h3 className="font-semibold">Horaires</h3>
              {form.schedule.map((d, di) => (
                <div key={d.day} className="mb-3 border p-2 rounded">
                  <div className="flex justify-between items-center">
                    <strong>{d.day}</strong>
                    <button type="button" onClick={() => addSlot(di)} className="text-sm text-indigo-600">+ Ajouter</button>
                  </div>
                  {d.slots.length === 0 && <div className="text-sm text-gray-500">Aucun créneau</div>}
                  {d.slots.map((s, si) => (
                    <div key={si} className="flex items-center gap-2 mt-2">
                      <input
                        type="time"
                        value={s.start}
                        onChange={e => updateSlot(di, si, "start", e.target.value)}
                        className="border p-1"
                      />
                      <span>-</span>
                      <input
                        type="time"
                        value={s.end}
                        onChange={e => updateSlot(di, si, "end", e.target.value)}
                        className="border p-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeSlot(di, si)}
                        className="px-2 py-1 border rounded text-sm text-red-600"
                      >
                        Suppr
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-semibold">Congés / Absences</h3>
              {form.absences.length === 0 && <div className="text-sm text-gray-500">Aucun congé</div>}
              {form.absences.map((a, i) => (
                <div key={i} className="flex items-center gap-2 mt-2">
                  <input
                    type="date"
                    value={a.from}
                    onChange={e => updateAbsence(i, "from", e.target.value)}
                    className="border p-1"
                  />
                  <input
                    type="date"
                    value={a.to}
                    onChange={e => updateAbsence(i, "to", e.target.value)}
                    className="border p-1"
                  />
                  <input
                    placeholder="Raison"
                    value={a.reason}
                    onChange={e => updateAbsence(i, "reason", e.target.value)}
                    className="border p-1 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeAbsence(i)}
                    className="px-2 py-1 border rounded text-sm text-red-600"
                  >
                    Suppr
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAbsence}
                className="mt-2 px-3 py-1 border rounded text-sm"
              >
                + Ajouter congé
              </button>
            </div>

            <div>
              <label className="block mt-2">Photo</label>
              <input type="file" accept="image/*" onChange={handleFile} />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => navigate("/docteurs")}
                className="px-4 py-2 border rounded"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
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

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiPlus } from "react-icons/fi";
import { getDoctors, deleteDoctor } from "./doctorService";
import Sidebar from "../Sidebar"; // Importation du Sidebar

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true); // Gérer l'état du Sidebar
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000"; // URL de base

  const fetchDoctors = async (params = {}) => {
    try {
      setLoading(true);
      const data = await getDoctors(params);
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur fetch doctors:", err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // local filtering (fast) + we keep possibility to request backend with params
  const filtered = doctors.filter(d => {
    const q = (search || "").trim().toLowerCase();
    const matchSearch =
      !q ||
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.email && d.email.toLowerCase().includes(q));
    const matchSpec = !specialtyFilter || (d.specialty && d.specialty === specialtyFilter);
    return matchSearch && matchSpec;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression du médecin ?")) return;
    try {
      await deleteDoctor(id);
      setDoctors(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Impossible de supprimer le médecin.");
    }
  };

  // Fonction pour afficher la photo correctement
  const displayPhoto = (photo) => {
    // Si la photo est une URL relative, la compléter avec l'URL de base
    if (photo && !photo.startsWith('http')) {
      return `${API_BASE}${photo}`;
    }
    return photo;
  };

  // optional: call API with filter (uncomment to use)
  const applyServerFilter = async () => {
    const params = {};
    if (search) params.q = search;
    if (specialtyFilter) params.specialty = specialtyFilter;
    await fetchDoctors(params);
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
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Médecins</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/docteurs/ajouter")}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded"
              >
                <FiPlus /> Ajouter
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex items-center gap-2 border rounded px-2 flex-1">
              <input
                aria-label="Recherche médecins"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 outline-none w-full"
              />
            </div>

            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Toutes spécialités</option>
              <option value="medecin_generaliste">Médecin Généraliste</option>
              <option value="cardiologue">Cardiologue</option>
              <option value="pediatre">Pédiatre</option>
              <option value="chirurgien">Chirurgien</option>
              <option value="radiologue">Radiologue</option>
              <option value="infirmier">Infirmier</option>
              <option value="administratif">Administratif</option>
              <option value="technicien">Technicien</option>
            </select>

            <div className="flex items-center gap-2">
              <button onClick={() => applyServerFilter()} className="px-3 py-2 border rounded">Appliquer</button>
              <button onClick={() => { setSearch(""); setSpecialtyFilter(""); fetchDoctors(); }} className="px-3 py-2 border rounded">Réinitialiser</button>
            </div>
          </div>

          {loading ? (
            <div>Chargement...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(d => (
                <div key={d._id} className="p-4 bg-white rounded shadow flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                      {d.photo ? (
                        <img src={displayPhoto(d.photo)} alt={d.name} className="object-cover w-full h-full" />
                      ) : (
                        <FiUser size={28} />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-sm text-gray-600">{d.specialty}</div>
                      <div className="text-sm text-gray-500">{d.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/docteurs/${d._id}`)} className="px-3 py-1 border rounded">Voir</button>
                    <button onClick={() => navigate(`/docteurs/${d._id}/edit`)} className="px-3 py-1 bg-yellow-50 rounded">Modifier</button>
                    <button onClick={() => handleDelete(d._id)} className="px-3 py-1 bg-red-50 text-red-600 rounded">Supprimer</button>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && <div className="text-gray-500">Aucun médecin trouvé.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

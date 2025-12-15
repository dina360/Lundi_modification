import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUser, FiPhone, FiMapPin, FiFolder, FiSearch } from "react-icons/fi";

function MedecinPatientsList() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  // Charger les patients
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/patients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
      } catch (err) {
        console.error("Erreur chargement patients :", err);
        setError("Impossible de charger la liste des patients.");
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [token]);

  // Filtrer les patients en fonction de la recherche
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  const handleViewDossier = (patientId) => {
    navigate(`/patients/${patientId}/dossier`);
  };

  if (loading) return <div className="p-6 text-center">Chargement des patients...</div>;
  if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-800 flex items-center">
        <FiUser className="mr-3" /> Liste des Patients
      </h1>

      {/* Barre de recherche */}
      <div className="mb-6 flex items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Grille des patients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            Aucun patient trouvé.
          </div>
        ) : (
          filteredPatients.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FiUser className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{p.name}</h2>
                  <p className="text-gray-600 text-sm">{p.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-gray-600">
                {p.phone && (
                  <div className="flex items-center">
                    <FiPhone className="mr-2 text-gray-500" /> {p.phone}
                  </div>
                )}
                {p.address && (
                  <div className="flex items-center">
                    <FiMapPin className="mr-2 text-gray-500" /> {p.address}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={() => handleViewDossier(p._id)}
                  className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <FiFolder className="mr-2" /> Voir Dossier Médical
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MedecinPatientsList;
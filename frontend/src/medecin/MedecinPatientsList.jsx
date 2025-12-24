import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUser, FiPhone, FiMapPin, FiFolder, FiCalendar, FiSearch, FiX } from "react-icons/fi";

function MedecinPatientsList() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointmentsModal, setAppointmentsModal] = useState(null); // Pour stocker les RDV d’un patient
  const [appointments, setAppointments] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

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

  // Fonction pour charger les RDV d’un patient
  const loadAppointments = async (patientId) => {
    setModalLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/appointments/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
      setAppointmentsModal(patientId);
    } catch (err) {
      console.error("Erreur chargement RDV :", err);
      alert("Erreur lors du chargement des rendez-vous.");
    } finally {
      setModalLoading(false);
    }
  };

  const closeAppointmentsModal = () => {
    setAppointmentsModal(null);
    setAppointments([]);
  };

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

              <div className="mt-4 flex flex-col space-y-3">
                <button
                  onClick={() => handleViewDossier(p._id)}
                  className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <FiFolder className="mr-2" /> Voir Dossier Médical
                </button>

                {/* Bouton "Voir Rendez-vous" */}
                <button
                  onClick={() => loadAppointments(p._id)}
                  className="w-full flex items-center justify-center  bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <FiCalendar className="mr-2" /> Voir Rendez-vous
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal pour afficher les rendez-vous */}
      {appointmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Rendez-vous de {filteredPatients.find(p => p._id === appointmentsModal)?.name}</h3>
              <button
                onClick={closeAppointmentsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-4">
              {modalLoading ? (
                <p className="text-center text-gray-500">Chargement des rendez-vous...</p>
              ) : appointments.length === 0 ? (
                <p className="text-center text-gray-500">Aucun rendez-vous pour ce patient.</p>
              ) : (
                <ul className="space-y-3">
                  {appointments.map((r) => (
                    <li key={r._id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="font-semibold text-gray-800">
                        {new Date(r.date).toLocaleDateString('fr-FR')} à {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        Médecin: {r.medecin.name}
                      </div>
                      {r.notes && (
                        <div className="text-gray-700 text-sm mt-1">
                          Notes: {r.notes}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedecinPatientsList;
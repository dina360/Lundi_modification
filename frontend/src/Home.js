import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AddPatientModal from './AddPatientModal';
import EditPatientModal from './EditPatientModal';
import { 
  FiHome, FiUsers, FiCalendar, FiUserPlus, FiSearch, FiLogOut, 
  FiBarChart2, FiActivity, FiClock, FiTrendingUp, FiBell,
  FiChevronRight, FiEye, FiEdit, FiTrash2, FiFilter, FiDownload
} from 'react-icons/fi';
import Sidebar from './Sidebar';

function Home() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    todayAppointments: 0,
    activePatients: 0,
    occupancyRate: 78
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/patients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(response.data);
        setStats({
          total: response.data.length,
          todayAppointments: response.data.filter(p => p.nextAppointment && 
            new Date(p.nextAppointment).toDateString() === new Date().toDateString()).length,
          activePatients: response.data.filter(p => p.status === 'active' || !p.status).length,
          occupancyRate: 78
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des patients:', error);
      }
    };
    fetchPatients();
  }, []);

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredPatients = patients.filter(patient =>
    (patient.name && patient.name.toLowerCase().includes(search.toLowerCase())) ||
    (patient.dossier && patient.dossier.toString().includes(search))
  );

  const addPatient = async (formPayload) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:5000/api/patients',
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setPatients((prev) => [...prev, response.data]);
      setStats(prev => ({ ...prev, total: prev.total + 1 }));
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
    }
  };

  const editPatient = async (updatedPatient) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `http://localhost:5000/api/patients/${updatedPatient._id}`,
        updatedPatient,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatients(patients.map(p => p._id === updatedPatient._id ? response.data : p));
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };

  const handleDelete = async (_id) => {
    if (window.confirm('Confirmer la suppression du patient ?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:5000/api/patients/${_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(patients.filter(p => p._id !== _id));
        setStats(prev => ({ ...prev, total: prev.total - 1 }));
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const handleViewDossier = (patientId) => navigate(`/dossier-patient/${patientId}`);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="patients"
      />

      <div className={`transition-all duration-300 min-h-screen ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-800 via-royalblue-900 to-blue-900 text-white p-8 -mt-8 -mx-8 mb-8 shadow-2xl border-b-4 border-gold-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <FiUsers className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Gestion des Patients</h1>
                  <p className="text-blue-100 mt-2 text-lg">
                    Centre Hospitalier NeoHealth • Suivi médical complet
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors">
                <FiBell className="text-xl" />
              </button>
              <div className="text-right">
                <div className="text-blue-200 text-sm">Bonjour, Administrateur</div>
                <div className="text-white font-semibold">Plateforme Médicale</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Patients Totaux</div>
                  <div className="text-3xl font-bold text-white mt-2">{stats.total}</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiUsers className="text-2xl text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm text-green-300">
                <FiTrendingUp className="mr-2" />
                +12% ce mois-ci
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">RDV Aujourd'hui</div>
                  <div className="text-3xl font-bold text-white mt-2">{stats.todayAppointments}</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiCalendar className="text-2xl text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm text-blue-300">
                <FiClock className="mr-2" />
                Prochain RDV: 08:30
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Patients Actifs</div>
                  <div className="text-3xl font-bold text-white mt-2">{stats.activePatients}</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiActivity className="text-2xl text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm text-green-300">
                <FiTrendingUp className="mr-2" />
                Taux d'activité: 92%
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Taux d'Occupation</div>
                  <div className="text-3xl font-bold text-white mt-2">{stats.occupancyRate}%</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiBarChart2 className="text-2xl text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm text-yellow-300">
                <FiTrendingUp className="mr-2" />
                +5% cette semaine
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4">
          {/* Search and Actions Bar */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-2xl">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-300 font-medium"
                  placeholder="Rechercher un patient par nom, numéro de dossier..."
                />
              </div>
              <div className="flex items-center space-x-4 ml-6">
                <button className="flex items-center space-x-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200">
                  <FiFilter className="text-lg" />
                  <span>Filtrer</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-semibold transition-all duration-300 border-2 border-blue-200">
                  <FiDownload className="text-lg" />
                  <span>Exporter</span>
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-blue-900"
                >
                  <FiUserPlus className="text-xl" />
                  <span>Nouveau Patient</span>
                </button>
              </div>
            </div>
          </div>

          {/* Patients Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            {filteredPatients.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-800 to-blue-900 border-b-4 border-blue-700">
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Dossier
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Dernier RDV
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Prochain RDV
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPatients.map((patient) => (
                        <tr key={patient._id} className="hover:bg-blue-50/50 transition-colors duration-200 group">
                          <td className="px-8 py-6">
                            <span className="bg-blue-100 text-blue-900 px-4 py-2 rounded-full font-bold text-sm">
                              #{patient.dossier || 'N/A'}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                {patient.photo ? (
                                  <img
                                    src={`http://localhost:5000${patient.photo}`}
                                    alt={patient.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-900 font-bold border-2 border-white shadow-lg">
                                    {patient.name?.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-lg">{patient.name}</div>
                                <div className="text-sm text-gray-500">
                                  {patient.age ? `${patient.age} ans` : 'Âge non renseigné'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-2">
                              <div className="text-gray-900 font-medium">{patient.phone || '-'}</div>
                              <div className="text-gray-600 text-sm">{patient.email || '-'}</div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-gray-900 font-medium">
                              {patient.lastAppointment
                                ? new Date(patient.lastAppointment).toLocaleDateString('fr-FR')
                                : 'N/A'}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-gray-900 font-medium">
                              {patient.nextAppointment
                                ? new Date(patient.nextAppointment).toLocaleDateString('fr-FR')
                                : 'N/A'}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full border-2 ${
                              patient.nextAppointment 
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }`}>
                              {patient.nextAppointment ? 'Suivi en cours' : 'En attente'}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleViewDossier(patient._id)}
                                className="p-3 text-blue-900 hover:text-white hover:bg-blue-900 rounded-xl transition-all duration-300 border-2 border-blue-900 hover:border-blue-800"
                                title="Voir dossier"
                              >
                                <FiEye className="text-xl" />
                              </button>
                              <button
                                onClick={() => { setSelectedPatient(patient); setIsEditModalOpen(true); }}
                                className="p-3 text-green-700 hover:text-white hover:bg-green-700 rounded-xl transition-all duration-300 border-2 border-green-700 hover:border-green-600"
                                title="Modifier"
                              >
                                <FiEdit className="text-xl" />
                              </button>
                              <button
                                onClick={() => handleDelete(patient._id)}
                                className="p-3 text-red-700 hover:text-white hover:bg-red-700 rounded-xl transition-all duration-300 border-2 border-red-700 hover:border-red-600"
                                title="Supprimer"
                              >
                                <FiTrash2 className="text-xl" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Table Footer */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-700 font-semibold">
                      {filteredPatients.length} patient(s) trouvé(s)
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                        ← Précédent
                      </button>
                      <span className="text-gray-700">Page 1 sur 1</span>
                      <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                        Suivant →
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-16 text-center">
                <div className="text-7xl mb-6">👥</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {search ? "Aucun patient trouvé" : "Aucun patient enregistré"}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {search 
                    ? "Aucun patient ne correspond à votre recherche." 
                    : "Commencez par ajouter votre premier patient."}
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl border-2 border-blue-900"
                >
                  <FiUserPlus className="text-xl" />
                  <span>Ajouter un Patient</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques Rapides</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Moyenne d'âge</span>
                  <span className="font-bold text-blue-900">42 ans</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nouveaux ce mois</span>
                  <span className="font-bold text-green-600">+8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taux de fidélité</span>
                  <span className="font-bold text-purple-600">94%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Prochains RDV</h3>
              <div className="space-y-3">
                {filteredPatients
                  .filter(p => p.nextAppointment)
                  .slice(0, 3)
                  .map((patient, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold">
                          {patient.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(patient.nextAppointment).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <FiChevronRight className="text-gray-400" />
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-blue-50 text-blue-900 font-medium rounded-xl hover:bg-blue-100 transition-colors text-left px-4">
                  📊 Générer un rapport
                </button>
                <button className="w-full py-3 bg-green-50 text-green-900 font-medium rounded-xl hover:bg-green-100 transition-colors text-left px-4">
                  📧 Envoyer des rappels
                </button>
                <button className="w-full py-3 bg-purple-50 text-purple-900 font-medium rounded-xl hover:bg-purple-100 transition-colors text-left px-4">
                  📅 Planifier des consultations
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {isAddModalOpen && (
          <AddPatientModal 
            onClose={() => setIsAddModalOpen(false)} 
            onAddPatient={addPatient}
          />
        )}

        {isEditModalOpen && (
          <EditPatientModal 
            patient={selectedPatient}
            onClose={() => setIsEditModalOpen(false)}
            onEditPatient={editPatient}
          />
        )}
      </div>
    </div>
  );
}

export default Home;
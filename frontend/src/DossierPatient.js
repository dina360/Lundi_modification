// src/DossierPatient.js
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiFileText,
  FiPhone,
  FiHome,
  FiCalendar,
  FiUpload,
  FiDownload,
  FiTrash2,
  FiArrowLeft,
  FiMail,
  FiActivity,
  FiHeart,
  FiThermometer,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import Sidebar from "./Sidebar";

function DossierPatient() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("documents"); // documents | infos

  const token = localStorage.getItem("authToken");

  const extractDocuments = (data) => {
    if (!data) return [];
    return data.medicalRecords || data.documents || data.dossier || [];
  };

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!token) {
        navigate("/login");
        return;
      }
      if (!patientId) {
        setError("Aucun patient spécifié.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`http://localhost:5000/api/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPatient(res.data);
        setDocuments(extractDocuments(res.data));
      } catch (err) {
        console.error("Erreur dossier patient:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
          return;
        }

        setError(err.response?.data?.message || "Erreur lors de la récupération du dossier patient.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [patientId, token, navigate]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
      setError(null);
      setUploadSuccess(null);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }
    if (!token) return navigate("/login");

    const formData = new FormData();
    formData.append("document", selectedFile);

    try {
      setError(null);
      setUploadSuccess(null);

      const res = await axios.post(
        `http://localhost:5000/api/patients/${patientId}/dossier`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // plusieurs formats possibles
      if (res.data?.document) setDocuments((prev) => [...prev, res.data.document]);
      else if (res.data?.documents || res.data?.medicalRecords) setDocuments(extractDocuments(res.data));
      else if (res.data?.patient) setDocuments(extractDocuments(res.data.patient));

      setSelectedFile(null);
      setUploadSuccess("Document ajouté avec succès !");
    } catch (err) {
      console.error("Erreur upload document:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/login");
        return;
      }

      setError(err.response?.data?.error || "Erreur lors de l'ajout du document.");
    }
  };

  const handleDeleteDocument = async (docUrlOrObj) => {
    const url = typeof docUrlOrObj === "string" ? docUrlOrObj : docUrlOrObj?.url;
    if (!url) {
      setError("URL du document invalide.");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
    if (!token) return navigate("/login");

    try {
      setError(null);

      const res = await axios.delete(
        `http://localhost:5000/api/patients/${patientId}/dossier`,
        {
          data: { document: url },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.documents || res.data?.medicalRecords) setDocuments(extractDocuments(res.data));
      else if (res.data?.patient) setDocuments(extractDocuments(res.data.patient));
      else setDocuments((prev) => prev.filter((d) => (typeof d === "string" ? d : d.url) !== url));
    } catch (err) {
      console.error("Erreur suppression document:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/login");
        return;
      }

      setError(err.response?.data?.error || "Erreur lors de la suppression.");
    }
  };

  const getDocUrl = (doc) => {
    const raw = typeof doc === "string" ? doc : doc?.url;
    if (!raw) return "#";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    return `http://localhost:5000${raw.startsWith("/") ? raw : "/" + raw}`;
  };

  const getDocName = (doc, index) => {
    if (typeof doc === "string") {
      const parts = doc.split("/");
      return parts[parts.length - 1] || `Document ${index + 1}`;
    }
    return doc?.name || `Document ${index + 1}`;
  };

  const patientAge = useMemo(() => {
    const a = parseInt(patient?.age);
    return Number.isFinite(a) ? a : null;
  }, [patient]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Chargement du dossier médical</h3>
          <p className="text-gray-600">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-xl w-full">
          <div className="flex items-center text-red-700 font-semibold">
            <FiAlertCircle className="mr-3" />
            {error}
          </div>
          <button
            onClick={() => navigate("/patients")}
            className="mt-6 px-6 py-3 bg-blue-900 text-white rounded-xl font-semibold hover:bg-blue-800"
          >
            Retour aux patients
          </button>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} active="patients" />

      <div className={`transition-all duration-300 min-h-screen ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-800 via-royalblue-900 to-blue-900 text-white p-8 -mt-8 -mx-8 mb-8 shadow-2xl border-b-4 border-gold-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/patients")}
                className="p-3 bg-white/15 hover:bg-white/25 rounded-2xl border border-white/20 transition"
                title="Retour"
              >
                <FiArrowLeft className="text-2xl" />
              </button>

              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <FiFileText className="text-2xl text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">Dossier Médical</h1>
                <p className="text-blue-100 mt-2 text-lg">
                  {patient?.name || "Patient"} • Dossier #{patient?.dossier || "N/A"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-blue-200 text-sm">Dernière mise à jour</div>
              <div className="text-white font-semibold">
                {patient?.updatedAt ? new Date(patient.updatedAt).toLocaleString("fr-FR") : "—"}
              </div>
            </div>
          </div>

          {/* Quick info cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Email</div>
                  <div className="text-lg font-bold text-white mt-2 truncate">
                    {patient?.email || "—"}
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiMail className="text-2xl text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Téléphone</div>
                  <div className="text-lg font-bold text-white mt-2">{patient?.phone || "—"}</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiPhone className="text-2xl text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Âge</div>
                  <div className="text-lg font-bold text-white mt-2">{patientAge ? `${patientAge} ans` : "—"}</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiUser className="text-2xl text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Documents</div>
                  <div className="text-lg font-bold text-white mt-2">{documents.length}</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiActivity className="text-2xl text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 pb-10">
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 mb-6 flex space-x-2">
            <button
              onClick={() => setActiveTab("documents")}
              className={`flex-1 py-3 rounded-xl font-bold transition ${
                activeTab === "documents" ? "bg-blue-900 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab("infos")}
              className={`flex-1 py-3 rounded-xl font-bold transition ${
                activeTab === "infos" ? "bg-blue-900 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Informations
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-medium flex items-center">
              <FiAlertCircle className="mr-3" />
              {error}
            </div>
          )}
          {uploadSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl font-medium flex items-center">
              <FiCheckCircle className="mr-3" />
              {uploadSuccess}
            </div>
          )}

          {activeTab === "documents" ? (
            <>
              {/* Upload */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ajouter un document</h3>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full md:flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl"
                  />
                  <button
                    onClick={handleUploadDocument}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold"
                  >
                    <FiUpload />
                    <span>Uploader</span>
                  </button>
                </div>
              </div>

              {/* Documents list */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900">Documents du dossier</h3>
                  <p className="text-gray-600">PDF, images scannées, analyses, comptes rendus...</p>
                </div>

                {documents.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="text-7xl mb-6">📄</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucun document</h3>
                    <p className="text-gray-600">Ajoute le premier document médical du patient.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {documents.map((doc, idx) => (
                      <div key={(typeof doc === "string" ? doc : doc?.url) || idx} className="p-6 flex items-center justify-between hover:bg-blue-50/40 transition">
                        <div className="flex items-center space-x-4 min-w-0">
                          <div className="p-3 bg-blue-100 rounded-xl text-blue-900">
                            <FiFileText className="text-2xl" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 truncate">{getDocName(doc, idx)}</div>
                            <div className="text-sm text-gray-500 truncate">{getDocUrl(doc)}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <a
                            href={getDocUrl(doc)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 text-blue-900 hover:text-white hover:bg-blue-900 rounded-xl transition-all border-2 border-blue-900"
                            title="Télécharger / Ouvrir"
                          >
                            <FiDownload className="text-xl" />
                          </a>

                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            className="p-3 text-red-700 hover:text-white hover:bg-red-700 rounded-xl transition-all border-2 border-red-700"
                            title="Supprimer"
                          >
                            <FiTrash2 className="text-xl" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Informations patient</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center text-gray-800 font-bold mb-3">
                    <FiHome className="mr-3 text-blue-900" />
                    Adresse
                  </div>
                  <p className="text-gray-700">{patient?.address || patient?.adresse || "—"}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center text-gray-800 font-bold mb-3">
                    <FiCalendar className="mr-3 text-blue-900" />
                    Rendez-vous
                  </div>
                  <p className="text-gray-700">
                    Prochain: {patient?.nextAppointment ? new Date(patient.nextAppointment).toLocaleString("fr-FR") : "—"}
                  </p>
                  <p className="text-gray-700 mt-2">
                    Dernier: {patient?.lastAppointment ? new Date(patient.lastAppointment).toLocaleString("fr-FR") : "—"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center text-gray-800 font-bold mb-3">
                    <FiHeart className="mr-3 text-blue-900" />
                    Statut
                  </div>
                  <p className="text-gray-700">{patient?.status || "active"}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center text-gray-800 font-bold mb-3">
                    <FiThermometer className="mr-3 text-blue-900" />
                    Observations
                  </div>
                  <p className="text-gray-700">{patient?.notes || patient?.observation || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {/* footer actions */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => navigate("/patients")}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DossierPatient;

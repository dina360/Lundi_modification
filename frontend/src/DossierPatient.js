import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiFileText, FiPhone, FiHome, FiCalendar, 
  FiUpload, FiDownload, FiTrash2, FiArrowLeft,
  FiPrinter, FiShare2, FiEdit, FiMail,
  FiActivity, FiHeart, FiThermometer
} from 'react-icons/fi';
import Sidebar from './Sidebar';

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
  const [activeTab, setActiveTab] = useState('documents');

  const extractDocuments = (data) => {
    if (!data) return [];
    return data.medicalRecords || data.documents || data.dossier || [];
  };

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `http://localhost:5000/api/patients/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPatient(response.data);
        setDocuments(extractDocuments(response.data));
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Erreur lors de la récupération des détails du patient");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) fetchPatientDetails();
    else {
      setError("Aucun patient spécifié");
      setLoading(false);
    }
  }, [patientId, token]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
      setUploadSuccess(null);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/patients/${patientId}/dossier`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.document) setDocuments(prev => [...prev, response.data.document]);
      else if (response.data?.documents || response.data?.medicalRecords) setDocuments(extractDocuments(response.data));
      else if (response.data?.patient) setDocuments(extractDocuments(response.data.patient));

      setSelectedFile(null);
      setUploadSuccess("Document ajouté avec succès !");
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Erreur lors de l'ajout du document");
      setUploadSuccess(null);
    }
  };

  const handleDeleteDocument = async (docUrlOrObj) => {
    const url = typeof docUrlOrObj === "string" ? docUrlOrObj : docUrlOrObj.url;
    if (!url) {
      setError("URL du document invalide.");
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/patients/${patientId}/dossier`,
        {
          data: { document: url },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.documents || response.data?.medicalRecords) setDocuments(extractDocuments(response.data));
      else if (response.data?.patient) setDocuments(extractDocuments(response.data.patient));
      else setDocuments(prev => prev.filter(d => (typeof d === "string" ? d : d.url) !== url));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const getDocUrl = (doc) => {
    const raw = typeof doc === "string" ? doc : doc.url;
    if (!raw) return "#";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    return `http://localhost:5000${raw.startsWith("/") ? raw : "/" + raw}`;
  };

  const getDocName = (doc, index) => {
    if (typeof doc === "string") {
      const parts = doc.split("/");
      return parts[parts.length - 1] || `Document ${index + 1}`;
    }
    return doc.name || `Document ${index + 1}`;
  };

  if (loading) return <div>Chargement du dossier...</div>;
  if (error && !patient) return <div>{error}</div>;
  if (!patient) return null;

  return (
    <div>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} active="patients" />
      <div>
        {/* Header, Onglets, Upload, Liste documents, Stats... */}
        {/* Le code UI reste inchangé */}
      </div>
    </div>
  );
}

export default DossierPatient;

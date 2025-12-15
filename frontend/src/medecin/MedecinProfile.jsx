import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiUser, FiCamera, FiSave, FiMail, FiPhone, FiMapPin, FiClock, FiX, FiCheck } from "react-icons/fi";
import ToastNotification from "../ToastNotification"; 

export default function MedecinProfile() {
  const [medecin, setMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("/avatar.png");
  const [rdvs, setRdvs] = useState([]);
  const [editForm, setEditForm] = useState({
    name: "",
    specialty: "",
    phone: "",
    address: "",
  });

  // 🔹 État pour le toast
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("authToken");

  // Fonction pour afficher un toast
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Disparaît après 3 secondes
  };

  // 🔹 Charger le médecin depuis localStorage
  useEffect(() => {
    const medecinStr = localStorage.getItem("medecin");
    let userData = null;

    try {
      if (medecinStr) {
        userData = JSON.parse(medecinStr);
        if (!userData.id && !userData._id) {
          throw new Error("Objet médecin invalide : pas d'id ou _id");
        }
      }
    } catch (e) {
      console.error("Erreur parsing medecin:", e);
      setError("Erreur de chargement du profil.");
      setLoading(false);
      return;
    }

    if (userData) {
      setMedecin(userData);
      // 🔹 Gestion du chemin de la photo
      const photoUrl = userData.photo && !userData.photo.startsWith('http')
        ? `http://localhost:5000${userData.photo}`
        : userData.photo || "/avatar.png";
      setPreview(photoUrl);
      setEditForm({
        name: userData.name || "",
        specialty: userData.specialty || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });
    } else {
      setError("Médecin non connecté. Reconnectez-vous.");
    }

    setLoading(false);
  }, []);

  // 🔁 Charger les RDV du jour
  useEffect(() => {
    if (!medecin || !medecin.id || !token) return;

    const fetchRdvs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const myRdvs = res.data.filter((r) => r.medecin._id === medecin.id);
        const today = new Date().toISOString().split("T")[0];
        const todayRdvs = myRdvs.filter((r) => r.date.split("T")[0] === today);
        setRdvs(todayRdvs);
      } catch (err) {
        console.error("Erreur chargement RDV:", err);
        showToast("Erreur lors du chargement des rendez-vous.", "error");
      }
    };

    fetchRdvs();
  }, [medecin, token]);

  const handleUpload = async () => {
    if (!medecin || !medecin.id) {
      showToast("Médecin non connecté.", "error");
      return;
    }

    if (!photo) {
      showToast("Veuillez sélectionner une image.", "error");
      return;
    }

    try {
      const form = new FormData();
      form.append("photo", photo);

      const res = await axios.post(
        `http://localhost:5000/api/medecins/uploadPhoto/${medecin.id}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔹 Mise à jour du preview et stockage local
      const photoUrl = !res.data.photo.startsWith('http')
        ? `http://localhost:5000${res.data.photo}`
        : res.data.photo;

      setPreview(photoUrl);
      showToast("✅ Photo mise à jour avec succès.", "success");

      // Mettre à jour dans le localStorage
      const updatedMedecin = { ...medecin, photo: res.data.photo };
      localStorage.setItem("medecin", JSON.stringify(updatedMedecin));
      setMedecin(updatedMedecin);

    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      showToast("❌ Erreur lors de l'upload de l'image.", "error");
    }
  };

  const handleSaveProfile = async () => {
    if (!medecin || !medecin.id) return;

    try {
      // Remplace par une route backend si elle existe, sinon afficher un message
      showToast("✅ Profil mis à jour dans localStorage (route backend manquante)", "success");
      const updatedMedecin = { ...medecin, ...editForm };
      localStorage.setItem("medecin", JSON.stringify(updatedMedecin));
      setMedecin(updatedMedecin);
    } catch (error) {
      showToast("❌ Erreur lors de la mise à jour du profil.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow max-w-md w-full">
          <div className="flex items-center">
            <FiX className="text-red-500 text-2xl mr-3" />
            <h2 className="text-lg font-bold text-red-700">Erreur</h2>
          </div>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FiUser className="text-blue-600 text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mon Profil</h1>
              <p className="text-gray-600">Gérez vos informations personnelles</p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section : Photo de profil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiCamera className="mr-2 text-blue-600" /> Photo de Profil
              </h2>
              <div className="flex flex-col items-center">
                <img
                  src={preview}
                  alt="Photo de profil"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-300 shadow"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  className="mt-4 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  onClick={handleUpload}
                  className="mt-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 flex items-center"
                >
                  <FiCamera className="mr-2" /> Mettre à jour
                </button>
              </div>
            </div>
          </div>

          {/* Section : Informations personnelles */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiUser className="mr-2 text-blue-600" /> Informations Personnelles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 flex items-center">
                    <FiUser className="mr-2 text-gray-500" /> Nom
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 flex items-center">
                    <FiUser className="mr-2 text-gray-500" /> Spécialité
                  </label>
                  <input
                    type="text"
                    value={editForm.specialty}
                    onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 flex items-center">
                    <FiMail className="mr-2 text-gray-500" /> Email
                  </label>
                  <p className="p-3 bg-gray-100 rounded-lg">{medecin.email}</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 flex items-center">
                    <FiPhone className="mr-2 text-gray-500" /> Téléphone
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2 flex items-center">
                    <FiMapPin className="mr-2 text-gray-500" /> Adresse
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-800 flex items-center"
              >
                <FiSave className="mr-2" /> Enregistrer les modifications
              </button>
            </div>

            {/* Section : Rendez-vous du jour */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiClock className="mr-2 text-green-600" /> Rendez-vous du Jour
              </h2>
              {rdvs.length === 0 ? (
                <p className="text-gray-500">Aucun rendez-vous aujourd'hui.</p>
              ) : (
                <ul className="space-y-3">
                  {rdvs.map((r) => (
                    <li key={r._id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{r.patient.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <FiCheck className="text-green-500" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Zone pour afficher le toast */}
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
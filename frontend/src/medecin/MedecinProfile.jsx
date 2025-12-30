import { useState, useEffect } from "react";
import axios from "axios";

export default function MedecinProfile() {
  const [medecin, setMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("/avatar.png");
  const [msg, setMsg] = useState("");
  const [rdvs, setRdvs] = useState([]);
  const [editForm, setEditForm] = useState({
    name: "",
    specialty: "",
    phone: "",
    address: "",
  });

  const token = localStorage.getItem("authToken");

  // 🔹 Charger le médecin depuis localStorage
  useEffect(() => {
    const medecinStr = localStorage.getItem("medecin");
    let userData = null;

    try {
      if (medecinStr) {
        userData = JSON.parse(medecinStr);
        // Vérifier si l'objet contient un identifiant valide
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

  // 🔁 Charger les RDV du jour (uniquement si le médecin est chargé)
  useEffect(() => {
    if (!medecin || !medecin.id || !token) return;

    const fetchRdvs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // 🔹 Correction : Utilise `medecin.id` au lieu de `medecin._id`
        const myRdvs = res.data.filter((r) => r.medecin._id === medecin.id);
        const today = new Date().toISOString().split("T")[0];
        const todayRdvs = myRdvs.filter((r) => r.date.split("T")[0] === today);
        setRdvs(todayRdvs);
      } catch (err) {
        console.error("Erreur chargement RDV:", err);
      }
    };

    fetchRdvs();
  }, [medecin, token]);

  const handleUpload = async () => {
    if (!medecin || !medecin.id) { // 🔹 Correction : `id` au lieu de `_id`
      setMsg("❌ Médecin non connecté");
      return;
    }

    if (!photo) {
      setMsg("❌ Choisissez une image");
      return;
    }

    try {
      const form = new FormData();
      form.append("photo", photo);

      const res = await axios.post(
        `http://localhost:5000/api/medecins/uploadPhoto/${medecin.id}`, // 🔹 Correction : `id`
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
      setMsg("✅ Photo mise à jour");

      // Mettre à jour dans le localStorage
      const updatedMedecin = { ...medecin, photo: res.data.photo };
      localStorage.setItem("medecin", JSON.stringify(updatedMedecin));
      setMedecin(updatedMedecin);

    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      setMsg("❌ Erreur lors de l'upload de l'image");
    }
  };

  const handleSaveProfile = async () => {
    if (!medecin || !medecin.id) return; // 🔹 Correction : `id`

    try {
      // Remplace par une route backend si elle existe, sinon afficher un message
      setMsg("✅ Profil mis à jour dans localStorage (route backend manquante)");
      const updatedMedecin = { ...medecin, ...editForm };
      localStorage.setItem("medecin", JSON.stringify(updatedMedecin));
      setMedecin(updatedMedecin);
    } catch (error) {
      setMsg("❌ Erreur lors de la mise à jour du profil");
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Mon Profil</h2>

      {/* Section Photo + Informations */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Colonne gauche : Photo et upload */}
        <div className="flex flex-col items-center">
          <img
            src={preview}
            className="w-40 h-40 rounded-full object-cover border-4 border-blue-300"
            alt="Photo Médecin"
          />
          <input
            type="file"
            accept="image/*"
            className="mt-4"
            onChange={(e) => setPhoto(e.target.files[0])}
          />
          <button
            onClick={handleUpload}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Mettre à jour la photo
          </button>
          {msg && <p className="mt-2 text-green-600">{msg}</p>}
        </div>

        {/* Colonne droite : Informations */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-4">Informations personnelles</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-600">Nom</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600">Spécialité</label>
              <input
                type="text"
                value={editForm.specialty}
                onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600">Email</label>
              <p className="p-2 bg-gray-100 rounded">{medecin.email}</p>
            </div>
            <div>
              <label className="block text-gray-600">Téléphone</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600">Adresse</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Sauvegarder les modifications
            </button>
          </div>
        </div>
      </div>

      {/* Section RDV du jour */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Rendez-vous du jour</h3>
        {rdvs.length === 0 ? (
          <p className="text-gray-600">Aucun rendez-vous aujourd'hui.</p>
        ) : (
          <ul className="space-y-2">
            {rdvs.map((r) => (
              <li key={r._id} className="p-2 border rounded bg-gray-50">
                {r.patient.name} — {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
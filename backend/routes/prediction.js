// backend/routes/prediction.js
const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");

const router = express.Router();

// ============================
// Configuration microservice IA (Flask)
// ============================
const IA_URL = "http://localhost:5001/api/prediction/analyze";

// multer garde le fichier en mémoire (buffer)
const upload = multer({ storage: multer.memoryStorage() });

// ============================
// POST /api/prediction/analyze
// ============================
router.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    console.log("======================================");
    console.log("🧠 [IA] Requête reçue sur /api/prediction/analyze");

    // Log auth (utile pour vérifier JWT côté backend)
    console.log("🔐 Authorization header :", req.headers.authorization);

    // Vérification fichier
    if (!req.file) {
      console.log("❌ Aucun fichier reçu");
      return res.status(400).json({ error: "Aucun fichier envoyé" });
    }

    console.log("📄 Fichier reçu côté Node :");
    console.log("   - Nom :", req.file.originalname);
    console.log("   - Taille :", req.file.size, "bytes");
    console.log("   - Type :", req.file.mimetype);

    // Préparer le FormData pour l'envoyer à Flask
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    console.log("➡️ Appel du microservice IA :", IA_URL);

    const response = await axios.post(IA_URL, formData, {
      headers: formData.getHeaders(),
      timeout: 60000, // 60s pour les modèles lourds
    });

    console.log("✅ Réponse reçue depuis Flask");
    console.log("   - Status :", response.status);
    console.log("   - Data :", response.data);

    console.log("======================================");

    return res.json(response.data);
  } catch (error) {
    console.error("======================================");
    console.error("❌ Erreur lors de l'appel IA");

    // Erreur renvoyée par Flask
    if (error.response) {
      console.error("❌ Flask status :", error.response.status);
      console.error("❌ Flask data :", error.response.data);
      return res
        .status(error.response.status || 500)
        .json(
          error.response.data || { error: "Erreur renvoyée par le service IA" }
        );
    }

    // Erreur réseau / timeout / crash
    console.error("❌ Message :", error.message);
    console.error("======================================");

    return res.status(500).json({ error: "Erreur lors de l'analyse IA" });
  }
});

module.exports = router;

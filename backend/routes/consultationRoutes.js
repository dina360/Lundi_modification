// backend/routes/consultationRoutes.js
const express = require("express");
const Consultation = require("../models/Consultation");
const authMiddleware = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyRole");

const router = express.Router();

// POST /api/consultations
router.post("/", authMiddleware, verifyRole(["medecin"]), async (req, res) => {
  // 🔍 Validation du corps de la requête
  const { patient, medecin, date } = req.body;

  if (!patient || !medecin || !date) {
    return res.status(400).json({
      message: "Les champs 'patient', 'medecin' et 'date' sont obligatoires."
    });
  }

  try {
    const consultation = new Consultation(req.body);
    await consultation.save();
    res.status(201).json({ message: "Consultation enregistrée", consultation });
  } catch (error) {
    console.error("Erreur création consultation:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
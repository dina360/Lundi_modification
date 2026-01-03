// backend/routes/consultationRoutes.js
const express = require("express");
const Consultation = require("../models/Consultation");
const authMiddleware = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyRole");

const router = express.Router();

// POST /api/consultations
router.post("/", authMiddleware, verifyRole(["medecin"]), async (req, res) => {
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

// 🔹 Charger les consultations d’un patient spécifique
router.get('/patient/:patientId', authMiddleware, verifyRole(['medecin', 'admin']), async (req, res) => {
  try {
    const { patientId } = req.params;

    const consultations = await Consultation.find({ patient: patientId })
      .populate('medecin', 'name')
      .sort({ date: -1 }); // Du plus récent au plus ancien

    res.json(consultations);
  } catch (err) {
    console.error('Erreur chargement consultations patient:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// 🔹 Charger toutes les consultations (origin/main)
router.get("/", authMiddleware, verifyRole(["medecin", "admin"]), async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate("patient", "name")
      .populate("medecin", "name")
      .sort({ date: -1 });

    res.json(consultations);
  } catch (err) {
    console.error("Erreur chargement consultations:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;

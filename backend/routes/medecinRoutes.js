// backend/routes/medecinRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");

const router = express.Router();

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/medecins");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 📸 Upload ou mise à jour de la photo du médecin
router.post("/uploadPhoto/:id", upload.single("photo"), async (req, res) => {
  try {
    const medecin = await User.findById(req.params.id);
    if (!medecin || medecin.role !== "medecin")
      return res.status(404).json({ message: "Médecin introuvable" });

    medecin.photo = `/uploads/medecins/${req.file.filename}`;
    await medecin.save();

    res.json({
      message: "Photo mise à jour avec succès",
      photo: medecin.photo,
    });
  } catch (error) {
    console.error("Erreur upload photo:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;

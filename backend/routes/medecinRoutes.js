// backend/routes/medecinRoutes.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const Doctor = require("../models/Doctor"); // Assure-toi que ce modèle inclut le champ `userId`
const authMiddleware = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyRole");

const router = express.Router();

// Configuration du stockage
console.log(" 🔥 Chargement de medecinRoutes.js");
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

    // Mettre à jour Doctor aussi
    await Doctor.findOneAndUpdate({ userId: req.params.id }, { photo: medecin.photo });

    res.json({
      message: "Photo mise à jour avec succès",
      photo: medecin.photo,
    });
  } catch (error) {
    console.error("Erreur upload photo:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Mettre à jour le profil du médecin dans User ET Doctor
router.put('/profil/:id', authMiddleware, verifyRole(['medecin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, phone, address } = req.body;

    // Mettre à jour User
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, specialty, phone, address },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Médecin non trouvé dans User." });
    }

    // Mettre à jour Doctor via le champ userId
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { userId: id },
      { name, specialty, phone, address },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Médecin non trouvé dans Doctor." });
    }

    res.json({
      message: "Profil mis à jour avec succès.",
      user: updatedUser,
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
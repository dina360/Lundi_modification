// backend/routes/doctorRoutes.js

const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Doctor = require("../models/Doctor"); // Assure-toi que ce modèle inclut le champ `userId`
const router = express.Router();
const upload = require("../middleware/uploadDoctorPhoto");
const ctrl = require("../controllers/doctorController");

// 🔹 Créer un médecin ET son compte User
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { name, email, password, specialty, phone, notes } = req.body;

    // Vérifier si l'email existe déjà dans User
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le compte dans User
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "medecin",
      specialty,
      phone,
    });

    await user.save();

    // Créer le médecin dans Doctor
    const doctor = new Doctor({
      name,
      specialty,
      email,
      phone,
      notes: notes || "",
      photo: req.file ? `/uploads/doctors/${req.file.filename}` : "",
      status: "Disponible",
      userId: user._id, // 🔥 Lier le médecin à son compte User
    });

    await doctor.save();

    res.status(201).json({ message: "Médecin créé avec succès.", user, doctor });
  } catch (error) {
    console.error("Erreur création médecin:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🔹 Autres routes (héritées de ton contrôleur)
router.get("/", ctrl.getDoctors);
router.get("/:id", ctrl.getDoctorById);
router.put("/:id", upload.single("photo"), ctrl.updateDoctor);
router.delete("/:id", ctrl.deleteDoctor);

module.exports = router;
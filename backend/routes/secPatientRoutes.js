const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const SecPatient = require("../models/secPatientModel");

const router = express.Router();

// ===== Multer (photo + documents) =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ===== Helper: parse date "YYYY-MM-DD" =====
function parseBirthDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

// ========================
// POST /api/secpatients
// - accepte JSON (sans photo)
// - accepte multipart/form-data si tu ajoutes photo plus tard
// ========================
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const {
      name,
      dossier,
      phone,
      address,
      email,
      birthDate,
      status,
      bloodType,
      allergies,
      medicalHistory,
      notes,
    } = req.body;

    if (!name || !dossier || !phone || !address) {
      return res.status(400).json({
        message: "Champs obligatoires: name, dossier, phone, address.",
      });
    }

    // dossier unique
    const exists = await SecPatient.findOne({ dossier: String(dossier).trim() });
    if (exists) {
      return res.status(409).json({ message: "Numéro de dossier déjà existant." });
    }

    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const created = await SecPatient.create({
      name: String(name).trim(),
      dossier: String(dossier).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      email: email ? String(email).trim() : "",
      birthDate: parseBirthDate(birthDate),
      status: status || "active",
      bloodType: bloodType || "",
      allergies: allergies ? String(allergies).trim() : "",
      medicalHistory: medicalHistory ? String(medicalHistory).trim() : "",
      notes: notes ? String(notes).trim() : "",
      photo: photoPath,
      medicalRecords: [],
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error("Erreur création SecPatient:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l'ajout du patient.",
      details: error.message,
    });
  }
});

// GET /api/secpatients
router.get("/", async (req, res) => {
  try {
    const list = await SecPatient.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /api/secpatients/:id
router.get("/:id", async (req, res) => {
  try {
    const p = await SecPatient.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Patient non trouvé." });
    return res.json(p);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// PUT /api/secpatients/:id (photo optionnelle)
router.put("/:id", upload.single("photo"), async (req, res) => {
  try {
    const update = { ...req.body };

    if (update.birthDate !== undefined) {
      update.birthDate = parseBirthDate(update.birthDate);
    }

    if (req.file) update.photo = `/uploads/${req.file.filename}`;

    const updated = await SecPatient.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Patient non trouvé." });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ message: "Erreur mise à jour.", details: error.message });
  }
});

// DELETE /api/secpatients/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await SecPatient.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Patient non trouvé." });
    return res.json({ message: "Patient supprimé.", patient: deleted });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;

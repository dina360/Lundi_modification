// backend/routes/patientRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Patient = require("../models/patientModel");

const router = express.Router();

// =====================
// Multer config
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Helpers
function norm(v) {
  return typeof v === "string" ? v.trim() : v;
}
function parseDateOrNull(v) {
  if (!v) return null;
  const d = new Date(v); // "YYYY-MM-DD" OK
  if (isNaN(d.getTime())) return null;
  return d;
}

// =====================
// CRUD PATIENTS
// =====================

// POST /api/patients
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const {
      name,
      dossier,
      phone,
      email,
      address,
      birthDate,
      bloodGroup,
      allergies,
      medicalHistory,
      notes,
      status,
    } = req.body;

    // requis (selon modèle)
    if (!name || !dossier || !phone || !address) {
      return res.status(400).json({
        message: "Champs obligatoires: name, dossier, phone, address.",
      });
    }

    const dossierTrim = String(dossier).trim();
    const exists = await Patient.findOne({ dossier: dossierTrim });
    if (exists) {
      return res.status(409).json({ message: "Numéro de dossier déjà utilisé." });
    }

    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const bd = birthDate ? parseDateOrNull(birthDate) : null;
    if (birthDate && !bd) {
      return res.status(400).json({ message: "Date de naissance invalide." });
    }

    const patient = await Patient.create({
      name: norm(name),
      dossier: dossierTrim,
      phone: norm(phone),
      address: norm(address),
      email: email ? norm(email).toLowerCase() : "",
      birthDate: bd,

      bloodGroup: bloodGroup ? norm(bloodGroup) : "",
      allergies: allergies ? norm(allergies) : "",
      medicalHistory: medicalHistory ? norm(medicalHistory) : "",
      notes: notes ? norm(notes) : "",

      status: status || "active",
      photo: photoPath,
      medicalRecords: [],
    });

    return res.status(201).json(patient);
  } catch (error) {
    console.error("POST /api/patients error:", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Numéro de dossier déjà utilisé." });
    }
    return res.status(500).json({ message: error.message || "Erreur serveur." });
  }
});

// GET /api/patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    return res.json(patients);
  } catch (error) {
    console.error("GET /api/patients error:", error);
    return res.status(500).json({ message: error.message || "Erreur serveur." });
  }
});

// GET /api/patients/:_id
router.get("/:_id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params._id);
    if (!patient) return res.status(404).json({ message: "Patient non trouvé." });
    return res.json(patient);
  } catch (error) {
    console.error("GET /api/patients/:id error:", error);
    return res.status(500).json({ message: error.message || "Erreur serveur." });
  }
});

// PUT /api/patients/:_id
router.put("/:_id", upload.single("photo"), async (req, res) => {
  try {
    const id = req.params._id;
    const update = { ...req.body };

    // normalisation champs texte
    if (update.name !== undefined) update.name = norm(update.name);
    if (update.phone !== undefined) update.phone = norm(update.phone);
    if (update.address !== undefined) update.address = norm(update.address);
    if (update.email !== undefined) update.email = (norm(update.email) || "").toLowerCase();

    if (update.dossier !== undefined) {
      update.dossier = String(update.dossier).trim();
      const exists = await Patient.findOne({ dossier: update.dossier, _id: { $ne: id } });
      if (exists) return res.status(409).json({ message: "Numéro de dossier déjà utilisé." });
    }

    if (update.birthDate !== undefined) {
      if (!update.birthDate) update.birthDate = null;
      else {
        const d = parseDateOrNull(update.birthDate);
        if (!d) return res.status(400).json({ message: "Date de naissance invalide." });
        update.birthDate = d;
      }
    }

    if (req.file) update.photo = `/uploads/${req.file.filename}`;

    const updated = await Patient.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Patient non trouvé." });
    return res.json(updated);
  } catch (error) {
    console.error("PUT /api/patients/:id error:", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Numéro de dossier déjà utilisé." });
    }
    return res.status(500).json({ message: error.message || "Erreur serveur." });
  }
});

// DELETE /api/patients/:_id
router.delete("/:_id", async (req, res) => {
  try {
    const deleted = await Patient.findByIdAndDelete(req.params._id);
    if (!deleted) return res.status(404).json({ message: "Patient non trouvé." });
    return res.json({ message: "Patient supprimé.", patient: deleted });
  } catch (error) {
    console.error("DELETE /api/patients/:id error:", error);
    return res.status(500).json({ message: error.message || "Erreur serveur." });
  }
});

// =====================
// DOSSIERS MEDICAUX
// =====================

// POST /api/patients/:_id/dossier
router.post("/:_id/dossier", upload.single("document"), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params._id);
    if (!patient) return res.status(404).json({ message: "Patient non trouvé." });

    if (!req.file) return res.status(400).json({ message: "Aucun document reçu." });

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.BASE_URL || "https://votre-domaine.com"
        : "http://localhost:5000";

    const newDoc = {
      url: `${baseUrl}/uploads/${req.file.filename}`,
      name: req.file.originalname,
    };

    patient.medicalRecords.push(newDoc);
    await patient.save();

    return res.status(201).json({ document: newDoc, medicalRecords: patient.medicalRecords });
  } catch (error) {
    console.error("POST /api/patients/:id/dossier error:", error);
    return res.status(500).json({ message: error.message || "Erreur serveur." });
  }
});

// DELETE /api/patients/:_id/dossier
router.delete("/:_id/dossier", async (req, res) => {
  try {
    const { document: docUrl } = req.body;
    if (!docUrl) return res.status(400).json({ message: "URL du document obligatoire." });

    const patient = await Patient.findById(req.params._id);
    if (!patient) return res.status(404).json({ message: "Patient non trouvé." });

    const filename = String(docUrl).split("/").pop();
    const filePath = path.join(__dirname, "../uploads", filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    patient.medicalRecords = patient.medicalRecords.filter((doc) => doc.url !== docUrl);
    await patient.save();

    return res.json({ message: "Document supprimé.", medicalRecords: patient.medicalRecords });
  } catch (error) {
    console.error("DELETE /api/patients/:id/dossier error:", error);
    return res.status(500).json({ message: error.message || "Erreur serveur." });
  }
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Patient = require('../models/patientModel');

const router = express.Router();

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

/* --------- Routes de gestion des patients --------- */

// Ajouter un patient
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, dossier, phone, address } = req.body;
    if (!name || !dossier || !phone || !address) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;
    const newPatient = new Patient({ 
      name, 
      dossier, 
      phone, 
      address, 
      photo: photoPath,
      medicalRecords: [] 
    });

    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer tous les patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un patient par son ID
router.get('/:_id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params._id);
    if (!patient) return res.status(404).json({ error: "Patient non trouvé" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modifier un patient (mise à jour de la photo possible)
router.put('/:_id', upload.single('photo'), async (req, res) => {
  try {
    let updateData = req.body;
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }
    const updatedPatient = await Patient.findByIdAndUpdate(req.params._id, updateData, { new: true });
    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un patient
router.delete('/:_id', async (req, res) => {
  try {
    const deletedPatient = await Patient.findByIdAndDelete(req.params._id);
    if (!deletedPatient) return res.status(404).json({ error: "Patient non trouvé" });
    res.json({ message: "Patient supprimé", patient: deletedPatient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* --------- Routes pour la gestion des documents --------- */

// Après (correction)
router.post('/:_id/dossier', upload.single('document'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params._id);
    if (!patient) return res.status(404).json({ message: "Patient non trouvé" });

    if (!req.file) {
      return res.status(400).json({ error: "Aucun document reçu" });
    }

    const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://votre-domaine.com' 
    : 'http://localhost:5000';

  const newDocument = {
    url: `${baseUrl}/uploads/${req.file.filename}`,
    name: req.file.originalname
  };

  patient.medicalRecords.push(newDocument);
  await patient.save();
  res.status(201).json({ document: newDocument });
} catch (error) {
  res.status(500).json({ error: error.message });
}
});

// Supprimer un document
router.delete('/:_id/dossier', async (req, res) => {
  try {
    const { document: docUrl } = req.body;
    if (!docUrl) {
      return res.status(400).json({ error: "Le document à supprimer doit être spécifié" });
    }

    const patient = await Patient.findById(req.params._id);
    if (!patient) return res.status(404).json({ error: "Patient non trouvé" });

    // Suppression physique du fichier
    const filename = docUrl.split('/').pop();
    const filePath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    patient.medicalRecords = patient.medicalRecords.filter(doc => doc.url !== docUrl);
    await patient.save();

    res.json({ message: "Document supprimé", medicalRecords: patient.medicalRecords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


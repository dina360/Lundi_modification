// backend/controllers/staffController.js
const Staff = require("../models/staffModel");

// GET /api/staff  → récupérer tout le personnel
const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch (err) {
    console.error("Erreur getAllStaff:", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération du personnel" });
  }
};

// GET /api/staff/:id  → récupérer une personne par id
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Membre du personnel introuvable" });
    }
    res.json(staff);
  } catch (err) {
    console.error("Erreur getStaffById:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /api/staff  → créer un membre du personnel
const createStaff = async (req, res) => {
  try {
    const staff = new Staff(req.body);
    const saved = await staff.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Erreur createStaff:", err);
    res.status(400).json({ error: "Erreur lors de la création du personnel" });
  }
};

// PUT /api/staff/:id  → mettre à jour
const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!staff) {
      return res.status(404).json({ error: "Membre du personnel introuvable" });
    }
    res.json(staff);
  } catch (err) {
    console.error("Erreur updateStaff:", err);
    res.status(400).json({ error: "Erreur lors de la mise à jour" });
  }
};

// DELETE /api/staff/:id  → supprimer
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Membre du personnel introuvable" });
    }
    res.json({ message: "Membre du personnel supprimé avec succès" });
  } catch (err) {
    console.error("Erreur deleteStaff:", err);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
};

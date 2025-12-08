// backend/controllers/doctorController.js
const Doctor = require("../models/Doctor");

// Helper: parse JSON fields if they come as string
function parseMaybeJSON(val) {
  if (!val) return val;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

// GET /api/doctors? q & specialty filters
exports.getDoctors = async (req, res) => {
  try {
    const { q, specialty } = req.query;
    const filter = {};
    if (q) {
      const re = new RegExp(q, "i");
      filter.$or = [{ name: re }, { email: re }];
    }
    if (specialty) filter.specialty = specialty;
    const doctors = await Doctor.find(filter).sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    console.error("getDoctors error:", err);
    res.status(500).json({ message: "Erreur interne" });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Not found" });
    res.json(doctor);
  } catch (err) {
    console.error("getDoctorById error:", err);
    res.status(500).json({ message: "Erreur interne" });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const data = req.body || {};
    if (req.file) data.photo = `/uploads/doctors/${req.file.filename}`;

    // Parse schedule and absences if they were sent as JSON strings
    data.schedule = parseMaybeJSON(data.schedule) || [];
    data.absences = parseMaybeJSON(data.absences) || [];

    // Validation minimal
    if (!data.name || !data.email || !data.specialty) {
      return res.status(400).json({ message: "name, email et specialty requis" });
    }

    const exists = await Doctor.findOne({ email: data.email });
    if (exists) return res.status(409).json({ message: "Email déjà utilisé" });

    const doctor = await Doctor.create(data);
    res.status(201).json(doctor);
  } catch (err) {
    console.error("createDoctor error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const data = req.body || {};
    if (req.file) data.photo = `/uploads/doctors/${req.file.filename}`;

    data.schedule = parseMaybeJSON(data.schedule) || [];
    data.absences = parseMaybeJSON(data.absences) || [];

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ message: "Not found" });
    res.json(doctor);
  } catch (err) {
    console.error("updateDoctor error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: "Supprimé" });
  } catch (err) {
    console.error("deleteDoctor error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// backend/routes/appointmentRoutes.js
const express = require("express");
const router = express.Router();

const Appointment = require("../models/Appointment");
const Patient = require("../models/patientModel");
const User = require("../models/User"); // si besoin pour authentification

const { getMoroccanHolidays, getVariableIslamicHolidays } = require("../utils/holidays");

// -----------------------------------------
// 🔎 Helpers pour date et validation
// -----------------------------------------

function isForbiddenDate(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return true; // week-end

  const year = date.getFullYear();
  const fixed = getMoroccanHolidays(year);
  const islamic = getVariableIslamicHolidays();
  const formatted = date.toISOString().split("T")[0];

  return fixed.includes(formatted) || islamic.includes(formatted);
}

function parseYMD(dateStr) {
  const [y, m, d] = (dateStr || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

function localDayRange(dateStr) {
  const p = parseYMD(dateStr);
  if (!p) return null;
  const start = new Date(p.y, p.m - 1, p.d, 0, 0, 0, 0);
  const next = new Date(p.y, p.m - 1, p.d + 1, 0, 0, 0, 0);
  return { start, next };
}

function isPastDayLocal(dateObj) {
  const d = new Date(dateObj);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

// -----------------------------------------
// 🟢 1) CRÉATION RENDEZ-VOUS
// POST /api/appointments
// -----------------------------------------
router.post("/", async (req, res) => {
  try {
    const { patient, patientId, medecin, date, time, duration, notes, motif } = req.body;

    let finalDate;
    if (date && time) {
      finalDate = new Date(`${date}T${time}:00`);
      if (isNaN(finalDate.getTime())) {
        return res.status(400).json({ message: "Date/heure invalide." });
      }
      if (isPastDayLocal(finalDate)) {
        return res.status(400).json({ message: "Impossible de réserver dans le passé." });
      }
    } else if (date) {
      finalDate = new Date(date);
    } else {
      return res.status(400).json({ message: "Date obligatoire." });
    }

    // ❌ Vérification week-end / jours fériés
    if (isForbiddenDate(finalDate)) {
      return res.status(400).json({
        message: "Impossible de prendre un rendez-vous ce jour-là (week-end ou jour férié).",
      });
    }

    const medecinId = medecin || req.user?.userId;
    if (!medecinId) return res.status(401).json({ message: "Médecin non précisé ou non authentifié." });

    const patientRef = patientId || patient;
    const patientDoc = await Patient.findById(patientRef);
    if (!patientDoc) return res.status(404).json({ message: "Patient introuvable." });

    const conflict = await Appointment.findOne({ medecin: medecinId, date: finalDate });
    if (conflict) return res.status(409).json({ message: "Conflit: médecin déjà occupé à cette heure." });

    const rdv = await Appointment.create({
      patient: patientRef,
      medecin: medecinId,
      date: finalDate,
      duration: duration ?? 30,
      notes: notes ?? motif ?? "",
      status: "planifié",
    });

    const populated = await Appointment.findById(rdv._id)
      .populate("patient", "name dossier")
      .populate("medecin", "name email role specialty");

    return res.status(201).json({
      message: "Rendez-vous créé avec succès.",
      rdv: populated,
    });
  } catch (error) {
    console.error("Erreur création RDV :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

// -----------------------------------------
// 🟦 2) LISTE DES RENDEZ-VOUS
// GET /api/appointments
// GET /api/appointments/day?date=YYYY-MM-DD
// -----------------------------------------
router.get("/day", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date obligatoire (YYYY-MM-DD)." });

    const range = localDayRange(date);
    if (!range) return res.status(400).json({ message: "Format date invalide." });

    const list = await Appointment.find({ date: { $gte: range.start, $lt: range.next } })
      .populate("patient", "name dossier")
      .populate("medecin", "name email role")
      .sort({ date: 1 });

    return res.json(list);
  } catch (error) {
    console.error("Erreur get day planning:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;
    const q = {};
    if (from && to) {
      const r1 = localDayRange(from);
      const r2 = localDayRange(to);
      if (r1 && r2) q.date = { $gte: r1.start, $lt: r2.next };
    }

    const rdv = await Appointment.find(q)
      .populate("patient", "name dossier")
      .populate("medecin", "name email role")
      .sort({ date: 1 });

    return res.json(rdv);
  } catch (error) {
    console.error("Erreur get appointments:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

// -----------------------------------------
// 🟩 3) RDV d’un patient spécifique
// GET /api/appointments/patient/:patientId
// -----------------------------------------
router.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const rdv = await Appointment.find({ patient: patientId })
      .populate("medecin", "name specialty")
      .sort({ date: -1 });

    return res.json(rdv);
  } catch (error) {
    console.error("Erreur chargement RDV patient:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

// -----------------------------------------
// 🟨 4) MISE À JOUR RENDEZ-VOUS
// PUT /api/appointments/:id
// -----------------------------------------
router.put("/:id", async (req, res) => {
  try {
    const { date, time, motif, status } = req.body;
    const update = {};

    if (date && time) {
      const finalDate = new Date(`${date}T${time}:00`);
      if (isNaN(finalDate.getTime())) return res.status(400).json({ message: "Date/heure invalide." });
      if (isPastDayLocal(finalDate)) return res.status(400).json({ message: "Date passée interdite." });
      update.date = finalDate;
    }
    if (motif !== undefined) update.notes = motif;
    if (status) update.status = status;

    const updated = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .populate("patient", "name dossier")
      .populate("medecin", "name email role");

    if (!updated) return res.status(404).json({ message: "RDV introuvable." });
    return res.json(updated);
  } catch (error) {
    console.error("Erreur update RDV:", error);
    return res.status(400).json({ message: "Erreur mise à jour." });
  }
});

// -----------------------------------------
// 🟨 5) SUPPRESSION RDV
// DELETE /api/appointments/:id
// -----------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "RDV introuvable." });
    return res.json({ message: "Rendez-vous supprimé." });
  } catch (error) {
    console.error("Erreur delete RDV:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;

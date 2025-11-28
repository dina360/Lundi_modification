// backend/routes/appointmentRoutes.js
const express = require("express");
const Appointment = require("../models/Appointment");
const Patient = require("../models/patientModel");
const User = require("../models/User");
const router = express.Router();

const { getMoroccanHolidays, getVariableIslamicHolidays } = require("../utils/holidays");


/* -----------------------------------------
   🔎 Vérifier si une date est un jour interdit
--------------------------------------------*/
function isForbiddenDate(date) {
  const day = date.getDay();

  // 🔴 Week-end
  if (day === 0 || day === 6) return true;

  const year = date.getFullYear();

  // 🔵 Jours fériés fixes
  const fixed = getMoroccanHolidays(year);

  // 🟣 Jours islamiques prévision 2025
  const islamic = getVariableIslamicHolidays();

  const formatted = date.toISOString().split("T")[0];

  return fixed.includes(formatted) || islamic.includes(formatted);
}

/* -----------------------------------------
   🟢 1) CRÉATION RENDEZ-VOUS  (POST /api/appointments)
--------------------------------------------*/
router.post("/", async (req, res) => {
  try {
    const { patient, medecin, date, duration, notes } = req.body;

    const finalDate = new Date(date);

    // ❌ Interdire week-ends & jours fériés
    if (isForbiddenDate(finalDate)) {
      return res.status(400).json({
        message:
          "Impossible de prendre un rendez-vous ce jour-là (week-end ou jour férié).",
      });
    }

    // 🔎 Vérifier si ce médecin a déjà un RDV à cette heure
    const conflict = await Appointment.findOne({
      medecin,
      date: finalDate,
    });

    if (conflict) {
      return res.status(400).json({
        message: "Ce médecin a déjà un rendez-vous à cette heure-là.",
      });
    }

    // 💾 Enregistrer RDV
    const rdv = new Appointment({
      patient,
      medecin,
      date: finalDate,
      duration,
      notes,
    });

    await rdv.save();

    return res.json({
      message: "Rendez-vous créé avec succès.",
      rdv,
    });
  } catch (error) {
    console.error("Erreur création RDV :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

/* -----------------------------------------
   🟦 2) LISTE DES RENDEZ-VOUS (GET /api/appointments)
--------------------------------------------*/
router.get("/", async (req, res) => {
  try {
    const rdv = await Appointment.find()
      .populate("patient", "name")
      .populate("medecin", "name specialty")
      .sort({ date: 1 });

    res.json(rdv);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

/* -----------------------------------------
   🟨 3) SUPPRESSION (DELETE /api/appointments/:id)
--------------------------------------------*/
router.delete("/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Rendez-vous supprimé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
// backend/controllers/maladeRdvController.js

const Doctor = require("../models/Doctor");
const Rdv = require("../models/Rdv");
const User = require("../models/User");

// --- Convertir "09:00" en minutes
function toMinutes(time) {
  const [h, m] = String(time).split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

// --- Convertir minutes -> "hh:mm"
function toHHMM(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// --- AUTO-STATUS (RDV = 30 minutes)
function getStatusAuto(date, time) {
  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + 30 * 60000);
  const now = new Date();

  if (now < start) return "En attente";
  if (now >= start && now <= end) return "En cours";
  return "Terminé";
}

const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function isDoctorAbsentOnDate(doctor, date) {
  const d = new Date(date);
  return (doctor.absences || []).some((a) => {
    const from = new Date(a.from);
    const to = new Date(a.to);
    return d >= from && d <= to;
  });
}

function getAbsencePeriod(doctor, date) {
  const d = new Date(date);
  return (doctor.absences || []).find((a) => {
    const from = new Date(a.from);
    const to = new Date(a.to);
    return d >= from && d <= to;
  });
}

function computeValidSlotsFromSchedule(daySchedule) {
  const validSlots = [];
  for (const slot of daySchedule?.slots || []) {
    let start = toMinutes(slot.start);
    const end = toMinutes(slot.end);
    while (start + 30 <= end) {
      validSlots.push(toHHMM(start));
      start += 30;
    }
  }
  return validSlots;
}

// Validation planning + absence + slot + réservation
async function validateRdvSlot({
  doctorId,
  date,
  time,
  specialty, // optionnel
  excludeRdvId = null,
}) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return { ok: false, message: "Médecin introuvable" };

  if (specialty && doctor.specialty !== specialty) {
    return { ok: false, message: "Ce médecin n'a pas cette spécialité" };
  }

  const dayName = JOURS[new Date(date).getDay()];
  const daySchedule = doctor.schedule?.find((d) => d.day === dayName);
  if (!daySchedule) {
    return { ok: false, message: "Ce médecin ne travaille pas à cette date." };
  }

  if (isDoctorAbsentOnDate(doctor, date)) {
    const absencePeriod = getAbsencePeriod(doctor, date);
    if (absencePeriod) {
      return {
        ok: false,
        message: `Le médecin est absent du ${absencePeriod.from} au ${absencePeriod.to}.`,
      };
    }
    return { ok: false, message: "Ce médecin est absent ce jour." };
  }

  const validSlots = computeValidSlotsFromSchedule(daySchedule);
  if (!validSlots.includes(time)) {
    return { ok: false, message: "Ce médecin n'est pas disponible à cette heure." };
  }

  const exists = await Rdv.findOne({
    ...(excludeRdvId ? { _id: { $ne: excludeRdvId } } : {}),
    doctorId,
    date,
    time,
  });

  if (exists) {
    return { ok: false, message: "Ce créneau est déjà réservé." };
  }

  return { ok: true, doctor, daySchedule, validSlots };
}

// -----------------------------------------------------------------------------
// Spécialités
// -----------------------------------------------------------------------------
exports.getSpecialites = async (req, res) => {
  try {
    const specialites = await Doctor.distinct("specialty");
    res.json(specialites);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// Médecins par spécialité
// -----------------------------------------------------------------------------
exports.getMedecinsBySpecialite = async (req, res) => {
  try {
    const { specialite } = req.params;
    const medecins = await Doctor.find({ specialty: specialite }).sort({ name: 1 });
    res.json(medecins);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// Disponibilités (slots - 30 min)
// -----------------------------------------------------------------------------
exports.getDisponibilites = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "La date est obligatoire", disponibilites: [] });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Médecin introuvable", disponibilites: [] });
    }

    const dayName = JOURS[new Date(date).getDay()];
    const daySchedule = doctor.schedule?.find((d) => d.day === dayName);

    if (!daySchedule) {
      return res.json({ message: "Ce médecin ne travaille pas ce jour.", disponibilites: [] });
    }

    if (isDoctorAbsentOnDate(doctor, date)) {
      return res.json({ message: "Ce médecin est absent ce jour.", disponibilites: [] });
    }

    // Tous les slots possibles
    const allSlots = computeValidSlotsFromSchedule(daySchedule);

    // Slots déjà réservés
    const rdvs = await Rdv.find({ doctorId, date }).select("time");
    const reservedTimesSet = new Set(rdvs.map((r) => r.time));

    const available = allSlots.filter((t) => !reservedTimesSet.has(t));

    res.json({
      message: "Créneaux disponibles récupérés.",
      disponibilites: available,
    });
  } catch (err) {
    console.error("getDisponibilites error:", err);
    res.status(500).json({ message: "Erreur serveur", disponibilites: [] });
  }
};

// -----------------------------------------------------------------------------
// Prendre RDV (sécurisé)
// -----------------------------------------------------------------------------
exports.prendreRdv = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const maladeId = req.user?.userId; // vient du token (authMiddleware)

    const requiredFields = ["doctorId", "date", "time"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `Le champ ${field} est manquant` });
      }
    }
    if (!maladeId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const validation = await validateRdvSlot({ doctorId, date, time });
    if (!validation.ok) {
      return res.status(400).json({ message: validation.message });
    }

    const rdv = await Rdv.create({ maladeId, doctorId, date, time });
    res.json({ message: "Rendez-vous créé avec succès", rdv });
  } catch (err) {
    console.error("prendreRdv error:", err);
    res.status(500).json({ message: `Erreur serveur: ${err.message || err}` });
  }
};

// -----------------------------------------------------------------------------
// Supprimer RDV (seulement En attente) + sécurisé (appartenance)
// -----------------------------------------------------------------------------
exports.deleteRdv = async (req, res) => {
  try {
    const { id } = req.params;
    const maladeId = req.user?.userId;

    const rdv = await Rdv.findById(id);
    if (!rdv) return res.status(404).json({ message: "RDV introuvable" });

    // sécurité: patient ne supprime que ses rdv
    if (String(rdv.maladeId) !== String(maladeId)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // recalcul status
    const autoStatus = getStatusAuto(rdv.date, rdv.time);
    if (rdv.status !== autoStatus) {
      rdv.status = autoStatus;
      await rdv.save();
    }

    if (rdv.status !== "En attente") {
      return res.status(400).json({
        message: "Vous ne pouvez supprimer qu'un rendez-vous en attente.",
      });
    }

    await Rdv.findByIdAndDelete(id);
    res.json({ message: "RDV supprimé avec succès" });
  } catch (err) {
    console.error("deleteRdv error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// Modifier RDV (seulement En attente) + sécurisé (appartenance)
// -----------------------------------------------------------------------------
exports.updateRdv = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialty, doctorId, date, time } = req.body;
    const maladeId = req.user?.userId;

    const rdvOriginal = await Rdv.findById(id);
    if (!rdvOriginal) return res.status(404).json({ message: "Rendez-vous introuvable" });

    // sécurité: patient ne modifie que ses rdv
    if (String(rdvOriginal.maladeId) !== String(maladeId)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // recalcul status
    const autoStatus = getStatusAuto(rdvOriginal.date, rdvOriginal.time);
    if (rdvOriginal.status !== autoStatus) {
      rdvOriginal.status = autoStatus;
      await rdvOriginal.save();
    }

    if (rdvOriginal.status !== "En attente") {
      return res.status(400).json({
        message: "Vous ne pouvez modifier qu'un rendez-vous en attente.",
      });
    }

    // validation slot + pas déjà réservé (en excluant le rdv actuel)
    const validation = await validateRdvSlot({
      doctorId,
      date,
      time,
      specialty,
      excludeRdvId: id,
    });

    if (!validation.ok) {
      return res.status(400).json({ message: validation.message });
    }

    const rdv = await Rdv.findByIdAndUpdate(id, { doctorId, date, time }, { new: true });
    res.json({ message: "RDV modifié avec succès", rdv });
  } catch (err) {
    console.error("updateRdv error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// Historique (sécurisé: utilise le token)
// -----------------------------------------------------------------------------
exports.getHistorique = async (req, res) => {
  try {
    const maladeId = req.user?.userId;

    const rdvs = await Rdv.find({ maladeId })
      .populate("doctorId", "name specialty photo")
      .sort({ date: -1, time: -1 });

    for (const rdv of rdvs) {
      const newStatus = getStatusAuto(rdv.date, rdv.time);
      if (rdv.status !== newStatus) {
        rdv.status = newStatus;
        await rdv.save();
      }
    }

    res.json(rdvs);
  } catch (err) {
    console.error("getHistorique error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// Stats (sécurisé: utilise le token)
// -----------------------------------------------------------------------------
exports.getStats = async (req, res) => {
  try {
    const maladeId = req.user?.userId;

    const rdvs = await Rdv.find({ maladeId })
      .populate("doctorId", "name specialty")
      .sort({ date: 1, time: 1 });

    for (const rdv of rdvs) {
      const newStatus = getStatusAuto(rdv.date, rdv.time);
      if (rdv.status !== newStatus) {
        rdv.status = newStatus;
        await rdv.save();
      }
    }

    const total = rdvs.length;
    const enAttente = rdvs.filter((r) => r.status === "En attente").length;
    const termines = rdvs.filter((r) => r.status === "Terminé").length;

    const now = new Date();
    const futurs = rdvs.filter((r) => new Date(`${r.date}T${r.time}`) > now);
    const prochain = futurs.length > 0 ? futurs[0] : null;

    res.json({ total, enAttente, termines, prochain });
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// Profil (sécurisé: utilise le token)
// -----------------------------------------------------------------------------
exports.getProfile = async (req, res) => {
  try {
    const maladeId = req.user?.userId;

    const user = await User.findById(maladeId).select("name email");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json(user);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

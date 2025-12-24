const Doctor = require("../models/Doctor");
const Rdv = require("../models/Rdv");
const User = require("../models/User");

// --- Convertir "09:00" en minutes
function toMinutes(time) {
  const [h, m] = time.split(":");
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

    const isAbsent = (doctor.absences || []).some((a) => {
      const from = new Date(a.from);
      const to = new Date(a.to);
      const d = new Date(date);
      return d >= from && d <= to;
    });

    if (isAbsent) {
      return res.json({ message: "Ce médecin est absent ce jour.", disponibilites: [] });
    }

    // Construire tous les créneaux possibles selon le planning
    let allSlots = [];
    for (const slot of daySchedule.slots || []) {
      let start = toMinutes(slot.start);
      const end = toMinutes(slot.end);

      while (start + 30 <= end) {
        allSlots.push(toHHMM(start));
        start += 30;
      }
    }

    // Retirer les créneaux déjà réservés
    const rdvs = await Rdv.find({ doctorId, date });
    const reservedTimes = rdvs.map((r) => r.time);

    const available = allSlots.filter((t) => !reservedTimes.includes(t));

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
// Prendre RDV (sécurisé + validation planning médecin)
// -----------------------------------------------------------------------------
exports.prendreRdv = async (req, res) => {
  try {
    const { maladeId, doctorId, date, time } = req.body;

    if (!maladeId || !doctorId || !date || !time) {
      return res.status(400).json({ message: "Champs manquants (maladeId, doctorId, date, time)" });
    }

    // Vérifier médecin + planning
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Médecin introuvable" });

    const dayName = JOURS[new Date(date).getDay()];
    const daySchedule = doctor.schedule?.find((d) => d.day === dayName);

    if (!daySchedule) {
      return res.status(400).json({ message: "Ce médecin ne travaille pas à cette date." });
    }

    // Vérifier absence
    const isAbsent = (doctor.absences || []).some((a) => {
      const from = new Date(a.from);
      const to = new Date(a.to);
      const d = new Date(date);
      return d >= from && d <= to;
    });
    if (isAbsent) {
      return res.status(400).json({ message: "Ce médecin est absent ce jour." });
    }

    // Vérifier que time est un slot valide
    let validSlots = [];
    for (const slot of daySchedule.slots || []) {
      let start = toMinutes(slot.start);
      const end = toMinutes(slot.end);
      while (start + 30 <= end) {
        validSlots.push(toHHMM(start));
        start += 30;
      }
    }

    if (!validSlots.includes(time)) {
      return res.status(400).json({ message: "Ce médecin n'est pas disponible à cette heure." });
    }

    // Vérifier si déjà réservé
    const exists = await Rdv.findOne({ doctorId, date, time });
    if (exists) {
      return res.status(400).json({ message: "Ce créneau est déjà réservé." });
    }

    const rdv = await Rdv.create({ maladeId, doctorId, date, time });

    res.json({ message: "Rendez-vous créé avec succès", rdv });
  } catch (err) {
    console.error("prendreRdv error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// Supprimer RDV (seulement En attente)
// -----------------------------------------------------------------------------
exports.deleteRdv = async (req, res) => {
  try {
    const { id } = req.params;

    const rdv = await Rdv.findById(id);
    if (!rdv) return res.status(404).json({ message: "RDV introuvable" });

    // recalcul status au cas où
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
// Modifier RDV (seulement En attente)
// -----------------------------------------------------------------------------
exports.updateRdv = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialty, doctorId, date, time } = req.body;

    const rdvOriginal = await Rdv.findById(id);
    if (!rdvOriginal) return res.status(404).json({ message: "Rendez-vous introuvable" });

    // recalcul status au cas où
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

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Médecin introuvable" });

    if (doctor.specialty !== specialty) {
      return res.status(400).json({ message: "Ce médecin n'a pas cette spécialité" });
    }

    const dayName = JOURS[new Date(date).getDay()];
    const daySchedule = doctor.schedule?.find((d) => d.day === dayName);

    if (!daySchedule) {
      return res.status(400).json({ message: "Ce médecin ne travaille pas à cette date." });
    }

    // Vérifier absence
    const isAbsent = (doctor.absences || []).some((a) => {
      const from = new Date(a.from);
      const to = new Date(a.to);
      const d = new Date(date);
      return d >= from && d <= to;
    });
    if (isAbsent) {
      return res.status(400).json({ message: "Ce médecin est absent ce jour." });
    }

    // Slot valide ?
    let validSlots = [];
    for (const slot of daySchedule.slots || []) {
      let start = toMinutes(slot.start);
      const end = toMinutes(slot.end);
      while (start + 30 <= end) {
        validSlots.push(toHHMM(start));
        start += 30;
      }
    }

    if (!validSlots.includes(time)) {
      return res.status(400).json({ message: "Ce médecin n'est pas disponible à cette heure." });
    }

    // Déjà réservé ?
    const exists = await Rdv.findOne({
      _id: { $ne: id },
      doctorId,
      date,
      time,
    });

    if (exists) {
      return res.status(400).json({ message: "Ce créneau est déjà réservé." });
    }

    const rdv = await Rdv.findByIdAndUpdate(
      id,
      { doctorId, date, time },
      { new: true }
    );

    res.json({ message: "RDV modifié avec succès", rdv });
  } catch (err) {
    console.error("updateRdv error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// Historique (avec update auto des statuts)
// -----------------------------------------------------------------------------
exports.getHistorique = async (req, res) => {
  try {
    const { maladeId } = req.params;

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
// Stats (avec recalcul status avant le comptage)
// -----------------------------------------------------------------------------
exports.getStats = async (req, res) => {
  try {
    const { maladeId } = req.params;

    const rdvs = await Rdv.find({ maladeId })
      .populate("doctorId", "name specialty")
      .sort({ date: 1, time: 1 });

    // Mettre à jour les statuts avant calcul
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
// Profil (SEULEMENT name + email)
// -----------------------------------------------------------------------------
exports.getProfile = async (req, res) => {
  try {
    const { maladeId } = req.params;

    const user = await User.findById(maladeId).select("name email");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json(user);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
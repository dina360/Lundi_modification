// backend/routes/secroomRoutes.js
const express = require("express");
const router = express.Router();

const Room = require("../models/roomModel");
const RoomReservation = require("../models/RoomReservation");

const authMiddleware = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyRole");

/* ===========================
   Middlewares sécurité
=========================== */
router.use(authMiddleware);
router.use(verifyRole(["admin", "secretaire"]));

/* ===========================
   Helpers
=========================== */
function toDate(d) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  return x;
}

async function hasConflict({ salleId, startDate, endDate, excludeId = null }) {
  const query = {
    salle: salleId,
    status: "confirmée",
    start: { $lt: endDate },
    end: { $gt: startDate },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const conflict = await RoomReservation.findOne(query);
  return !!conflict;
}

/* =====================================================
   1) SALLES
===================================================== */

// GET /api/salles  -> liste des salles
router.get("/", async (req, res) => {
  try {
    const salles = await Room.find().sort({ createdAt: -1 });
    res.json(salles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur chargement salles" });
  }
});

/* =====================================================
   2) RESERVATIONS
===================================================== */

// GET /api/salles/reservations -> liste des réservations confirmées
router.get("/reservations", async (req, res) => {
  try {
    const reservations = await RoomReservation.find({ status: "confirmée" })
      .populate("salle")
      .sort({ start: 1 });

    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur chargement réservations" });
  }
});

// POST /api/salles/reservations -> créer réservation
router.post("/reservations", async (req, res) => {
  try {
    const { salleId, start, end, motif } = req.body;

    if (!salleId || !start || !end) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const startDate = toDate(start);
    const endDate = toDate(end);

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Dates invalides" });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ message: "Heure de fin invalide" });
    }

    if (startDate < new Date()) {
      return res.status(400).json({ message: "Date passée interdite" });
    }

    // vérifier salle existe
    const salle = await Room.findById(salleId);
    if (!salle) {
      return res.status(404).json({ message: "Salle introuvable" });
    }

    // conflit
    const conflict = await hasConflict({ salleId, startDate, endDate });
    if (conflict) {
      return res.status(400).json({ message: "Salle déjà réservée sur ce créneau" });
    }

    const reservation = new RoomReservation({
      salle: salleId,
      start: startDate,
      end: endDate,
      motif: motif || "",
      createdBy: req.user.userId,
    });

    await reservation.save();

    const populated = await RoomReservation.findById(reservation._id).populate("salle");

    return res.status(201).json({
      message: "Réservation confirmée",
      reservation: populated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur réservation" });
  }
});

// PUT /api/salles/reservations/:id -> modifier réservation
router.put("/reservations/:id", async (req, res) => {
  try {
    const { salleId, start, end, motif, status } = req.body;

    const reserv = await RoomReservation.findById(req.params.id);
    if (!reserv) return res.status(404).json({ message: "Réservation introuvable" });

    // si on modifie salle / dates
    const newSalleId = salleId || reserv.salle.toString();
    const newStart = start ? toDate(start) : reserv.start;
    const newEnd = end ? toDate(end) : reserv.end;

    if (!newStart || !newEnd) {
      return res.status(400).json({ message: "Dates invalides" });
    }

    if (newEnd <= newStart) {
      return res.status(400).json({ message: "Heure de fin invalide" });
    }

    if (newStart < new Date()) {
      return res.status(400).json({ message: "Date passée interdite" });
    }

    // vérifier salle existe si changée
    const salle = await Room.findById(newSalleId);
    if (!salle) return res.status(404).json({ message: "Salle introuvable" });

    // conflit (exclure cette réservation)
    const conflict = await hasConflict({
      salleId: newSalleId,
      startDate: newStart,
      endDate: newEnd,
      excludeId: reserv._id,
    });

    if (conflict) {
      return res.status(400).json({ message: "Conflit : salle déjà réservée sur ce créneau" });
    }

    reserv.salle = newSalleId;
    reserv.start = newStart;
    reserv.end = newEnd;
    reserv.motif = motif !== undefined ? motif : reserv.motif;

    if (status && ["confirmée", "annulée"].includes(status)) {
      reserv.status = status;
    }

    await reserv.save();

    const populated = await RoomReservation.findById(reserv._id).populate("salle");

    res.json({ message: "Réservation mise à jour", reservation: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur modification réservation" });
  }
});

// DELETE /api/salles/reservations/:id -> suppression (soft delete = annulée)
router.delete("/reservations/:id", async (req, res) => {
  try {
    const reserv = await RoomReservation.findById(req.params.id);
    if (!reserv) return res.status(404).json({ message: "Réservation introuvable" });

    reserv.status = "annulée";
    await reserv.save();

    res.json({ message: "Réservation annulée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur suppression réservation" });
  }
});

module.exports = router;

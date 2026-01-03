// backend/routes/roomRoutes.js
const express = require("express");
const router = express.Router();
const verifyRole = require("../middleware/verifyRole");
const Room = require("../models/roomModel");
const RoomReservation = require("../models/RoomReservation");

const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  addEquipment,
  deleteEquipment,
} = require("../controllers/roomController");

/* =========================
   Helpers
========================= */
function combineDateAndTime(dateStr, timeStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

function normalizeRoom(roomDoc) {
  const r = roomDoc.toObject ? roomDoc.toObject() : roomDoc;
  const equipements = r.equipements && r.equipements.length > 0 ? r.equipements : r.equipments || [];
  return { ...r, equipements };
}

/* =========================
   DISPONIBILITÉ
   GET /api/salles/available?date=YYYY-MM-DD&start=HH:mm&end=HH:mm
========================= */
router.get("/available", verifyRole(["admin", "secretaire"]), async (req, res) => {
  try {
    const { date, start, end } = req.query;

    if (!date || !start || !end) {
      return res.status(400).json({ message: "Paramètres manquants (date, start, end)" });
    }

    const startDate = combineDateAndTime(date, start);
    const endDate = combineDateAndTime(date, end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Date/heure invalide" });
    }
    if (startDate >= endDate) {
      return res.status(400).json({ message: "Créneau invalide" });
    }

    const rooms = await Room.find({ status: { $in: ["disponible", "available", "Disponible"] } }).sort({ name: 1 });

    const conflicts = await RoomReservation.find({
      status: "confirmée",
      start: { $lt: endDate },
      end: { $gt: startDate },
    }).select("salle");

    const busyIds = new Set(conflicts.map((c) => String(c.salle)));

    const available = rooms.filter((r) => !busyIds.has(String(r._id))).map(normalizeRoom);

    return res.json(available);
  } catch (e) {
    console.error("Erreur /available:", e);
    return res.status(500).json({ message: "Erreur serveur (available)" });
  }
});

/* =========================
   RÉSERVATIONS - CREATE
========================= */
router.post("/reservations", verifyRole(["secretaire"]), async (req, res) => {
  try {
    const { salleId, date, start, end, motif } = req.body;

    if (!salleId || !start || !end) return res.status(400).json({ message: "Champs manquants (salleId, start, end)" });

    let startDate, endDate;

    if (date && start.includes(":") && end.includes(":")) {
      startDate = combineDateAndTime(date, start);
      endDate = combineDateAndTime(date, end);
    } else {
      startDate = new Date(start);
      endDate = new Date(end);
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return res.status(400).json({ message: "Date/heure invalide" });
    if (startDate >= endDate) return res.status(400).json({ message: "Horaire invalide" });
    if (startDate < new Date()) return res.status(400).json({ message: "Impossible de réserver dans le passé" });

    const conflict = await RoomReservation.findOne({
      salle: salleId,
      status: "confirmée",
      start: { $lt: endDate },
      end: { $gt: startDate },
    });

    if (conflict) return res.status(400).json({ message: "Salle déjà réservée à cet horaire" });

    const reservation = await RoomReservation.create({
      salle: salleId,
      reservedBy: req.user.userId,
      start: startDate,
      end: endDate,
      motif: motif || "",
      status: "confirmée",
    });

    const populated = await RoomReservation.findById(reservation._id)
      .populate("salle", "name type capacity status")
      .populate("reservedBy", "name email role");

    return res.status(201).json({ message: "Réservation confirmée", reservation: populated });
  } catch (e) {
    console.error("Erreur réservation:", e);
    return res.status(500).json({ message: "Erreur serveur (reservation)" });
  }
});

/* =========================
   RÉSERVATIONS - UPDATE
========================= */
router.put("/reservations/:id", verifyRole(["admin", "secretaire"]), async (req, res) => {
  try {
    const { salleId, date, start, end, motif } = req.body;

    const existing = await RoomReservation.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Réservation introuvable" });
    if ((existing.status || "").toLowerCase() === "annulée") return res.status(400).json({ message: "Réservation déjà annulée (modification impossible)" });

    let startDate, endDate;

    if (date && start.includes(":") && end.includes(":")) {
      startDate = combineDateAndTime(date, start);
      endDate = combineDateAndTime(date, end);
    } else {
      startDate = new Date(start);
      endDate = new Date(end);
    }

    if (!salleId || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return res.status(400).json({ message: "Données invalides" });
    if (startDate >= endDate) return res.status(400).json({ message: "Horaire invalide" });

    const conflict = await RoomReservation.findOne({
      _id: { $ne: existing._id },
      salle: salleId,
      status: "confirmée",
      start: { $lt: endDate },
      end: { $gt: startDate },
    });
    if (conflict) return res.status(400).json({ message: "Conflit : salle déjà réservée sur ce créneau" });

    existing.salle = salleId;
    existing.start = startDate;
    existing.end = endDate;
    existing.motif = motif || "";
    await existing.save();

    const updated = await RoomReservation.findById(existing._id)
      .populate("salle", "name type capacity status")
      .populate("reservedBy", "name email role");

    return res.json({ message: "Réservation modifiée", reservation: updated });
  } catch (e) {
    console.error("Erreur update reservation:", e);
    return res.status(500).json({ message: "Erreur serveur (update reservation)" });
  }
});

/* =========================
   RÉSERVATIONS - ANNULER
========================= */
router.patch("/reservations/:id/cancel", verifyRole(["admin", "secretaire"]), async (req, res) => {
  try {
    const reservation = await RoomReservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });

    if ((reservation.status || "").toLowerCase() === "annulée") {
      const populated = await RoomReservation.findById(reservation._id)
        .populate("salle", "name type capacity status")
        .populate("reservedBy", "name email role");
      return res.json({ message: "Déjà annulée", reservation: populated });
    }

    reservation.status = "annulée";
    await reservation.save();

    const updated = await RoomReservation.findById(reservation._id)
      .populate("salle", "name type capacity status")
      .populate("reservedBy", "name email role");

    return res.json({ message: "Réservation annulée", reservation: updated });
  } catch (e) {
    console.error("Erreur cancel reservation:", e);
    return res.status(500).json({ message: "Erreur serveur (cancel reservation)" });
  }
});

/* =========================
   RÉSERVATIONS - LIST
========================= */
router.get("/reservations", verifyRole(["admin", "secretaire"]), async (req, res) => {
  try {
    const { salleId, date, from, to } = req.query;

    const filter = {};
    if (salleId) filter.salle = salleId;

    if (date) {
      const dayStart = combineDateAndTime(date, "00:00");
      const dayEnd = combineDateAndTime(date, "23:59");
      filter.start = { $lte: dayEnd };
      filter.end = { $gte: dayStart };
    } else if (from && to) {
      const rangeStart = combineDateAndTime(from, "00:00");
      const rangeEnd = combineDateAndTime(to, "23:59");
      filter.start = { $lte: rangeEnd };
      filter.end = { $gte: rangeStart };
    }

    const reservations = await RoomReservation.find(filter)
      .populate("salle", "name type capacity status")
      .populate("reservedBy", "name email role")
      .sort({ start: 1 });

    return res.json(reservations);
  } catch (e) {
    console.error("Erreur get reservations:", e);
    return res.status(500).json({ message: "Erreur serveur (reservations list)" });
  }
});

/* =========================
   RÉSERVATIONS - DELETE
========================= */
router.delete("/reservations/:id", verifyRole(["admin", "secretaire"]), async (req, res) => {
  try {
    const deleted = await RoomReservation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Réservation introuvable" });
    return res.json({ message: "Réservation supprimée" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur serveur (delete reservation)" });
  }
});

/* =========================
   SALLES (CRUD)
========================= */
router.get("/", verifyRole(["admin", "secretaire"]), getRooms);
router.get("/:id", verifyRole(["admin", "secretaire"]), getRoomById);

router.post("/", verifyRole(["admin"]), createRoom);
router.put("/:id", verifyRole(["admin"]), updateRoom);
router.delete("/:id", verifyRole(["admin"]), deleteRoom);

/* =========================
   ÉQUIPEMENTS (ADMIN)
========================= */
router.post("/:id/equipements", verifyRole(["admin"]), addEquipment);
router.delete("/:id/equipements/:equipementId", verifyRole(["admin"]), deleteEquipment);

module.exports = router;

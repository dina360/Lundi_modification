// backend/routes/roomRoutes.js
const express = require("express");
const router = express.Router();

const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  addEquipment,
  deleteEquipment,
} = require("../controllers/roomController");

// Si tu as un middleware d'authentification type protect / isAdmin, tu peux l'importer ici
// const { protect, isAdmin } = require("../middleware/authMiddleware");

// Routes salles
router.get("/", getRooms);
router.get("/:id", getRoomById);
router.post("/", createRoom);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

// Routes équipements dans une salle
router.post("/:id/equipements", addEquipment);
router.delete("/:id/equipements/:equipementId", deleteEquipment);

module.exports = router;

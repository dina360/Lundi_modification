// backend/controllers/roomController.js
const Room = require("../models/roomModel");

// helper: renvoie le bon tableau d'équipements même si ton schema varie
function getEquipArray(room) {
  if (Array.isArray(room.equipements)) return "equipements";
  if (Array.isArray(room.equipments)) return "equipments";
  // si aucun n’existe, on crée equipements par défaut
  room.equipements = [];
  return "equipements";
}

// GET /api/salles
exports.getRooms = async (req, res) => {
  try {
    // si ton schema a "code" c'est ok, sinon remplace par name/createdAt
    const rooms = await Room.find().sort({ code: 1, createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    console.error("Erreur getRooms:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des salles" });
  }
};

// GET /api/salles/:id
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: "Salle introuvable" });
    res.json(room);
  } catch (error) {
    console.error("Erreur getRoomById:", error);
    res.status(500).json({ error: "Erreur lors de la récupération de la salle" });
  }
};

// POST /api/salles
exports.createRoom = async (req, res) => {
  try {
    const room = new Room(req.body);
    const saved = await room.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Erreur createRoom:", error);
    res.status(400).json({ error: "Erreur lors de la création de la salle" });
  }
};

// PUT /api/salles/:id
exports.updateRoom = async (req, res) => {
  try {
    const updated = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Salle introuvable" });
    res.json(updated);
  } catch (error) {
    console.error("Erreur updateRoom:", error);
    res.status(400).json({ error: "Erreur lors de la mise à jour de la salle" });
  }
};

// DELETE /api/salles/:id
exports.deleteRoom = async (req, res) => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Salle introuvable" });
    res.json({ message: "Salle supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteRoom:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de la salle" });
  }
};

// POST /api/salles/:id/equipements
exports.addEquipment = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: "Salle introuvable" });

    const key = getEquipArray(room);

    // req.body attendu: { name, quantity } ou ce que tu veux stocker
    room[key].push(req.body);

    const saved = await room.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Erreur addEquipment:", error);
    res.status(400).json({ error: "Erreur lors de l'ajout de l'équipement" });
  }
};

// DELETE /api/salles/:id/equipements/:equipementId
exports.deleteEquipment = async (req, res) => {
  try {
    const { id, equipementId } = req.params;

    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ error: "Salle introuvable" });

    const key = getEquipArray(room);

    room[key] = room[key].filter((eq) => String(eq._id) !== String(equipementId));

    const saved = await room.save();
    res.json(saved);
  } catch (error) {
    console.error("Erreur deleteEquipment:", error);
    res.status(400).json({ error: "Erreur lors de la suppression de l'équipement" });
  }
};

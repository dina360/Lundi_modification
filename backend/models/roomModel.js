// backend/models/roomModel.js
const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String, // ex: monitoring, imagerie, chirurgie, réanimation...
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      default: "fonctionnel",
      trim: true,
    },
    lastMaintenance: {
      type: Date,
    },
  },
  { _id: true }
);

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String, // "Salle de consultation 1"
      required: true,
      trim: true,
    },
    code: {
      type: String, // "CONS-01", "BLOC-01"
      required: true,
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      trim: true, // bloc opératoire, consultation, hospitalisation, etc.
    },
    floor: {
      type: String, // "RDC", "1er étage", "Bloc A", ...
      trim: true,
    },
    capacity: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      default: "disponible", // disponible, occupée, maintenance, hors_service...
      trim: true,
    },

    // ✅ on garde ton champ "equipments" tel quel
    equipments: [equipmentSchema],
  },
  {
    timestamps: true,
  }
);

/**
 * ✅ IMPORTANT (2 corrections):
 * 1) Empêche "OverwriteModelError" si le modèle Room est déjà compilé
 * 2) Force la collection MongoDB à être exactement "rooms"
 */
module.exports = mongoose.models.Room || mongoose.model("Room", roomSchema, "rooms");

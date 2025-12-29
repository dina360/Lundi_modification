// backend/models/staffModel.js
const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    // Nom complet de la personne
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Adresse e-mail professionnelle
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    // Téléphone
    phone: {
      type: String,
      trim: true,
    },

    // Poste occupé (infirmier, aide-soignant, etc.)
    poste: {
      type: String,
      required: true,
      trim: true,
      // on ne met pas d'enum pour te laisser flexible,
      // mais le frontend proposera des choix techniques.
    },

    // Service (Urgences, Cardiologie, Pédiatrie...)
    service: {
      type: String,
      trim: true,
    },

    // Type d'horaire
    shift: {
      type: String,
      enum: ["jour", "nuit", "rotation", "autre"],
      default: "jour",
    },

    // Statut dans l'établissement
    status: {
      type: String,
      enum: ["actif", "en_congé", "inactif"],
      default: "actif",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Staff", staffSchema);

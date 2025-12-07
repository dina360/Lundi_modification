// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // 🔑 Gestion des rôles
    role: {
      type: String,
      enum: ['admin', 'medecin', 'secretaire', 'patient'], // 👈 AJOUT de 'patient'
      default: 'patient',                                   // 👈 par défaut = patient
      required: true,
    },

    specialty: {
      type: String,
      default: null,
    },

    // 🖼️ Photo du profil
    photo: {
      type: String,
      default: "/uploads/medecins/default.jpg"
    }
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model('User', userSchema);

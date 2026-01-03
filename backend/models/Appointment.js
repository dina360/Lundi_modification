// backend/models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // Médecin optionnel pour certains cas (ex: interface secrétaire)
    medecin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    duration: {
      type: Number,
      default: 30, // minutes
    },

    motif: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["planifié", "en cours", "terminé", "annulé"],
      default: "planifié",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);

// backend/models/patientModel.js
const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    // =========================
    // Informations personnelles
    // =========================
    name: { type: String, required: true, trim: true },

    dossier: { type: String, required: true, unique: true, trim: true, index: true },

    phone: { type: String, required: true, trim: true },

    email: { type: String, default: "", trim: true, lowercase: true },

    address: { type: String, required: true, trim: true },

    birthDate: { type: Date, default: null, index: true },

    photo: { type: String, default: null },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
      index: true,
    },

    // =========================
    // Informations médicales
    // =========================
    bloodGroup: {
      type: String,
      default: "",
      enum: ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    allergies: { type: String, default: "", trim: true },

    medicalHistory: { type: String, default: "", trim: true }, // antécédents

    notes: { type: String, default: "", trim: true }, // notes internes

    // =========================
    // RDV / dossiers médicaux
    // =========================
    lastAppointment: { type: Date, default: null, index: true },
    nextAppointment: { type: Date, default: null, index: true },

    medicalRecords: { type: [medicalRecordSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);

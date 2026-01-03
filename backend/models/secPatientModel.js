const mongoose = require("mongoose");

const secPatientSchema = new mongoose.Schema(
  {
    // === Infos personnelles ===
    name: { type: String, required: true, trim: true },

    dossier: { type: String, required: true, unique: true, trim: true },

    phone: { type: String, required: true, trim: true },

    address: { type: String, required: true, trim: true },

    email: { type: String, default: "", trim: true },

    birthDate: { type: Date, default: null },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },

    // === Infos médicales ===
    bloodType: {
      type: String,
      enum: ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: "",
    },

    allergies: { type: String, default: "", trim: true },

    medicalHistory: { type: String, default: "", trim: true },

    notes: { type: String, default: "", trim: true },

    // === Dossier médical (fichiers) ===
    medicalRecords: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    photo: { type: String, default: null },

    lastAppointment: { type: Date, index: true },
    nextAppointment: { type: Date, index: true },
  },
  { timestamps: true }
);

// IMPORTANT: 3e param => force le nom exact de collection "secpatient"
module.exports = mongoose.model("SecPatient", secPatientSchema, "secpatient");

// backend/models/Doctor.js
const mongoose = require("mongoose");

// 🔹 Créneaux horaires d'une journée
const slotSchema = new mongoose.Schema(
  {
    start: { type: String, required: true }, // "09:00"
    end: { type: String, required: true },   // "12:00"
  },
  { _id: false }
);

// 🔹 Planning d'un jour
const daySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },   // "Lundi"
    slots: { type: [slotSchema], default: [] },
  },
  { _id: false }
);

// 🔹 Absences
const absenceSchema = new mongoose.Schema(
  {
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String, default: "" },
  },
  { _id: false }
);

// 🔹 Schéma principal du médecin
const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // 🔥 Lien vers le compte User correspondant
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    specialty: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    notes: { type: String, default: "" },
    photo: { type: String, default: "" }, // path comme /uploads/doctors/...
    status: {
      type: String,
      enum: ["Disponible", "Occupé", "Absent", "En congé"],
      default: "Disponible",
    },

    schedule: { type: [daySchema], default: [] }, // planning hebdomadaire
    absences: { type: [absenceSchema], default: [] }, // absences programmées
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);

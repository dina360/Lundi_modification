// backend/models/Doctor.js
const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  start: { type: String, required: true }, // "09:00"
  end: { type: String, required: true }    // "12:00"
}, { _id: false });

const daySchema = new mongoose.Schema({
  day: { type: String, required: true },   // "Lundi"
  slots: { type: [slotSchema], default: [] }
}, { _id: false });

const absenceSchema = new mongoose.Schema({
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  reason: { type: String, default: "" }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  notes: { type: String, default: "" },
  photo: { type: String, default: "" }, // path like /uploads/doctors/...
  status: { type: String, enum: ["Disponible","Occupé","Absent","En congé"], default: "Disponible" },
  schedule: { type: [daySchema], default: [] },  // array of {day, slots}
  absences: { type: [absenceSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);
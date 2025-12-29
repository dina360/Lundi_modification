// backend/models/Consultation.js
const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  medecin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  notes: String,
  prescription: String,
}, {
  timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);
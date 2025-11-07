const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dossier: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  lastAppointment: { type: Date, index: true }, // Ajout d'index pour les performances
  nextAppointment: { type: Date, index: true },

  createdAt: {            // Doit être présent
    type: Date,
    default: Date.now,
    index: true
  },
  medicalRecords: [{
    url: { type: String, required: true },
    name: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  photo: {
    type: String,
    default: null
  }
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;

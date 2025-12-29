// backend/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  medecin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['planifié', 'en cours', 'terminé', 'annulé'],
    default: 'planifié'
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

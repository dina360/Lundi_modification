// backend/models/Disponibilite.js
const mongoose = require('mongoose');

const disponibiliteSchema = new mongoose.Schema({
  medecin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jour: { type: String, enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'], required: true },
  debut: { type: String, required: true }, // Heure de début (ex: "09:00")
  fin: { type: String, required: true },   // Heure de fin (ex: "13:00")
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Disponibilite', disponibiliteSchema);
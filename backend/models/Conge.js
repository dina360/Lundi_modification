// backend/models/Conge.js
const mongoose = require('mongoose');

const congeSchema = new mongoose.Schema({
  medecin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  motif: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Conge', congeSchema);
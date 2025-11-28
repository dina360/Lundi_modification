// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis']
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis']
  },
  role: {
    type: String,
    enum: ['admin', 'medecin', 'secretaire'],   // ⬅️ infirmier → secretaire
    default: 'medecin'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

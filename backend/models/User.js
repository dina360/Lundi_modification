const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true, // Conversion en minuscules
    trim: true       // Suppression des espaces
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis']
  },
  role: {
    type: String,
    enum: ['admin', 'medecin', 'infirmier'], // Valeurs autorisées
    default: 'medecin'                        // Valeur par défaut
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

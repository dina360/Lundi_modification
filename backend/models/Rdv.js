const mongoose = require("mongoose");

const rdvSchema = new mongoose.Schema({
  maladeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Doctor", 
    required: true 
  },

  date: { type: String, required: true },     // format "2025-02-12"
  time: { type: String, required: true },     // "10:00"

  status: {
    type: String,
    enum: ["En attente", "En cours", "Terminé"],
    default: "En attente"
  },

}, { timestamps: true });

module.exports = mongoose.model("Rdv", rdvSchema);
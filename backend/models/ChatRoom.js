// backend/models/ChatRoom.js
const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Ex: "Cardiologie"
  specialty: { type: String, required: true }, // Ex: "cardiologie"
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Médecins dans le salon
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
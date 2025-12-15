// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

// 🔹 Charger ou créer un salon pour une spécialité
router.get('/room/:specialty', authMiddleware, verifyRole(['medecin']), async (req, res) => {
  try {
    const { specialty } = req.params;
    const medecinId = req.user.userId;

    // Trouver ou créer un salon pour cette spécialité
    let room = await ChatRoom.findOne({ specialty });

    if (!room) {
      room = new ChatRoom({
        name: `${specialty.charAt(0).toUpperCase() + specialty.slice(1)}`,
        specialty,
        members: [medecinId],
      });
      await room.save();
    } else {
      // Ajouter le médecin au salon s’il n’y est pas déjà
      if (!room.members.includes(medecinId)) {
        room.members.push(medecinId);
        await room.save();
      }
    }

    res.json(room);
  } catch (err) {
    console.error('Erreur chargement salon:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 🔹 Charger les messages d’un salon
router.get('/messages/:roomId', authMiddleware, verifyRole(['medecin']), async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({ chatRoom: roomId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Erreur chargement messages:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 🔹 Envoyer un message
router.post('/messages', authMiddleware, verifyRole(['medecin']), async (req, res) => {
  try {
    const { roomId, text } = req.body;
    const senderId = req.user.userId;

    const message = new Message({
      chatRoom: roomId,
      sender: senderId,
      text,
    });

    await message.save();
    await message.populate('sender', 'name');

    // Ici, tu peux émettre le message via Socket.io (voir Étape 3)
    io.to(roomId).emit('newMessage', message);

    res.json(message);
  } catch (err) {
    console.error('Erreur envoi message:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
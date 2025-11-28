const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const token = jwt.sign(
      { userId: user._id,
        role: user.role
       },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role          // ⬅️ AJOUT
  }
});

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Vérifier si celui qui crée le compte est ADMIN
    let finalRole = "patient"; // par défaut

    if (req.user && req.user.role === "admin") {
      // L’admin peut créer medecin ou secretaire
      finalRole = role || "patient";
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: finalRole
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "Compte créé avec succès",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error) {
    console.error("Erreur d'inscription:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
router.get('/users', authMiddleware, verifyRole(['admin', 'medecin', 'secretaire']), async (req, res) => {
    try {
        const role = req.query.role;
        const users = await User.find(role ? { role } : {});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
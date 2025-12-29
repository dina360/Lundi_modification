// backend/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

// 🧩 Helper : génération du token
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '1d' }
  );
}

/* ---------------------------------------------------
   1) INSCRIPTION PUBLIQUE → PATIENT UNIQUEMENT
----------------------------------------------------*/
// /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nom, email et mot de passe sont obligatoires.' });
    }

    // Vérifier si email déjà utilisé
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cet email.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 🔒 Rôle forcé à PATIENT
    const user = new User({
      name,
      email,
      password: hashed,
      role: 'patient',      // <-- important
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: 'Compte patient créé avec succès.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erreur register patient:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* ---------------------------------------------------
   2) CRÉATION STAFF PAR ADMIN (médecin / secrétaire)
----------------------------------------------------*/
// /api/auth/register-staff
router.post(
  '/register-staff',
  authMiddleware,
  verifyRole(['admin']),
  async (req, res) => {
    try {
      const { name, email, password, role, specialty } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Nom, email, mot de passe et rôle sont obligatoires.' });
      }

      if (!['medecin', 'secretaire'].includes(role)) {
        return res.status(400).json({ message: 'Rôle invalide (doit être medecin ou secretaire).' });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Un compte existe déjà avec cet email.' });
      }

      const hashed = await bcrypt.hash(password, 10);

      const user = new User({
        name,
        email,
        password: hashed,
        role,          // medecin ou secretaire
        specialty: specialty || null,
      });

      await user.save();

      res.status(201).json({
        message: 'Compte staff créé avec succès.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          specialty: user.specialty,
        },
      });
    } catch (error) {
      console.error('Erreur register-staff:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
);

/* ---------------------------------------------------
   3) LOGIN (tous rôles) 
----------------------------------------------------*/
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Renvoyer le token et les informations de l'utilisateur
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Inclure le rôle de l'utilisateur
      },
    });
  } catch (err) {
    console.error("Erreur de connexion:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



/* ---------------------------------------------------
   4) /me → infos utilisateur connecté
----------------------------------------------------*/
// /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erreur /me:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* ---------------------------------------------------
   5) LISTE DES USERS (ADMIN UNIQUEMENT)
   + filtre ?role=medecin / secretaire / patient / admin
----------------------------------------------------*/
// /api/auth/users
router.get(
  '/users',
  authMiddleware,
  verifyRole(['admin']),
  async (req, res) => {
    try {
      const { role } = req.query;
      const filter = role ? { role } : {};
      const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      console.error('Erreur /users:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
);

module.exports = router;

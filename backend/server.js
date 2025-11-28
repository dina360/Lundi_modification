// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const dashboardRoutes = require('./routes/dashboard');
const dashboardAdvanced = require('./routes/dashboardAdvanced');
const authMiddleware = require('./middleware/authMiddleware');
const verifyRole = require('./middleware/verifyRole');
const appointmentRoutes = require('./routes/appointmentRoutes');
const app = express();
const port = 5000;

// ============================
// Middlewares globaux
// ============================
app.use(bodyParser.json());
app.use(cors());

// Middleware de log simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ============================
// Connexion MongoDB
// ============================
const dbURL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hopital';

mongoose
  .connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connexion MongoDB réussie'))
  .catch((err) => console.error('❌ Erreur MongoDB:', err));

// ============================
// Routes AUTH
// ============================
//
// /api/auth/login      -> public (login)
// /api/auth/register   -> public (inscription patient)
// /api/auth/admin/...  -> protégé (création comptes staff) -> géré dans authRoutes
//
app.use('/api/auth', authRoutes);

// ============================
// Routes protégées (staff)
// ============================

// Patients : accès staff (admin / medecin / secretaire)
app.use(
  '/api/patients',
  authMiddleware,
  verifyRole(['admin', 'medecin', 'secretaire']),
  patientRoutes
);
app.use(
  '/api/appointments',
  authMiddleware,
  verifyRole(['admin', 'medecin', 'secretaire']),
  appointmentRoutes
);

// Dashboard analytique
app.use(
  '/api/dashboard/advanced',
  authMiddleware,
  verifyRole(['admin', 'medecin', 'secretaire']),
  dashboardAdvanced
);

// Dashboard simple (statistiques de base)
app.use(
  '/api/dashboard',
  authMiddleware,
  verifyRole(['admin', 'medecin', 'secretaire']),
  dashboardRoutes
);

// Exemple si un jour tu utilises /api/protected
// const protectedRoutes = require('./routes/protected');
// app.use(
//   '/api/protected',
//   authMiddleware,
//   verifyRole(['admin', 'medecin']),
//   protectedRoutes
// );

// ============================
// Fichiers statiques (uploads)
// ============================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================
// 404
// ============================
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ============================
// Démarrage serveur
// ============================
app.listen(port, () =>
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`)
);

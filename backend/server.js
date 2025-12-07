require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const dashboardRoutes = require('./routes/dashboard');
const dashboardAdvanced = require('./routes/dashboardAdvanced');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medecinRoutes = require('./routes/medecinRoutes'); // <-- ajouté
const consultationRoutes = require('./routes/consultationRoutes');

// Middleware
const authMiddleware = require('./middleware/authMiddleware');
const verifyRole = require('./middleware/verifyRole');

const app = express();
const port = process.env.PORT || 5000;

// ============================
// Middlewares globaux
// ============================
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // ⚠ expose le dossier uploads

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
// Routes publiques / auth
// ============================
app.use('/api/auth', authRoutes);

// ============================
// Routes protégées (staff)
// ============================

// Patients : admin / medecin / secretaire
app.use(
  '/api/patients',
  authMiddleware,
  verifyRole(['admin', 'medecin', 'secretaire']),
  patientRoutes
);

// Appointments
app.use(
  '/api/appointments',
  authMiddleware,
  verifyRole(['admin', 'medecin', 'secretaire']),
  appointmentRoutes
);

// Dashboard
app.use(
  '/api/dashboard/advanced',
  authMiddleware,
  verifyRole(['admin', 'medecin', 'secretaire']),
  dashboardAdvanced
);
app.use(
  '/api/dashboard',
  authMiddleware,
  verifyRole(['admin', 'medecin', 'secretaire']),
  dashboardRoutes
);

// Médecins : upload photo + autres routes
app.use(
  '/api/medecins',
  authMiddleware,
  verifyRole(['admin', 'medecin']),
  medecinRoutes
);

// 🔥 Déplacer cette route ici, après les middlewares globaux
app.use('/api/consultations', authMiddleware, verifyRole(['medecin']), consultationRoutes);

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
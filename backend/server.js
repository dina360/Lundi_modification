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

const app = express();
const port = 5000;

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Middleware de log
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Connexion à MongoDB
const dbURL = 'mongodb://127.0.0.1:27017/hopital';
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connexion MongoDB réussie'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rendre le dossier 'uploads' accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Lancement du serveur
app.listen(port, () => console.log(`🚀 Serveur démarré sur http://localhost:${port}`));

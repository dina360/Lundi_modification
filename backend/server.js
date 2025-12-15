// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const dashboardRoutes = require("./routes/dashboard");
const dashboardAdvanced = require("./routes/dashboardAdvanced");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const staffRoutes = require("./routes/staffRoutes");
const roomRoutes = require("./routes/roomRoutes");
const maladeRdvRoutes = require("./routes/maladeRdvRoutes");

const authMiddleware = require("./middleware/authMiddleware");
const verifyRole = require("./middleware/verifyRole");

const app = express();
const port = 5000;

/* =========================
   Middlewares globaux
========================= */
app.use(bodyParser.json());
app.use(cors());

// Log des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Fichiers statiques (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   Connexion MongoDB
========================= */
const dbURL =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hospital";

mongoose
  .connect(dbURL)
  .then(() => console.log("✅ Connexion MongoDB réussie"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

/* =========================
   Routes AUTH (PUBLIQUES)
========================= */
// /api/auth/login
// /api/auth/register
app.use("/api/auth", authRoutes);

/* =========================
   Routes PROTÉGÉES
========================= */

// Patients → admin / medecin / secretaire
app.use(
  "/api/patients",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  patientRoutes
);

// Personnel (admin)
app.use(
  "/api/staff",
  authMiddleware,
  verifyRole(["admin"]),
  staffRoutes
);

// Médecins (admin)
app.use(
  "/api/doctors",
  authMiddleware,
  verifyRole(["admin"]),
  doctorRoutes
);

// Rendez-vous
app.use(
  "/api/appointments",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  appointmentRoutes
);

// Salles & blocs (admin)
app.use(
  "/api/salles",
  authMiddleware,
  verifyRole(["admin"]),
  roomRoutes
);

// Dashboard avancé
app.use(
  "/api/dashboard/advanced",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  dashboardAdvanced
);

// Dashboard simple
app.use(
  "/api/dashboard",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  dashboardRoutes
);

app.use(
  "/api/malade/rdv",
  authMiddleware,
  verifyRole(["patient"]),
  maladeRdvRoutes
);


/* =========================
   Route 404
========================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

/* =========================
   Démarrage serveur
========================= */
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});

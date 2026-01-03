// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

// Routes
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const dashboardRoutes = require("./routes/dashboard");
const dashboardAdvanced = require("./routes/dashboardAdvanced");
const appointmentRoutes = require("./routes/appointmentRoutes");
const medecinRoutes = require("./routes/medecinRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const disponibilitesRoutes = require("./routes/disponibilitesRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const staffRoutes = require("./routes/staffRoutes");
const roomRoutes = require("./routes/roomRoutes");
const maladeRdvRoutes = require("./routes/maladeRdvRoutes");
const predictionRoutes = require("./routes/prediction");
const secretaireRoutes = require("./routes/secretaireRoutes");

// Middlewares
const authMiddleware = require("./middleware/authMiddleware");
const verifyRole = require("./middleware/verifyRole");

// ============================
// Initialisation serveur
// ============================
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Rendre io accessible partout
global.io = io;

const port = process.env.PORT || 5000;

/* =========================
   Middlewares globaux
========================= */
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Important pour les requêtes preflight
app.options("*", cors());

// uploads statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/* =========================
   Connexion MongoDB
========================= */
const dbURL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hospital";

mongoose
  .connect(dbURL)
  .then(() => console.log("✅ Connexion MongoDB réussie"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

/* =========================
   Routes PUBLIQUES
========================= */
app.use("/api/auth", authRoutes);

/* =========================
   Routes PROTÉGÉES
========================= */

// Malade RDV (patient)
app.use(
  "/api/malade/rdv",
  authMiddleware,
  verifyRole(["patient"]),
  maladeRdvRoutes
);

// Patients (admin/medecin/secretaire)
app.use(
  "/api/patients",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  patientRoutes
);

app.use(
  "/api/secretaire",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  secretaireRoutes
);

// Personnel (admin)
app.use("/api/staff", authMiddleware, verifyRole(["admin"]), staffRoutes);

// Appointments (admin/medecin/secretaire)
app.use(
  "/api/appointments",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  appointmentRoutes
);

// Doctors (admin)
app.use("/api/doctors", authMiddleware, verifyRole(["admin"]), doctorRoutes);

// ✅✅✅ SALLES (admin + secretaire)  <-- CORRECTION ICI
app.use(
  "/api/salles",
  authMiddleware,
  verifyRole(["admin", "secretaire"]),
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

// Médecins (admin/medecin)
app.use(
  "/api/medecins",
  authMiddleware,
  verifyRole(["admin", "medecin"]),
  medecinRoutes
);

// Consultations + disponibilités (medecin)
app.use(
  "/api/consultations",
  authMiddleware,
  verifyRole(["medecin"]),
  consultationRoutes
);

app.use(
  "/api/disponibilites",
  authMiddleware,
  verifyRole(["medecin"]),
  disponibilitesRoutes
);

// Chat (medecin)
app.use("/api/chat", authMiddleware, verifyRole(["medecin"]), chatRoutes);

// IA (patient)
app.use(
  "/api/prediction",
  authMiddleware,
  verifyRole(["patient"]),
  predictionRoutes
);

/* =========================
   Route 404
========================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

/* =========================
   Socket.io
========================= */
io.use((socket, next) => {
  next();
});

io.on("connection", (socket) => {
  console.log("Un utilisateur s'est connecté au chat");

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`📌 Socket ${socket.id} a rejoint le salon ${roomId}`);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.roomId).emit("newMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Un utilisateur s'est déconnecté du chat");
  });
});

/* =========================
   Démarrage serveur
========================= */
server.listen(port, () =>
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`)
);
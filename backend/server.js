// backend/server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

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

// Middlewares
const authMiddleware = require("./middleware/authMiddleware");
const verifyRole = require("./middleware/verifyRole");

// ============================
// Initialisation serveur
// ============================
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Rendre io accessible partout
global.io = io;

// ============================
// Middlewares globaux
// ============================
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ============================
// Routes publiques
// ============================
app.use("/api/auth", authRoutes);

// ============================
// Routes protégées
// ============================
app.use(
  "/api/malade/rdv",
  authMiddleware,
  verifyRole(["patient"]),
  maladeRdvRoutes
);

app.use(
  "/api/patients",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  patientRoutes
);

app.use(
  "/api/staff",
  authMiddleware,
  verifyRole(["admin"]),
  staffRoutes
);

app.use(
  "/api/appointments",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  appointmentRoutes
);

app.use(
  "/api/doctors",
  authMiddleware,
  verifyRole(["admin"]),
  doctorRoutes
);

app.use(
  "/api/salles",
  authMiddleware,
  verifyRole(["admin"]),
  roomRoutes
);

app.use(
  "/api/dashboard/advanced",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  dashboardAdvanced
);

app.use(
  "/api/dashboard",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  dashboardRoutes
);

app.use(
  "/api/medecins",
  authMiddleware,
  verifyRole(["admin", "medecin"]),
  medecinRoutes
);

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

app.use(
  "/api/chat",
  authMiddleware,
  verifyRole(["medecin"]),
  chatRoutes
);

// ============================
// Route 404
// ============================
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// ============================
// MongoDB
// ============================
const dbURL =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hospital";

mongoose
  .connect(dbURL)
  .then(() => console.log("✅ Connexion MongoDB réussie"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

// ============================
// Socket.io
// ============================
io.use((socket, next) => {
  // Ici tu peux vérifier le JWT si besoin
  next();
});

io.on("connection", (socket) => {
  console.log("🟢 Utilisateur connecté :", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`📌 Socket ${socket.id} a rejoint le salon ${roomId}`);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.roomId).emit("newMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Utilisateur déconnecté :", socket.id);
  });
});


// ============================
// Démarrage serveur
// ============================
const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});

// backend/server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const path = require("path");
const socketIo = require('socket.io');
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const dashboardRoutes = require("./routes/dashboard");
const dashboardAdvanced = require("./routes/dashboardAdvanced");
const appointmentRoutes = require("./routes/appointmentRoutes");
const medecinRoutes = require('./routes/medecinRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const chatRoutes = require('./routes/chatRoutes'); // ✅ Ajoute cette ligne
const disponibilitesRoutes = require('./routes/disponibilitesRoutes'); // ✅ Ajoute cette ligne
const doctorRoutes = require("./routes/doctorRoutes");
const staffRoutes = require("./routes/staffRoutes");
const roomRoutes = require("./routes/roomRoutes");
const maladeRdvRoutes = require("./routes/maladeRdvRoutes");
const authMiddleware = require('./middleware/authMiddleware');

const verifyRole = require("./middleware/verifyRole");


const app = express();
const server = http.createServer(app); // ✅ Créer un serveur HTTP
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // ✅ Autoriser ton frontend
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 5000;

/* =========================
   Middlewares globaux
========================= */
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api/auth', authRoutes); 

// Log des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Fichiers statiques (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/api/malade/rdv",
  authMiddleware,
  verifyRole(["patient"]),
  maladeRdvRoutes
);
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
   Routes PROTÉGÉES
========================= */


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
app.use(
  "/api/appointments",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  appointmentRoutes
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

app.use(
  "/api/dashboard",
  authMiddleware,
  verifyRole(["admin", "medecin", "secretaire"]),
  dashboardRoutes
);



// Médecins : upload photo + autres routes
app.use(
  '/api/medecins',
  authMiddleware,
  verifyRole(['admin', 'medecin']),
  medecinRoutes
);

// Consultations et disonibilités : medecin uniquement
app.use('/api/consultations', authMiddleware, verifyRole(['medecin']), consultationRoutes);
app.use('/api/disponibilites', authMiddleware, verifyRole(['medecin']), disponibilitesRoutes); // ✅ Ajoute cette ligne

// ✅ Nouvelle route : Chat
app.use('/api/chat', authMiddleware, verifyRole(['medecin']), chatRoutes);


/* =========================
   Route 404
========================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});


// ============================
// Socket.io
// ============================
io.use((socket, next) => {
  // Ici, tu peux vérifier l'authentification via JWT si tu veux
  next();
});

io.on('connection', (socket) => {
  console.log('Un utilisateur s\'est connecté au chat');

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} a rejoint le salon ${roomId}`);
  });

  socket.on('sendMessage', (data) => {
    // Diffuser le message à tous les utilisateurs du salon
    io.to(data.roomId).emit('newMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté du chat');
  });
});
// ✅ Exporte io globalement pour y accéder dans les routes
global.io = io; // 🔥 Ajoute cette ligne
// ============================
// Démarrage serveur
// ============================
server.listen(port, () => // ✅ Écoute sur le serveur HTTP
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`)
);

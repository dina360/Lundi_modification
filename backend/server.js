require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// ============================
// Imports des routes
// ============================
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const dashboardRoutes = require('./routes/dashboard');
const dashboardAdvanced = require('./routes/dashboardAdvanced');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medecinRoutes = require('./routes/medecinRoutes');
const consultationRoutes = require('./routes/consultationRoutes');

// Routes venant de la branche main (⚠ ajoutées et fusionnées)
const doctorRoutes = require('./routes/doctorRoutes');
const staffRoutes = require("./routes/staffRoutes");
const roomRoutes = require("./routes/roomRoutes");

// ============================
// Middlewares
// ============================
const authMiddleware = require('./middleware/authMiddleware');
const verifyRole = require('./middleware/verifyRole');

const app = express();
const port = process.env.PORT || 5000;

// ============================
// Middlewares globaux
// ============================
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

app.use((req,res,next)=>{
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ============================
// MongoDB
// ============================
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hopital', {
  useNewUrlParser:true, 
  useUnifiedTopology:true
})
.then(()=>console.log("✅ MongoDB connecté"))
.catch(err=>console.error("❌ Erreur MongoDB:",err));

// ============================
// ROUTES
// ============================

// 🔓 Auth
app.use('/api/auth', authRoutes);

// 👥 Patients
app.use('/api/patients', authMiddleware, verifyRole(['admin','medecin','secretaire']), patientRoutes);

// 📅 Appointments
app.use('/api/appointments', authMiddleware, verifyRole(['admin','medecin','secretaire']), appointmentRoutes);

// 📊 Dashboard
app.use('/api/dashboard', authMiddleware, verifyRole(['admin','medecin','secretaire']), dashboardRoutes);
app.use('/api/dashboard/advanced', authMiddleware, verifyRole(['admin','medecin','secretaire']), dashboardAdvanced);

// 🧑‍⚕ Upload Photo / Profil Médecin
app.use('/api/medecins', authMiddleware, verifyRole(['admin','medecin']), medecinRoutes);

// 📄 Nouvelle route consultation
app.use('/api/consultations', authMiddleware, verifyRole(['medecin']), consultationRoutes);

// 🔥 Routes ajoutées du main (fusion OK)
app.use("/api/staff", staffRoutes);
app.use("/api/doctors", authMiddleware, verifyRole(['admin']), doctorRoutes);
app.use("/api/salles", roomRoutes);

// ============================
// 404
// ============================
app.use((req,res)=>{
  res.status(404).json({error:"Route introuvable"});
});

// ============================
// START SERVER
// ============================
app.listen(port, ()=>console.log(`🚀 Serveur lancé : http://localhost:${port}`));

// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const Patient = require('../models/patientModel');

// Route GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await Patient.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Pour chaque mois, on vérifie si des patients ont été créés ; sinon, on met 0.
    const allMonthsData = Array.from({ length: 12 }, (_, i) => {
      const found = stats.find(s => s._id.month === i + 1);
      return found ? found.count : 0;
    });

    res.json({ labels: months, values: allMonthsData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Route GET /api/dashboard/appointments-today
router.get('/appointments-today', async (req, res) => {
  try {
    const now = new Date();
    // Calcul du début et de la fin de la journée (heure locale)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Pour débogage : affichage dans la console des bornes de la journée
    console.log("startOfDay:", startOfDay, "endOfDay:", endOfDay);

    const patients = await Patient.find({
      $or: [
        { lastAppointment: { $gte: startOfDay, $lt: endOfDay } },
        { nextAppointment: { $gte: startOfDay, $lt: endOfDay } }
      ]
    });

    // Formatage des résultats pour renvoyer un tableau d'objets contenant le type, la date et le nom du patient
    const appointments = patients.flatMap(patient => {
      const results = [];
      if (patient.lastAppointment && patient.lastAppointment >= startOfDay && patient.lastAppointment < endOfDay) {
        results.push({
          type: 'Dernier',
          date: patient.lastAppointment,
          patient: patient.name
        });
      }
      if (patient.nextAppointment && patient.nextAppointment >= startOfDay && patient.nextAppointment < endOfDay) {
        results.push({
          type: 'Prochain',
          date: patient.nextAppointment,
          patient: patient.name
        });
      }
      return results;
    });

    res.json({ appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route GET /api/dashboard/total
router.get('/total', async (req, res) => {
  try {
    const total = await Patient.countDocuments();
    res.json({ total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

// backend/routes/dashboardAdvanced.js
const express = require('express');
const router = express.Router();
const Patient = require('../models/patientModel');
const User = require('../models/User');

// 📌 Statistiques globales
router.get('/global-stats', async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalMedecins = await User.countDocuments({ role: 'medecin' });
    const totalSecretaires = await User.countDocuments({ role: 'secretaire' });

    // 🗓️ Calcul des rendez-vous du jour à partir de lastAppointment / nextAppointment
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const patientsWithTodayRdv = await Patient.countDocuments({
      $or: [
        { lastAppointment: { $gte: startOfDay, $lt: endOfDay } },
        { nextAppointment: { $gte: startOfDay, $lt: endOfDay } }
      ]
    });

    res.json({
      totalPatients,
      totalMedecins,
      totalSecretaires,
      appointmentsToday: patientsWithTodayRdv
    });
  } catch (error) {
    console.error('Erreur /global-stats:', error);
    res.status(500).json({ error: 'Erreur récupération statistiques globales.' });
  }
});

// 📌 Statistiques mensuelles patients (création)
router.get('/patients-per-month', async (req, res) => {
  try {
    const stats = await Patient.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    // Tableau avec 12 mois initialisés à 0
    const result = new Array(12).fill(0);
    stats.forEach(s => {
      const idx = s._id.month - 1; // mois 1–12 → index 0–11
      if (idx >= 0 && idx < 12) {
        result[idx] = s.count;
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Erreur /patients-per-month:', error);
    res.status(500).json({ error: 'Erreur stats mensuelles.' });
  }
});

// 📌 Rendez-vous par jour de la semaine (basé sur nextAppointment)
router.get('/rdv-week', async (req, res) => {
  try {
    // On compte les patients qui ont un nextAppointment (présent)
    const stats = await Patient.aggregate([
      {
        $match: {
          nextAppointment: { $ne: null }
        }
      },
      {
        $group: {
          _id: { day: { $dayOfWeek: "$nextAppointment" } },
          count: { $sum: 1 }
        }
      }
    ]);

    // Tableau Dim → Sam (7 jours, index 0–6)
    const result = [0, 0, 0, 0, 0, 0, 0];
    stats.forEach(s => {
      const dayIndex = s._id.day - 1; // $dayOfWeek: dimanche = 1 → index 0
      if (dayIndex >= 0 && dayIndex < 7) {
        result[dayIndex] = s.count;
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Erreur /rdv-week:', error);
    res.status(500).json({ error: 'Erreur stats hebdomadaires.' });
  }
});

// 📌 Activité par médecin
router.get('/medecins-activity', async (req, res) => {
  try {
    const medecins = await User.find({ role: 'medecin' });

    // Comme tu n'as pas encore de modèle Appointment lié aux médecins,
    // on simule le nombre de consultations pour le visuel du dashboard.
    const activity = medecins.map((m) => ({
      name: m.name,
      totalConsultations: Math.floor(Math.random() * 30) + 1 // 1 à 30
    }));

    res.json(activity);
  } catch (error) {
    console.error('Erreur /medecins-activity:', error);
    res.status(500).json({ error: 'Erreur stats activité médecins.' });
  }
});

// 📌 Dernières activités (patients mis à jour récemment)
router.get('/recent-activities', async (req, res) => {
  try {
    const recentPatients = await Patient.find()
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json(recentPatients);
  } catch (error) {
    console.error('Erreur /recent-activities:', error);
    res.status(500).json({ error: 'Erreur activités récentes.' });
  }
});

module.exports = router;

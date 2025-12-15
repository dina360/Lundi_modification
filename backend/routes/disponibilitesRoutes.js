// backend/routes/disponibilitesRoutes.js
const express = require('express');
const router = express.Router();
const Disponibilite = require('../models/Disponibilite');
const Conge = require('../models/Conge');
const authMiddleware = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

// 🔹 Charger les disponibilités du médecin
router.get('/medecin/:medecinId', authMiddleware, verifyRole(['medecin']), async (req, res) => {
  try {
    const { medecinId } = req.params;
    const disponibilites = await Disponibilite.find({ medecin: medecinId }).sort({ jour: 1 });
    const conges = await Conge.find({ medecin: medecinId }).sort({ dateDebut: 1 });
    res.json({ disponibilites, conges });
  } catch (err) {
    console.error('Erreur chargement disponibilités:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 🔹 Ajouter une disponibilité
router.post('/medecin/:medecinId', authMiddleware, verifyRole(['medecin']), async (req, res) => {
  try {
    const { medecinId } = req.params;
    const { jour, debut, fin } = req.body;

    const disponibilite = new Disponibilite({
      medecin: medecinId,
      jour,
      debut,
      fin,
    });

    await disponibilite.save();

    res.json(disponibilite);
  } catch (err) {
    console.error('Erreur ajout disponibilité:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 🔹 Supprimer une disponibilité
router.delete('/disponibilite/:id', authMiddleware, verifyRole(['medecin']), async (req, res) => {
  try {
    const { id } = req.params;
    await Disponibilite.findByIdAndDelete(id);
    res.json({ message: 'Disponibilité supprimée.' });
  } catch (err) {
    console.error('Erreur suppression disponibilité:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 🔹 Ajouter un congé
router.post('/conge/medecin/:medecinId', authMiddleware, verifyRole(['medecin']), async (req, res) => {
  try {
    const { medecinId } = req.params;
    const { dateDebut, dateFin, motif } = req.body;

    const conge = new Conge({
      medecin: medecinId,
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      motif,
    });

    await conge.save();

    res.json(conge);
  } catch (err) {
    console.error('Erreur ajout congé:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 🔹 Supprimer un congé
router.delete('/conge/:id', authMiddleware, verifyRole(['medecin']), async (req, res) => {
  try {
    const { id } = req.params;
    await Conge.findByIdAndDelete(id);
    res.json({ message: 'Congé supprimé.' });
  } catch (err) {
    console.error('Erreur suppression congé:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
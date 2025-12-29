// routes/protected.js
const express = require('express');
const router = express.Router();
const verifyRole = require('../middleware/verifyRole');

// Exemple d'une route protégée accessible aux admins et médecins
router.get('/dashboard-data', verifyRole(['admin', 'medecin']), (req, res) => {
  res.json({ message: 'Accès autorisé à la donnée du dashboard' });
});

module.exports = router;

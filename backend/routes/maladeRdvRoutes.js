const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/maladeRdvController");

// Liste des spécialités
router.get("/specialites", ctrl.getSpecialites);

// Liste des médecins d'une spécialité
router.get("/medecins/:specialite", ctrl.getMedecinsBySpecialite);

// Créneaux disponibles pour un médecin
router.get("/disponibilites/:doctorId", ctrl.getDisponibilites);

// Créer un rendez-vous
router.post("/prendre", ctrl.prendreRdv);

// Supprimer un rendez-vous
router.delete("/rdv/:id", ctrl.deleteRdv);

// Modifier un rendez-vous
router.put("/rdv/:id", ctrl.updateRdv);

// Historique du malade
router.get("/historique/:maladeId", ctrl.getHistorique);

// Statistiques du malade
router.get("/stats/:maladeId", ctrl.getStats);

// Profil du malade
router.get("/profile/:maladeId", ctrl.getProfile);

module.exports = router;
// backend/routes/secretaireRoutes.js
const express = require("express");
const router = express.Router();

const { getSecretaireDashboard } = require("../controllers/secretaireController");

// ✅ GET /api/secretaire/dashboard
router.get("/dashboard", getSecretaireDashboard);

module.exports = router;

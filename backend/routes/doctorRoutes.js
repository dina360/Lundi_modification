// backend/routes/doctorRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadDoctorPhoto");
const ctrl = require("../controllers/doctorController");

router.get("/", ctrl.getDoctors);
router.get("/:id", ctrl.getDoctorById);
router.post("/", upload.single("photo"), ctrl.createDoctor);
router.put("/:id", upload.single("photo"), ctrl.updateDoctor);
router.delete("/:id", ctrl.deleteDoctor);

module.exports = router;
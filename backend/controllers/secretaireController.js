// backend/controllers/secretaireController.js
const Patient = require("../models/patientModel");
const Appointment = require("../models/Appointment");

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// ✅ GET /api/secretaire/dashboard
exports.getSecretaireDashboard = async (req, res) => {
  try {
    const now = new Date();

    // ===== KPI Patients =====
    const nombrePatients = await Patient.countDocuments();

    // ===== RDV aujourd’hui =====
    const fromToday = startOfDay(now);
    const toToday = endOfDay(now);

    const nombreRdvAujourdHui = await Appointment.countDocuments({
      date: { $gte: fromToday, $lte: toToday },
    });

    // Table RDV Today
    const todayAppointments = await Appointment.find({
      date: { $gte: fromToday, $lte: toToday },
    })
      .populate("patient", "name dossier")
      .sort({ date: 1 })
      .lean();

    const rdvToday = todayAppointments.map((a) => {
      const d = new Date(a.date);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");

      return {
        _id: a._id,
        heure: `${hh}:${mm}`,
        patient: a.patient?.name ? a.patient.name : "—",
        motif: a.motif || "—",
        salle: "—", // ton modèle Appointment n’a pas salle => placeholder
        statut: a.status || "planifié",
      };
    });

    // ===== Stats RDV/PATIENTS par mois (année courante) =====
    const year = now.getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

    const agg = await Appointment.aggregate([
      { $match: { date: { $gte: yearStart, $lte: yearEnd } } },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          rdv: { $sum: 1 },
          patientsSet: { $addToSet: "$patient" }, // unique patients
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          rdv: 1,
          patients: { $size: "$patientsSet" },
        },
      },
      { $sort: { month: 1 } },
    ]);

    const moisLabels = [
      "",
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];

    const map = new Map(agg.map((x) => [x.month, x]));
    const rdvParMois = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const found = map.get(m);
      return {
        mois: moisLabels[m],
        rdv: found?.rdv || 0,
        patients: found?.patients || 0,
      };
    });

    return res.json({
      nombrePatients,
      nombreRdvAujourdHui,
      rdvToday,
      rdvParMois,
    });
  } catch (err) {
    console.error("❌ Erreur getSecretaireDashboard:", err);
    return res.status(500).json({ message: "Erreur serveur dashboard secrétaire." });
  }
};

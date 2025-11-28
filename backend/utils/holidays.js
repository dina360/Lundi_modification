// backend/utils/holidays.js
module.exports.getMoroccanHolidays = function (year) {
  return [
    `${year}-01-01`, // Nouvel an
    `${year}-01-11`, // Manifeste de l'indépendance
    `${year}-05-01`, // Fête du Travail
    `${year}-07-30`,
    `${year}-08-14`,
    `${year}-08-20`,
    `${year}-08-21`,
    `${year}-11-06`,
    `${year}-11-18`
  ];
};

// Jours à calcul lunaire : Aïd
module.exports.getVariableIslamicHolidays = function () {
  return [
    "2025-03-31", // Aid Al-Fitr (approx)
    "2025-04-01",
    "2025-06-07", // Aid Al-Adha
    "2025-06-08"
  ];
};

// backend/utils/holidays.js

// Exemple minimal (tu peux compléter)
// Format: "YYYY-MM-DD"
function getMoroccanHolidays(year) {
  return [
    `${year}-01-01`,
    `${year}-01-11`,
    `${year}-05-01`,
    `${year}-07-30`,
    `${year}-08-14`,
    `${year}-08-20`,
    `${year}-08-21`,
    `${year}-11-06`,
    `${year}-11-18`,
  ];
}

// Pour simplifier: retourne [] si tu ne veux pas gérer islamique maintenant
function getVariableIslamicHolidays() {
  return [];
}

module.exports = { getMoroccanHolidays, getVariableIslamicHolidays };

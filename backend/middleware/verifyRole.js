// backend/middleware/verifyRole.js
/**
 * Middleware pour vérifier que l'utilisateur a un rôle autorisé.
 * Nécessite que authMiddleware ait déjà rempli req.user.
 * 
 * @param {Array<string>} allowedRoles - ['admin', 'medecin', 'secretaire']
 */
const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    console.log(" 🔐 Rôle demandé:", allowedRoles); // ✅ Log
    console.log(" 🔐 Rôle de l'utilisateur:", req.user.role); // ✅ Log

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    console.log(" ✅ Rôle vérifié avec succès"); // ✅ Log
    next();
  };
};

module.exports = verifyRole;


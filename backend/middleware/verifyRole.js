// backend/middleware/verifyRole.js
/**
 * Middleware pour vérifier que l'utilisateur a un rôle autorisé.
 * Nécessite que authMiddleware ait déjà rempli req.user.
 * 
 * @param {Array<string>} allowedRoles - ['admin', 'medecin', 'secretaire']
 */
const verifyRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès interdit : rôle non autorisé" });
    }

    next();
  };
};

module.exports = verifyRole;

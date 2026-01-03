// backend/middleware/verifyRole.js
/**
 * Middleware pour vérifier que l'utilisateur a un rôle autorisé.
 * Nécessite que authMiddleware ait déjà rempli req.user.
 * 
 * @param {Array<string>} allowedRoles - ['admin', 'medecin', 'secretaire']
 */
const verifyRole = (allowedRoles = []) => {
  // Normaliser les rôles autorisés en minuscules
  const allowed = allowedRoles.map((r) => String(r).toLowerCase());

  return (req, res, next) => {
    console.log(" 🔐 Rôle demandé:", allowedRoles); // Log roles demandés
    console.log(" 🔐 Rôle de l'utilisateur:", req.user?.role); // Log rôle utilisateur

    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const role = String(req.user.role).toLowerCase();

    if (!allowed.includes(role)) {
      return res.status(403).json({ message: "Accès refusé : rôle non autorisé" });
    }

    console.log(" ✅ Rôle vérifié avec succès"); // Log succès
    next();
  };
};

module.exports = verifyRole;

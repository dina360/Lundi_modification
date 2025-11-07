// backend/middleware/verifyRole.js
/**
 * Middleware pour vérifier le rôle de l'utilisateur.
 * 
 * Pour les tests, si req.user n’est pas défini, on simule un utilisateur avec le rôle "admin".
 * En production, vous devez préalablement authentifier l’utilisateur et définir req.user.
 *
 * @param {Array<string>} allowedRoles - Liste des rôles autorisés (ex: ['admin', 'medecin']).
 * @returns {Function} Middleware Express.
 */
const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    // Simuler un utilisateur authentifié pour les tests
    if (!req.user) {
      req.user = { role: 'admin' }; // Simuler un utilisateur avec le rôle admin
    }

    // Vérifier si le rôle de l'utilisateur est autorisé
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès interdit : rôle non autorisé." });
    }

    next();
  };
};

module.exports = verifyRole;

  
  
/**
 * Restricts a route to the given list of roles.
 * Must run after authMiddleware, which attaches req.user.
 *
 * Usage: roleMiddleware('admin') or roleMiddleware('admin', 'analyst')
 */
function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
        errors: null
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
        errors: null
      });
    }

    next();
  };
}

module.exports = roleMiddleware;

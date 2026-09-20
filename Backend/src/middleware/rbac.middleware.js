/**
 * Role-Based Access Control (RBAC) middleware
 * Enforces role restrictions on protected endpoints
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. User identity not found."
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(", ")}]`
      });
    }

    next();
  };
}

module.exports = {
  authorize,
  requireRole: authorize
};

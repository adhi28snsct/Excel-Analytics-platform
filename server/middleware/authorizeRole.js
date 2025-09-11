// middleware/authorizeRole.js
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();
    const normalizedRoles = allowedRoles.map(r => r.toLowerCase());

    if (!userRole || !normalizedRoles.includes(userRole)) {
      console.warn(`🚫 Unauthorized role: ${userRole} tried accessing ${req.originalUrl}`);
      return res.status(403).json({ error: "Access denied: Insufficient permissions" });
    }

    next();
  };
};

export { authorizeRole };
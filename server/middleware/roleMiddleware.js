const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Required role: ${roles.join("/")}` });
  }
  next();
};

const staffOnly = requireRoles("manager", "admin", "superadmin");
const adminOnly = requireRoles("admin", "superadmin");
const superAdminOnly = requireRoles("superadmin");

module.exports = { requireRoles, staffOnly, adminOnly, superAdminOnly };

/**
 * Role-based access control middleware.
 * Accepts one or more roles and denies access if the user's role is not included.
 *
 * Usage: authorize("admin", "organizer")
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      const error = new Error("Authentication required.");
      error.statusCode = 401;
      return next(error);
    }

    if (!roles.includes(req.user.role)) {
      const error = new Error(
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      );
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

module.exports = authorize;

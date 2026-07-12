const AppError = require("../utils/AppError");

const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      if (!roles.includes(req.user.role)) {
        throw new AppError("Forbidden", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorize,
};

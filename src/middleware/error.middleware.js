const AppError = require("../utils/AppError");

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  if (err?.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Duplicate field value entered",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  if (err?.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  if (err?.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;

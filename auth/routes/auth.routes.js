const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../../src/middleware/auth.middleware");
const validateRequest = require("../../src/middleware/validate.middleware");
const { registerValidator, loginValidator } = require("../../src/validators/auth.validator");

router.post(
  "/register",
  registerValidator,
  validateRequest,
  authController.register
);

router.post(
  "/login",
  loginValidator,
  validateRequest,
  authController.login
);

router.get("/profile", authMiddleware, authController.getProfile);
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;

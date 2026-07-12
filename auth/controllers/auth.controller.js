const authService = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const result = await authService.getProfile(req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const result = await authService.logout(req, res);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const vehicleService = require('../services/vehicleService');

class VehicleController {
  createVehicle = async (req, res, next) => {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      res.status(201).json({
        success: true,
        message: 'Vehicle registered successfully.',
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  };

  getAllVehicles = async (req, res, next) => {
    try {
      const { search, status } = req.query;
      const vehicles = await vehicleService.getAllVehicles({ search, status });
      res.status(200).json({
        success: true,
        count: vehicles.length,
        data: vehicles
      });
    } catch (error) {
      next(error);
    }
  };

  getVehicleById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.getVehicleById(id);
      res.status(200).json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  };

  updateVehicle = async (req, res, next) => {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.updateVehicle(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Vehicle updated successfully.',
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  };

  deleteVehicle = async (req, res, next) => {
    try {
      const { id } = req.params;
      await vehicleService.deleteVehicle(id);
      res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new VehicleController();

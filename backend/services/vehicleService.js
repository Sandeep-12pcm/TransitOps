const { prisma } = require('../prisma/client');

// Maps external API/DB strings to Prisma Client enum keys
const STATUS_MAP = {
  'Available': 'Available',
  'On Trip': 'On_Trip',
  'In Shop': 'In_Shop',
  'Retired': 'Retired',
  'On_Trip': 'On_Trip',
  'In_Shop': 'In_Shop'
};

const VALID_STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired', 'On_Trip', 'In_Shop'];

/**
 * Validates vehicle input data.
 * Returns an array of error messages.
 */
function validateVehicleData(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate || data.registrationNumber !== undefined) {
    if (!data.registrationNumber || typeof data.registrationNumber !== 'string' || !data.registrationNumber.trim()) {
      errors.push('Registration Number is required.');
    }
  }

  if (!isUpdate || data.vehicleName !== undefined) {
    if (!data.vehicleName || typeof data.vehicleName !== 'string' || !data.vehicleName.trim()) {
      errors.push('Vehicle Name is required.');
    }
  }

  if (!isUpdate || data.vehicleType !== undefined) {
    if (!data.vehicleType || typeof data.vehicleType !== 'string' || !data.vehicleType.trim()) {
      errors.push('Vehicle Type is required.');
    }
  }

  if (!isUpdate || data.maximumLoadCapacity !== undefined) {
    const val = Number(data.maximumLoadCapacity);
    if (isNaN(val) || val < 0) {
      errors.push('Maximum Load Capacity cannot be negative.');
    }
  }

  if (!isUpdate || data.odometer !== undefined) {
    const val = Number(data.odometer);
    if (isNaN(val) || val < 0) {
      errors.push('Odometer cannot be negative.');
    }
  }

  if (!isUpdate || data.acquisitionCost !== undefined) {
    const val = Number(data.acquisitionCost);
    if (isNaN(val) || val < 0) {
      errors.push('Acquisition Cost cannot be negative.');
    }
  }

  if (data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status)) {
      errors.push('Status must be one of: Available, On Trip, In Shop, Retired.');
    }
  }

  return errors;
}

class VehicleService {
  async createVehicle(data) {
    const validationErrors = validateVehicleData(data);
    if (validationErrors.length > 0) {
      const err = new Error(validationErrors.join(' '));
      err.status = 400;
      throw err;
    }

    // Check uniqueness of registration number
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: data.registrationNumber.trim() }
    });
    if (existing) {
      const err = new Error(`Vehicle with registration number '${data.registrationNumber}' already exists.`);
      err.status = 400;
      throw err;
    }

    const prismaStatus = STATUS_MAP[data.status] || 'Available';

    return await prisma.vehicle.create({
      data: {
        registrationNumber: data.registrationNumber.trim(),
        vehicleName: data.vehicleName.trim(),
        vehicleType: data.vehicleType.trim(),
        maximumLoadCapacity: parseFloat(data.maximumLoadCapacity),
        odometer: parseFloat(data.odometer),
        acquisitionCost: parseFloat(data.acquisitionCost),
        status: prismaStatus
      }
    });
  }

  async getAllVehicles(filters = {}) {
    const { search, status } = filters;
    const where = {};

    if (search) {
      const searchTrimmed = search.trim();
      where.OR = [
        { registrationNumber: { contains: searchTrimmed, mode: 'insensitive' } },
        { vehicleName: { contains: searchTrimmed, mode: 'insensitive' } }
      ];
    }

    if (status) {
      const prismaStatus = STATUS_MAP[status];
      if (prismaStatus) {
        where.status = prismaStatus;
      }
    }

    return await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async getVehicleById(id) {
    const vehicleId = parseInt(id, 10);
    if (isNaN(vehicleId)) {
      const err = new Error('Invalid vehicle ID.');
      err.status = 400;
      throw err;
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      const err = new Error('Vehicle not found.');
      err.status = 404;
      throw err;
    }

    return vehicle;
  }

  async updateVehicle(id, data) {
    const vehicleId = parseInt(id, 10);
    if (isNaN(vehicleId)) {
      const err = new Error('Invalid vehicle ID.');
      err.status = 400;
      throw err;
    }

    // Verify exists
    const existing = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });
    if (!existing) {
      const err = new Error('Vehicle not found.');
      err.status = 404;
      throw err;
    }

    const validationErrors = validateVehicleData(data, true);
    if (validationErrors.length > 0) {
      const err = new Error(validationErrors.join(' '));
      err.status = 400;
      throw err;
    }

    // Check unique registration number if changed
    if (data.registrationNumber && data.registrationNumber.trim() !== existing.registrationNumber) {
      const duplicate = await prisma.vehicle.findUnique({
        where: { registrationNumber: data.registrationNumber.trim() }
      });
      if (duplicate) {
        const err = new Error(`Vehicle with registration number '${data.registrationNumber}' already exists.`);
        err.status = 400;
        throw err;
      }
    }

    // Prepare update data
    const updateData = {};
    if (data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNumber.trim();
    if (data.vehicleName !== undefined) updateData.vehicleName = data.vehicleName.trim();
    if (data.vehicleType !== undefined) updateData.vehicleType = data.vehicleType.trim();
    if (data.maximumLoadCapacity !== undefined) updateData.maximumLoadCapacity = parseFloat(data.maximumLoadCapacity);
    if (data.odometer !== undefined) updateData.odometer = parseFloat(data.odometer);
    if (data.acquisitionCost !== undefined) updateData.acquisitionCost = parseFloat(data.acquisitionCost);
    if (data.status !== undefined) {
      updateData.status = STATUS_MAP[data.status];
    }

    return await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData
    });
  }

  async deleteVehicle(id) {
    const vehicleId = parseInt(id, 10);
    if (isNaN(vehicleId)) {
      const err = new Error('Invalid vehicle ID.');
      err.status = 400;
      throw err;
    }

    // Verify exists
    const existing = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });
    if (!existing) {
      const err = new Error('Vehicle not found.');
      err.status = 404;
      throw err;
    }

    return await prisma.vehicle.delete({
      where: { id: vehicleId }
    });
  }
}

module.exports = new VehicleService();

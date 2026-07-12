import { prisma } from '../db.js';
import { mapVehicleToFrontend, mapVehicleToDb } from '../src/utils/mappers.js';

export const getVehicles = async (req, res) => {
  try {
    const list = await prisma.vehicle.findMany({
      orderBy: { model: 'asc' }
    });
    return res.status(200).json(list.map(mapVehicleToFrontend));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const data = mapVehicleToDb(req.body);
    if (!data.registrationNumber || !data.model || !data.type || !data.maxLoadCapacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const regNoRegex = /^[A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{1,2}[ -]?[0-9]{4}$/i;
    if (!regNoRegex.test(data.registrationNumber)) {
      return res.status(400).json({ error: 'Invalid registration number format. Expected format: MH-01-AA-1234' });
    }

    // Normalize
    const cleanReg = data.registrationNumber.replace(/[^a-zA-Z0-9]/g, '');
    data.registrationNumber = cleanReg.replace(/^([A-Z]{2})([0-9]{2})([A-Z]{1,2})([0-9]{4})$/i, '$1-$2-$3-$4').toUpperCase();

    if (data.maxLoadCapacity <= 0) {
      return res.status(400).json({ error: 'Max load capacity must be greater than 0 kg.' });
    }
    if (data.odometer < 0) {
      return res.status(400).json({ error: 'Odometer reading cannot be negative.' });
    }
    if (data.acquisitionCost < 0) {
      return res.status(400).json({ error: 'Acquisition cost cannot be negative.' });
    }

    // Unique check
    const duplicate = await prisma.vehicle.findUnique({
      where: { registrationNumber: data.registrationNumber }
    });
    if (duplicate) {
      return res.status(400).json({ error: 'Registration number already exists' });
    }

    const created = await prisma.vehicle.create({ data });
    return res.status(201).json(mapVehicleToFrontend(created));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const data = mapVehicleToDb(req.body);

    if (data.registrationNumber) {
      const regNoRegex = /^[A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{1,2}[ -]?[0-9]{4}$/i;
      if (!regNoRegex.test(data.registrationNumber)) {
        return res.status(400).json({ error: 'Invalid registration number format. Expected format: MH-01-AA-1234' });
      }
      
      const cleanReg = data.registrationNumber.replace(/[^a-zA-Z0-9]/g, '');
      data.registrationNumber = cleanReg.replace(/^([A-Z]{2})([0-9]{2})([A-Z]{1,2})([0-9]{4})$/i, '$1-$2-$3-$4').toUpperCase();
    }

    if (data.maxLoadCapacity !== undefined && data.maxLoadCapacity <= 0) {
      return res.status(400).json({ error: 'Max load capacity must be greater than 0 kg.' });
    }
    if (data.odometer !== undefined && data.odometer < 0) {
      return res.status(400).json({ error: 'Odometer reading cannot be negative.' });
    }
    if (data.acquisitionCost !== undefined && data.acquisitionCost < 0) {
      return res.status(400).json({ error: 'Acquisition cost cannot be negative.' });
    }

    // Unique check if regNo changed
    if (data.registrationNumber) {
      const duplicate = await prisma.vehicle.findFirst({
        where: {
          registrationNumber: data.registrationNumber,
          NOT: { id: parseInt(id) }
        }
      });
      if (duplicate) {
        return res.status(400).json({ error: 'Registration number already exists' });
      }
    }

    const updated = await prisma.vehicle.update({
      where: { id: parseInt(id) },
      data
    });
    return res.status(200).json(mapVehicleToFrontend(updated));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({
      where: { id: parseInt(id) }
    });
    return res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    if (error.code === 'P2003' || error.message.includes('foreign key constraint') || error.message.includes('violates RESTRICT')) {
      return res.status(400).json({ error: 'Cannot delete vehicle: It has associated trips in the system.' });
    }
    return res.status(500).json({ error: error.message });
  }
};

import { prisma } from '../db.js';
import { mapFuelLogToFrontend, mapFuelLogToDb } from '../src/utils/mappers.js';

export const getFuelLogs = async (req, res) => {
  try {
    const list = await prisma.fuelLog.findMany({
      include: {
        vehicle: true,
        trip: true
      },
      orderBy: { date: 'desc' }
    });
    return res.status(200).json(list.map(mapFuelLogToFrontend));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createFuelLog = async (req, res) => {
  try {
    const data = mapFuelLogToDb(req.body);
    if (!data.vehicleId || !data.date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (data.liters <= 0) {
      return res.status(400).json({ error: 'Fuel volume must be greater than 0 liters.' });
    }

    if (data.totalCost <= 0) {
      return res.status(400).json({ error: 'Total fuel cost must be greater than 0.' });
    }

    const created = await prisma.fuelLog.create({ data });
    return res.status(201).json(mapFuelLogToFrontend(created));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteFuelLog = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.fuelLog.delete({
      where: { id: parseInt(id) }
    });
    return res.status(200).json({ success: true, message: 'Fuel log deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

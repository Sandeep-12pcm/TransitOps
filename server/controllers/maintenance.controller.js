import { prisma } from '../db.js';
import { mapMaintenanceToFrontend, mapMaintenanceToDb } from '../src/utils/mappers.js';

export const getMaintenance = async (req, res) => {
  try {
    const list = await prisma.maintenanceLog.findMany({
      include: { vehicle: true },
      orderBy: { startDate: 'desc' }
    });
    return res.status(200).json(list.map(mapMaintenanceToFrontend));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Start Maintenance - Prisma Transaction
export const createMaintenance = async (req, res) => {
  try {
    const data = mapMaintenanceToDb(req.body);
    if (!data.vehicleId || !data.description || !data.startDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (data.cost !== undefined && data.cost < 0) {
      return res.status(400).json({ error: 'Estimated cost cannot be negative.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check vehicle
      const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) throw new Error('Vehicle not found');
      if (vehicle.status === 'RETIRED') throw new Error('Cannot maintain a retired vehicle');

      // Create record
      const created = await tx.maintenanceLog.create({
        data: {
          vehicleId: data.vehicleId,
          description: data.description,
          cost: data.cost || 0,
          startDate: data.startDate,
          status: 'ACTIVE',
          endDate: null
        },
        include: { vehicle: true }
      });

      // Update vehicle status
      await tx.vehicle.update({
        where: { id: data.vehicleId },
        data: { status: 'IN_SHOP' }
      });

      return created;
    });

    return res.status(201).json(mapMaintenanceToFrontend(result));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const data = mapMaintenanceToDb(req.body);

    const updated = await prisma.maintenanceLog.update({
      where: { id: parseInt(id) },
      data,
      include: { vehicle: true }
    });
    return res.status(200).json(mapMaintenanceToFrontend(updated));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Close Maintenance - Prisma Transaction
export const closeMaintenance = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.findUnique({ where: { id: parseInt(id) } });
      if (!log) throw new Error('Maintenance record not found');
      if (log.status !== 'ACTIVE') throw new Error('Maintenance is not active');

      // Update Log
      const updatedLog = await tx.maintenanceLog.update({
        where: { id: parseInt(id) },
        data: {
          status: 'COMPLETED',
          endDate: new Date()
        },
        include: { vehicle: true }
      });

      // Restore vehicle status unless Retired
      const vehicle = await tx.vehicle.findUnique({ where: { id: log.vehicleId } });
      if (vehicle && vehicle.status !== 'RETIRED') {
        await tx.vehicle.update({
          where: { id: log.vehicleId },
          data: { status: 'AVAILABLE' }
        });
      }

      return updatedLog;
    });

    return res.status(200).json(mapMaintenanceToFrontend(result));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.maintenanceLog.delete({
      where: { id: parseInt(id) }
    });
    return res.status(200).json({ success: true, message: 'Maintenance record deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

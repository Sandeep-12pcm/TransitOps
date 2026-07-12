import { prisma } from '../db.js';
import { mapTripToFrontend, mapTripToDb } from '../src/utils/mappers.js';

export const getTrips = async (req, res) => {
  try {
    const list = await prisma.trip.findMany({
      include: {
        vehicle: true,
        driver: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(list.map(mapTripToFrontend));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createTrip = async (req, res) => {
  try {
    const data = mapTripToDb(req.body);
    if (!data.source || !data.destination || !data.vehicleId || !data.driverId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (data.cargoWeight <= 0) {
      return res.status(400).json({ error: 'Cargo weight must be greater than 0 kg.' });
    }

    if (data.plannedDistance <= 0) {
      return res.status(400).json({ error: 'Planned distance must be greater than 0 km.' });
    }

    if (data.revenue < 0) {
      return res.status(400).json({ error: 'Revenue cannot be negative.' });
    }

    // Re-check constraints
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });

    if (!vehicle || vehicle.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Selected vehicle is not available!' });
    }
    if (!driver || driver.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Selected driver is not available!' });
    }
    if (data.cargoWeight > vehicle.maxLoadCapacity) {
      return res.status(400).json({ error: 'Cargo weight exceeds vehicle capacity!' });
    }

    const created = await prisma.trip.create({
      data,
      include: { vehicle: true, driver: true }
    });
    return res.status(201).json(mapTripToFrontend(created));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const data = mapTripToDb(req.body);

    const updated = await prisma.trip.update({
      where: { id: parseInt(id) },
      data,
      include: { vehicle: true, driver: true }
    });
    return res.status(200).json(mapTripToFrontend(updated));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.trip.delete({
      where: { id: parseInt(id) }
    });
    return res.status(200).json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Dispatch Trip - Prisma Transaction
export const dispatchTrip = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: parseInt(id) } });
      if (!trip) throw new Error('Trip not found');
      if (trip.status !== 'DRAFT') throw new Error('Trip is not in draft status');

      const vehicle = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });
      if (!vehicle || vehicle.status !== 'AVAILABLE') {
        throw new Error('Vehicle is no longer available!');
      }

      const driver = await tx.driver.findUnique({ where: { id: trip.driverId } });
      if (!driver || driver.status !== 'AVAILABLE') {
        throw new Error('Driver is no longer available!');
      }
      if (driver.status === 'SUSPENDED') {
        throw new Error('Driver is suspended!');
      }

      const today = new Date();
      if (new Date(driver.licenseExpiryDate) < today) {
        throw new Error('Driver license is expired! Cannot dispatch.');
      }

      if (trip.cargoWeight > vehicle.maxLoadCapacity) {
        throw new Error(`Cargo exceeds vehicle capacity!`);
      }

      // Update Trip
      const updatedTrip = await tx.trip.update({
        where: { id: parseInt(id) },
        data: { status: 'DISPATCHED' },
        include: { vehicle: true, driver: true }
      });

      // Update Vehicle
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'ON_TRIP' }
      });

      // Update Driver
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'ON_TRIP' }
      });

      return updatedTrip;
    });

    return res.status(200).json(mapTripToFrontend(result));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Complete Trip - Prisma Transaction
export const completeTrip = async (req, res) => {
  const { id } = req.params;
  const { actualDistance, fuelUsed, fuelRate, endOdometer } = req.body;

  if (parseFloat(actualDistance) <= 0) {
    return res.status(400).json({ error: 'Actual distance must be greater than 0 km.' });
  }
  if (parseFloat(fuelUsed) < 0) {
    return res.status(400).json({ error: 'Fuel used cannot be negative.' });
  }
  if (parseFloat(fuelRate) <= 0) {
    return res.status(400).json({ error: 'Fuel rate must be greater than 0.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: parseInt(id) } });
      if (!trip) throw new Error('Trip not found');
      if (trip.status !== 'DISPATCHED') throw new Error('Trip is not dispatched');

      const vehicle = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });
      if (!vehicle) throw new Error('Vehicle not found');
      if (parseFloat(endOdometer) <= vehicle.odometer) {
        throw new Error(`End odometer (${endOdometer} km) must be greater than vehicle starting odometer (${vehicle.odometer} km)!`);
      }

      // Update Trip
      const updatedTrip = await tx.trip.update({
        where: { id: parseInt(id) },
        data: {
          status: 'COMPLETED',
          finalOdometer: parseFloat(endOdometer) || null,
          fuelConsumed: parseFloat(fuelUsed) || null
        },
        include: { vehicle: true, driver: true }
      });

      // Update Vehicle
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: 'AVAILABLE',
          odometer: parseFloat(endOdometer) || undefined
        }
      });

      // Update Driver
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' }
      });

      // Create Fuel Log if needed
      if (parseFloat(fuelUsed) > 0) {
        await tx.fuelLog.create({
          data: {
            vehicleId: trip.vehicleId,
            tripId: trip.id,
            liters: parseFloat(fuelUsed),
            totalCost: parseFloat(fuelUsed) * (parseFloat(fuelRate) || 96.50),
            date: new Date()
          }
        });
      }

      return updatedTrip;
    });

    return res.status(200).json(mapTripToFrontend(result));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Cancel Trip - Prisma Transaction
export const cancelTrip = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: parseInt(id) } });
      if (!trip) throw new Error('Trip not found');
      if (trip.status !== 'DISPATCHED') throw new Error('Trip is not dispatched');

      // Update Trip
      const updatedTrip = await tx.trip.update({
        where: { id: parseInt(id) },
        data: { status: 'CANCELLED' },
        include: { vehicle: true, driver: true }
      });

      // Restore Vehicle
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE' }
      });

      // Restore Driver
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' }
      });

      return updatedTrip;
    });

    return res.status(200).json(mapTripToFrontend(result));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

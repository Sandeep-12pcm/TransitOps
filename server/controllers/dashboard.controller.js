import { prisma } from '../db.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const activeVehicles = await prisma.vehicle.count({
      where: { status: { not: 'RETIRED' } }
    });

    const availVehicles = await prisma.vehicle.count({
      where: { status: 'AVAILABLE' }
    });

    const inShopVehicles = await prisma.vehicle.count({
      where: { status: 'IN_SHOP' }
    });

    const activeTrips = await prisma.trip.count({
      where: { status: 'DISPATCHED' }
    });

    const pendingTrips = await prisma.trip.count({
      where: { status: 'DRAFT' }
    });

    const driversOnDuty = await prisma.driver.count({
      where: { status: 'ON_TRIP' }
    });

    // License issues (expired)
    const today = new Date();
    const expiredLicenses = await prisma.driver.count({
      where: {
        licenseExpiryDate: { lt: today }
      }
    });

    return res.status(200).json({
      activeVehicles,
      availVehicles,
      inShopVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      expiredLicenses
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

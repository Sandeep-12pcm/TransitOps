import "dotenv/config";
import bcrypt from 'bcrypt';
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning up database...');
  // Delete in order of dependencies to avoid constraint violations
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.vehicle.deleteMany();

  console.log('Seeding Roles...');
  const roles = [
    { name: 'ADMIN' },
    { name: 'FLEET_MANAGER' },
    { name: 'DRIVER' },
    { name: 'SAFETY_OFFICER' },
    { name: 'FINANCIAL_ANALYST' },
  ];

  const createdRoles = {};
  for (const r of roles) {
    const role = await prisma.role.create({
      data: r,
    });
    createdRoles[r.name] = role;
  }

  console.log('Seeding Users...');
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const usersData = [
    {
      name: 'System Admin',
      email: 'admin@transitops.com',
      passwordHash: defaultPasswordHash,
      roleId: createdRoles['ADMIN'].id,
    },
    {
      name: 'Jane Fleet Manager',
      email: 'manager@transitops.com',
      passwordHash: defaultPasswordHash,
      roleId: createdRoles['FLEET_MANAGER'].id,
    },
    {
      name: 'Alex Driver',
      email: 'driver.alex@transitops.com',
      passwordHash: defaultPasswordHash,
      roleId: createdRoles['DRIVER'].id,
    },
    {
      name: 'Bob Driver',
      email: 'driver.bob@transitops.com',
      passwordHash: defaultPasswordHash,
      roleId: createdRoles['DRIVER'].id,
    },
    {
      name: 'Charlie Driver',
      email: 'driver.charlie@transitops.com',
      passwordHash: defaultPasswordHash,
      roleId: createdRoles['DRIVER'].id,
    },
    {
      name: 'Dave Driver',
      email: 'driver.dave@transitops.com',
      passwordHash: defaultPasswordHash,
      roleId: createdRoles['DRIVER'].id,
    },
    {
      name: 'Sarah Safety Officer',
      email: 'safety@transitops.com',
      passwordHash: defaultPasswordHash,
      roleId: createdRoles['SAFETY_OFFICER'].id,
    },
    {
      name: 'Frank Financial Analyst',
      email: 'finance@transitops.com',
      passwordHash: defaultPasswordHash,
      roleId: createdRoles['FINANCIAL_ANALYST'].id,
    },
  ];

  const createdUsers = {};
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: u,
    });
    createdUsers[u.email] = user;
  }

  console.log('Seeding Vehicles...');
  const vehiclesData = [
    {
      registrationNumber: 'VAN-05',
      model: 'Ford Transit Van',
      type: 'Van',
      maxLoadCapacity: 500, // 500 kg
      odometer: 12000,
      acquisitionCost: 25000.00,
      status: 'AVAILABLE',
      region: 'North',
    },
    {
      registrationNumber: 'TRK-12',
      model: 'Volvo FH16 Truck',
      type: 'Truck',
      maxLoadCapacity: 5000, // 5000 kg
      odometer: 45000,
      acquisitionCost: 65000.00,
      status: 'AVAILABLE',
      region: 'South',
    },
    {
      registrationNumber: 'VAN-02',
      model: 'Mercedes Sprinter Van',
      type: 'Van',
      maxLoadCapacity: 800, // 800 kg
      odometer: 23000,
      acquisitionCost: 28000.00,
      status: 'IN_SHOP', // For testing maintenance
      region: 'East',
    },
    {
      registrationNumber: 'TRK-08',
      model: 'Scania R500 Truck',
      type: 'Truck',
      maxLoadCapacity: 4000, // 4000 kg
      odometer: 31000,
      acquisitionCost: 58000.00,
      status: 'ON_TRIP', // For testing active trip
      region: 'West',
    },
  ];

  const createdVehicles = {};
  for (const v of vehiclesData) {
    const vehicle = await prisma.vehicle.create({
      data: v,
    });
    createdVehicles[v.registrationNumber] = vehicle;
  }

  console.log('Seeding Drivers...');
  const driversData = [
    {
      name: 'Alex',
      licenseNumber: 'DL-98765',
      licenseCategory: 'Class B',
      licenseExpiryDate: new Date('2027-12-31'),
      contactNumber: '+15550101',
      safetyScore: 95.0,
      status: 'AVAILABLE',
      userId: createdUsers['driver.alex@transitops.com'].id,
    },
    {
      name: 'Bob',
      licenseNumber: 'DL-87654',
      licenseCategory: 'Class A',
      licenseExpiryDate: new Date('2026-08-15'),
      contactNumber: '+15550102',
      safetyScore: 90.0,
      status: 'AVAILABLE',
      userId: createdUsers['driver.bob@transitops.com'].id,
    },
    {
      name: 'Charlie',
      licenseNumber: 'DL-76543',
      licenseCategory: 'Class A',
      licenseExpiryDate: new Date('2026-11-20'),
      contactNumber: '+15550103',
      safetyScore: 88.0,
      status: 'ON_TRIP',
      userId: createdUsers['driver.charlie@transitops.com'].id,
    },
    {
      name: 'Dave',
      licenseNumber: 'DL-65432',
      licenseCategory: 'Class B',
      licenseExpiryDate: new Date('2025-01-10'), // Expired
      contactNumber: '+15550104',
      safetyScore: 60.0,
      status: 'SUSPENDED', // For testing validation rule
      userId: createdUsers['driver.dave@transitops.com'].id,
    },
  ];

  const createdDrivers = {};
  for (const d of driversData) {
    const driver = await prisma.driver.create({
      data: d,
    });
    createdDrivers[d.name] = driver;
  }

  console.log('Seeding Trips...');
  const tripsData = [
    {
      source: 'Warehouse A',
      destination: 'Retail Store 1',
      vehicleId: createdVehicles['VAN-05'].id,
      driverId: createdDrivers['Alex'].id,
      cargoWeight: 400, // ≤ 500 max load
      plannedDistance: 150,
      revenue: 350.00,
      status: 'DRAFT',
    },
    {
      source: 'Logistics Hub South',
      destination: 'Factory West',
      vehicleId: createdVehicles['TRK-08'].id,
      driverId: createdDrivers['Charlie'].id,
      cargoWeight: 3500, // ≤ 4000 max load
      plannedDistance: 450,
      revenue: 2500.00,
      status: 'DISPATCHED',
    },
    {
      source: 'Distribution Center East',
      destination: 'Supermarket 4',
      vehicleId: createdVehicles['VAN-02'].id,
      driverId: createdDrivers['Bob'].id,
      cargoWeight: 600, // ≤ 800 max load
      plannedDistance: 200,
      finalOdometer: 23200, // Completed trip info
      fuelConsumed: 22,
      revenue: 550.00,
      status: 'COMPLETED',
    },
    {
      source: 'Port North',
      destination: 'Warehouse B',
      vehicleId: createdVehicles['TRK-12'].id,
      driverId: createdDrivers['Alex'].id,
      cargoWeight: 2000, // ≤ 5000 max load
      plannedDistance: 300,
      revenue: 1200.00,
      status: 'CANCELLED',
    },
  ];

  const createdTrips = [];
  for (const t of tripsData) {
    const trip = await prisma.trip.create({
      data: t,
    });
    createdTrips.push(trip);
  }

  console.log('Seeding Maintenance Logs...');
  const maintenanceData = [
    {
      vehicleId: createdVehicles['VAN-02'].id,
      description: 'Brake Pad Replacement & Routine Service',
      cost: 350.00,
      startDate: new Date('2026-07-10'),
      status: 'ACTIVE',
    },
    {
      vehicleId: createdVehicles['TRK-12'].id,
      description: 'Engine Oil & Filter Change',
      cost: 150.00,
      startDate: new Date('2026-06-05'),
      endDate: new Date('2026-06-05'),
      status: 'COMPLETED',
    },
  ];

  for (const m of maintenanceData) {
    await prisma.maintenanceLog.create({
      data: m,
    });
  }

  console.log('Seeding Fuel Logs...');
  const fuelData = [
    {
      vehicleId: createdVehicles['VAN-02'].id,
      tripId: createdTrips[2].id, // Completed trip
      liters: 45,
      totalCost: 90.00,
      date: new Date('2026-06-15'),
    },
    {
      vehicleId: createdVehicles['TRK-08'].id,
      liters: 120,
      totalCost: 240.00,
      date: new Date('2026-07-01'),
    },
  ];

  for (const f of fuelData) {
    await prisma.fuelLog.create({
      data: f,
    });
  }

  console.log('Seeding Expenses...');
  const expensesData = [
    {
      vehicleId: createdVehicles['TRK-08'].id,
      tripId: createdTrips[1].id, // Dispatched trip
      category: 'TOLL',
      amount: 45.00,
      description: 'Highway Tolls - Route 66',
      date: new Date('2026-07-02'),
    },
    {
      vehicleId: createdVehicles['VAN-02'].id,
      tripId: createdTrips[2].id, // Completed trip
      category: 'OTHER',
      amount: 15.00,
      description: 'Downtown Parking Fee',
      date: new Date('2026-06-15'),
    },
  ];

  for (const e of expensesData) {
    await prisma.expense.create({
      data: e,
    });
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

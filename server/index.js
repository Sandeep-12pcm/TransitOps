import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from './controllers/vehicle.controller.js';
import { getDrivers, createDriver, updateDriver, deleteDriver } from './controllers/driver.controller.js';
import { getTrips, createTrip, updateTrip, deleteTrip, dispatchTrip, completeTrip, cancelTrip } from './controllers/trip.controller.js';
import { getMaintenance, createMaintenance, updateMaintenance, closeMaintenance, deleteMaintenance } from './controllers/maintenance.controller.js';
import { getFuelLogs, createFuelLog, deleteFuelLog } from './controllers/fuel.controller.js';
import { getExpenses, createExpense, deleteExpense } from './controllers/expense.controller.js';
import { getDashboardSummary } from './controllers/dashboard.controller.js';
import { register, login, profile } from './controllers/auth.controller.js';
import { verifyToken } from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Role-based authorization middleware
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
}

// Routes
// 1. Auth routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/profile', verifyToken, profile);

// 2. Dashboard
app.get('/api/dashboard/summary', verifyToken, getDashboardSummary);

// 3. Vehicles
app.get('/api/vehicles', verifyToken, getVehicles);
app.post('/api/vehicles', verifyToken, authorize('fleet_manager'), createVehicle);
app.put('/api/vehicles/:id', verifyToken, authorize('fleet_manager'), updateVehicle);
app.delete('/api/vehicles/:id', verifyToken, authorize('fleet_manager'), deleteVehicle);

// 4. Drivers
app.get('/api/drivers', verifyToken, getDrivers);
app.post('/api/drivers', verifyToken, authorize('fleet_manager', 'safety_officer'), createDriver);
app.put('/api/drivers/:id', verifyToken, authorize('fleet_manager', 'safety_officer'), updateDriver);
app.delete('/api/drivers/:id', verifyToken, authorize('fleet_manager', 'safety_officer'), deleteDriver);

// 5. Trips
app.get('/api/trips', verifyToken, getTrips);
app.post('/api/trips', verifyToken, authorize('fleet_manager', 'driver'), createTrip);
app.put('/api/trips/:id', verifyToken, authorize('fleet_manager'), updateTrip);
app.delete('/api/trips/:id', verifyToken, authorize('fleet_manager'), deleteTrip);
app.post('/api/trips/:id/dispatch', verifyToken, authorize('fleet_manager'), dispatchTrip);
app.post('/api/trips/:id/complete', verifyToken, authorize('fleet_manager', 'driver'), completeTrip);
app.post('/api/trips/:id/cancel', verifyToken, authorize('fleet_manager'), cancelTrip);

// 6. Maintenance
app.get('/api/maintenance', verifyToken, getMaintenance);
app.post('/api/maintenance', verifyToken, authorize('fleet_manager'), createMaintenance);
app.put('/api/maintenance/:id', verifyToken, authorize('fleet_manager'), updateMaintenance);
app.post('/api/maintenance/:id/close', verifyToken, authorize('fleet_manager'), closeMaintenance);
app.delete('/api/maintenance/:id', verifyToken, authorize('fleet_manager'), deleteMaintenance);

// 7. Fuel Logs
app.get('/api/fuel-logs', verifyToken, getFuelLogs);
app.post('/api/fuel-logs', verifyToken, authorize('fleet_manager', 'driver'), createFuelLog);
app.delete('/api/fuel-logs/:id', verifyToken, authorize('fleet_manager', 'driver'), deleteFuelLog);

// 8. Expenses
app.get('/api/expenses', verifyToken, getExpenses);
app.post('/api/expenses', verifyToken, authorize('fleet_manager', 'driver', 'financial_analyst'), createExpense);
app.delete('/api/expenses/:id', verifyToken, authorize('fleet_manager', 'driver', 'financial_analyst'), deleteExpense);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`TransitOps API Server running on port ${PORT}`);
});
// Trigger nodemon restart

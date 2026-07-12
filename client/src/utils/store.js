// ============================================================
// store.js – Centralized localStorage state manager
// ============================================================

const PREFIX = 'transitops_';

export const Store = {
  get(key) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v ? JSON.parse(v) : [];
    } catch {
      return [];
    }
  },

  getObj(key, fallback = {}) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, data) {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  },

  genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  // Seed demo data
  seed() {
    if (this.getObj('seeded', false)) return;

    // Users
    this.set('users', [
      { id: 'u1', name: 'Alex Fleet',     email: 'fleet@transitops.com',    password: 'fleet123',   role: 'fleet_manager'     },
      { id: 'u2', name: 'Dana Driver',    email: 'driver@transitops.com',   password: 'driver123',  role: 'driver'            },
      { id: 'u3', name: 'Sam Safety',     email: 'safety@transitops.com',   password: 'safety123',  role: 'safety_officer'    },
      { id: 'u4', name: 'Fay Finance',    email: 'finance@transitops.com',  password: 'finance123', role: 'financial_analyst' },
    ]);

    // Vehicles
    this.set('vehicles', [
      { id: 'v1', regNo: 'MH-01-AA-1234', name: 'Tata Ace – Silver',      type: 'Mini Truck', maxLoad: 750,  odometer: 12400, acquisitionCost: 650000, status: 'Available', region: 'North' },
      { id: 'v2', regNo: 'MH-02-BB-5678', name: 'Ashok Leyland – Boss',   type: 'Truck',      maxLoad: 5000, odometer: 48000, acquisitionCost: 2200000, status: 'On Trip', region: 'South' },
      { id: 'v3', regNo: 'GJ-01-CC-9012', name: 'Force Traveller – Van',  type: 'Van',        maxLoad: 1200, odometer: 33000, acquisitionCost: 1100000, status: 'In Shop', region: 'West' },
      { id: 'v4', regNo: 'DL-03-DD-3456', name: 'Mahindra Bolero – Pik',  type: 'Pickup',     maxLoad: 900,  odometer: 71200, acquisitionCost: 950000, status: 'Available', region: 'East' },
      { id: 'v5', regNo: 'KA-04-EE-7890', name: 'Eicher Pro – 3015',      type: 'Truck',      maxLoad: 7500, odometer: 95000, acquisitionCost: 3100000, status: 'Retired',  region: 'South' },
    ]);

    // Drivers
    const today = new Date(); 
    const future = new Date(today); future.setFullYear(future.getFullYear() + 2);
    const expired = new Date(today); expired.setFullYear(expired.getFullYear() - 1);
    const nearExpiry = new Date(today); nearExpiry.setDate(nearExpiry.getDate() + 20);

    this.set('drivers', [
      { id: 'd1', name: 'Ravi Kumar',   licenseNo: 'MH-2019-1234567', licenseCategory: 'HMV', licenseExpiry: future.toISOString().slice(0,10),     contact: '9876543210', safetyScore: 92, status: 'Available' },
      { id: 'd2', name: 'Sunita Patel', licenseNo: 'GJ-2020-7654321', licenseCategory: 'LMV', licenseExpiry: future.toISOString().slice(0,10),     contact: '9123456789', safetyScore: 87, status: 'On Trip'   },
      { id: 'd3', name: 'Deepak Singh', licenseNo: 'DL-2018-9876543', licenseCategory: 'HMV', licenseExpiry: expired.toISOString().slice(0,10),    contact: '9988776655', safetyScore: 78, status: 'Off Duty'  },
      { id: 'd4', name: 'Priya Sharma', licenseNo: 'KA-2021-1122334', licenseCategory: 'LMV', licenseExpiry: nearExpiry.toISOString().slice(0,10), contact: '9001122334', safetyScore: 95, status: 'Available' },
      { id: 'd5', name: 'Ramesh Gupta', licenseNo: 'RJ-2017-5566778', licenseCategory: 'HMV', licenseExpiry: future.toISOString().slice(0,10),     contact: '9445566778', safetyScore: 55, status: 'Suspended' },
    ]);

    // Trips
    this.set('trips', [
      { id: 't1', source: 'Mumbai',    destination: 'Pune',      vehicleId: 'v2', driverId: 'd2', cargoWeight: 3200, plannedDistance: 148, status: 'Dispatched',  createdAt: new Date(Date.now()-86400000*2).toISOString(), revenue: 18000 },
      { id: 't2', source: 'Delhi',     destination: 'Agra',      vehicleId: 'v4', driverId: 'd1', cargoWeight: 500,  plannedDistance: 204, status: 'Completed',   createdAt: new Date(Date.now()-86400000*5).toISOString(), revenue: 12000, actualDistance: 208, fuelUsed: 28 },
      { id: 't3', source: 'Bengaluru', destination: 'Chennai',   vehicleId: 'v1', driverId: 'd4', cargoWeight: 400,  plannedDistance: 346, status: 'Draft',       createdAt: new Date().toISOString(), revenue: 9000 },
    ]);

    // Maintenance
    this.set('maintenance', [
      { id: 'm1', vehicleId: 'v3', type: 'Oil Change',     description: 'Full engine oil change + filter',   cost: 4500,  status: 'Active',   startDate: new Date(Date.now()-86400000*3).toISOString().slice(0,10), endDate: null },
      { id: 'm2', vehicleId: 'v4', type: 'Tyre Rotation',  description: 'Rotate all 4 tyres, check pressure', cost: 1200,  status: 'Closed',   startDate: new Date(Date.now()-86400000*10).toISOString().slice(0,10), endDate: new Date(Date.now()-86400000*7).toISOString().slice(0,10) },
    ]);

    // Fuel Logs
    this.set('fuelLogs', [
      { id: 'f1', vehicleId: 'v2', tripId: 't2', date: new Date(Date.now()-86400000*5).toISOString().slice(0,10), liters: 45, costPerLiter: 96.5, totalCost: 4342.5,  odometer: 48200 },
      { id: 'f2', vehicleId: 'v4', tripId: 't2', date: new Date(Date.now()-86400000*5).toISOString().slice(0,10), liters: 28, costPerLiter: 96.5, totalCost: 2702,    odometer: 71400 },
      { id: 'f3', vehicleId: 'v4', tripId: null,  date: new Date(Date.now()-86400000*1).toISOString().slice(0,10), liters: 20, costPerLiter: 97.0, totalCost: 1940,    odometer: 71420 },
    ]);

    // Expenses
    this.set('expenses', [
      { id: 'e1', vehicleId: 'v2', category: 'Toll',        amount: 650,  date: new Date(Date.now()-86400000*5).toISOString().slice(0,10), notes: 'Mumbai-Pune expressway' },
      { id: 'e2', vehicleId: 'v4', category: 'Toll',        amount: 420,  date: new Date(Date.now()-86400000*5).toISOString().slice(0,10), notes: 'NH-19' },
      { id: 'e3', vehicleId: 'v3', category: 'Maintenance', amount: 4500, date: new Date(Date.now()-86400000*3).toISOString().slice(0,10), notes: 'Oil change' },
    ]);

    this.set('seeded', true);
  }
};

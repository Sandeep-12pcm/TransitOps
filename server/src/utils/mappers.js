// ============================================================
// mappers.js – Database to Frontend translation layer
// ============================================================

// 1. Vehicle mapping
export const mapVehicleToFrontend = (v) => {
  if (!v) return null;
  const statusMap = {
    AVAILABLE: 'Available',
    ON_TRIP: 'On Trip',
    IN_SHOP: 'In Shop',
    RETIRED: 'Retired'
  };
  return {
    id: v.id.toString(),
    regNo: v.registrationNumber,
    name: v.model,
    type: v.type,
    maxLoad: v.maxLoadCapacity,
    odometer: v.odometer,
    acquisitionCost: Number(v.acquisitionCost),
    status: statusMap[v.status] || 'Available',
    region: v.region
  };
};

export const mapVehicleToDb = (v) => {
  if (!v) return null;
  const statusMap = {
    'Available': 'AVAILABLE',
    'On Trip': 'ON_TRIP',
    'In Shop': 'IN_SHOP',
    'Retired': 'RETIRED'
  };
  return {
    registrationNumber: v.regNo,
    model: v.name,
    type: v.type,
    maxLoadCapacity: parseFloat(v.maxLoad),
    odometer: parseFloat(v.odometer),
    acquisitionCost: parseFloat(v.acquisitionCost),
    status: statusMap[v.status] || 'AVAILABLE',
    region: v.region
  };
};

// 2. Driver mapping
export const mapDriverToFrontend = (d) => {
  if (!d) return null;
  const statusMap = {
    AVAILABLE: 'Available',
    ON_TRIP: 'On Trip',
    OFF_DUTY: 'Off Duty',
    SUSPENDED: 'Suspended'
  };
  return {
    id: d.id.toString(),
    name: d.name,
    licenseNo: d.licenseNumber,
    licenseCategory: d.licenseCategory,
    licenseExpiry: d.licenseExpiryDate.toISOString().slice(0, 10),
    contact: d.contactNumber,
    safetyScore: d.safetyScore,
    status: statusMap[d.status] || 'Available'
  };
};

export const mapDriverToDb = (d) => {
  if (!d) return null;
  const statusMap = {
    'Available': 'AVAILABLE',
    'On Trip': 'ON_TRIP',
    'Off Duty': 'OFF_DUTY',
    'Suspended': 'SUSPENDED'
  };
  return {
    name: d.name,
    licenseNumber: d.licenseNo,
    licenseCategory: d.licenseCategory,
    licenseExpiryDate: new Date(d.licenseExpiry),
    contactNumber: d.contact,
    safetyScore: parseFloat(d.safetyScore),
    status: statusMap[d.status] || 'AVAILABLE'
  };
};

// 3. Trip mapping
export const mapTripToFrontend = (t) => {
  if (!t) return null;
  const statusMap = {
    DRAFT: 'Draft',
    DISPATCHED: 'Dispatched',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  };

  return {
    id: t.id.toString(),
    source: t.source,
    destination: t.destination,
    vehicleId: t.vehicleId.toString(),
    driverId: t.driverId.toString(),
    cargoWeight: t.cargoWeight,
    plannedDistance: t.plannedDistance,
    revenue: Number(t.revenue),
    status: statusMap[t.status] || 'Draft',
    createdAt: t.createdAt.toISOString(),
    actualDistance: t.status === 'COMPLETED' ? (t.finalOdometer ? t.plannedDistance : null) : null,
    fuelUsed: t.fuelConsumed,
    vehicle: mapVehicleToFrontend(t.vehicle),
    driver: mapDriverToFrontend(t.driver)
  };
};

export const mapTripToDb = (t) => {
  if (!t) return null;
  const statusMap = {
    'Draft': 'DRAFT',
    'Dispatched': 'DISPATCHED',
    'Completed': 'COMPLETED',
    'Cancelled': 'CANCELLED'
  };
  return {
    source: t.source,
    destination: t.destination,
    vehicleId: parseInt(t.vehicleId),
    driverId: parseInt(t.driverId),
    cargoWeight: parseFloat(t.cargoWeight),
    plannedDistance: parseFloat(t.plannedDistance),
    revenue: parseFloat(t.revenue),
    status: statusMap[t.status] || 'DRAFT'
  };
};

// 4. Maintenance mapping
export const mapMaintenanceToFrontend = (m) => {
  if (!m) return null;
  const statusMap = {
    ACTIVE: 'Active',
    COMPLETED: 'Closed'
  };
  return {
    id: m.id.toString(),
    vehicleId: m.vehicleId.toString(),
    type: m.description.includes(' - ') ? m.description.split(' - ')[0] : m.description,
    description: m.description.includes(' - ') ? m.description.split(' - ')[1] : m.description,
    cost: Number(m.cost),
    startDate: m.startDate.toISOString().slice(0, 10),
    endDate: m.endDate ? m.endDate.toISOString().slice(0, 10) : null,
    status: statusMap[m.status] || 'Active',
    vehicle: mapVehicleToFrontend(m.vehicle)
  };
};

export const mapMaintenanceToDb = (m) => {
  if (!m) return null;
  const statusMap = {
    'Active': 'ACTIVE',
    'Closed': 'COMPLETED'
  };
  return {
    vehicleId: parseInt(m.vehicleId),
    description: `${m.type} - ${m.description || ''}`,
    cost: parseFloat(m.cost),
    startDate: new Date(m.startDate),
    endDate: m.endDate ? new Date(m.endDate) : null,
    status: statusMap[m.status] || 'ACTIVE'
  };
};

// 5. Fuel Log mapping
export const mapFuelLogToFrontend = (f) => {
  if (!f) return null;
  return {
    id: f.id.toString(),
    vehicleId: f.vehicleId.toString(),
    tripId: f.tripId ? f.tripId.toString() : null,
    date: f.date.toISOString().slice(0, 10),
    liters: f.liters,
    costPerLiter: f.liters > 0 ? Number(f.totalCost) / f.liters : 96.50,
    totalCost: Number(f.totalCost),
    odometer: f.trip ? f.trip.finalOdometer : null
  };
};

export const mapFuelLogToDb = (f) => {
  if (!f) return null;
  return {
    vehicleId: parseInt(f.vehicleId),
    tripId: f.tripId ? parseInt(f.tripId) : null,
    date: new Date(f.date),
    liters: parseFloat(f.liters),
    totalCost: parseFloat(f.totalCost)
  };
};

// 6. Expense mapping
export const mapExpenseToFrontend = (e) => {
  if (!e) return null;
  const catMap = {
    TOLL: 'Toll',
    FINE: 'Fine',
    OTHER: 'Miscellaneous'
  };
  return {
    id: e.id.toString(),
    vehicleId: e.vehicleId ? e.vehicleId.toString() : null,
    category: catMap[e.category] || 'Miscellaneous',
    amount: Number(e.amount),
    date: e.date.toISOString().slice(0, 10),
    notes: e.description
  };
};

export const mapExpenseToDb = (e) => {
  if (!e) return null;
  const catMap = {
    'Toll': 'TOLL',
    'Fine': 'FINE',
    'Miscellaneous': 'OTHER',
    'Maintenance': 'OTHER',
    'Repair': 'OTHER',
    'Permit': 'OTHER'
  };
  return {
    vehicleId: e.vehicleId ? parseInt(e.vehicleId) : null,
    category: catMap[e.category] || 'OTHER',
    amount: parseFloat(e.amount),
    date: new Date(e.date),
    description: e.notes || ''
  };
};

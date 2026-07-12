import React, { useState } from 'react';
import { fmt, StatusBadge, licenseStatus } from '../utils/helpers';
import { api } from '../utils/api';

const STATUSES = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

export default function Trips({
  trips,
  vehicles,
  drivers,
  fuelLogs,
  refreshData,
  currentUser, toast, confirmAction
}) {
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortCol, setSortCol] = useState('createdAt');
  const [sortDir, setSortDir] = useState(-1);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formSource, setFormSource] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formVehicleId, setFormVehicleId] = useState('');
  const [formDriverId, setFormDriverId] = useState('');
  const [formCargoWeight, setFormCargoWeight] = useState('');
  const [formPlannedDistance, setFormPlannedDistance] = useState('');
  const [formRevenue, setFormRevenue] = useState('');
  const [cargoErr, setCargoErr] = useState('');

  // Complete Trip modal state
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingTripId, setCompletingTripId] = useState(null);
  const [formActualDistance, setFormActualDistance] = useState('');
  const [formFuelUsed, setFormFuelUsed] = useState('');
  const [formFuelRate, setFormFuelRate] = useState('96.50');
  const [formEndOdometer, setFormEndOdometer] = useState('');

  const canCreate = ['fleet_manager', 'driver'].includes(currentUser?.role);
  const canDispatch = ['fleet_manager'].includes(currentUser?.role);

  // Eligible vehicles (Available or currently assigned to this trip if editing)
  const getDispatchableVehicles = () => {
    return vehicles.filter(v => v.status === 'Available' || (editId && v.id === trips.find(t => t.id === editId)?.vehicleId));
  };

  // Eligible drivers (Available + valid license or currently assigned to this trip if editing)
  const getEligibleDrivers = () => {
    return drivers.filter(d => {
      const isAssigned = editId && d.id === trips.find(t => t.id === editId)?.driverId;
      if (d.status !== 'Available' && !isAssigned) return false;
      const ls = licenseStatus(d.licenseExpiry);
      return ls.label !== 'Expired';
    });
  };

  const getFilteredData = () => {
    let data = [...trips];
    if (searchQ) {
      const q = searchQ.toLowerCase();
      data = data.filter(t =>
        t.source.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q)
      );
    }
    if (filterStatus) data = data.filter(t => t.status === filterStatus);

    data.sort((a, b) => {
      let av = a[sortCol] ?? '';
      let bv = b[sortCol] ?? '';
      return av.toString().localeCompare(bv.toString()) * sortDir;
    });

    return data.map(t => ({
      ...t,
      vehicle: vehicles.find(v => v.id === t.vehicleId),
      driver: drivers.find(d => d.id === t.driverId),
    }));
  };

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(sortDir * -1);
    } else {
      setSortCol(col);
      setSortDir(1);
    }
  };

  const renderTripSteps = (status) => {
    const steps = ['Draft', 'Dispatched', 'Completed'];
    if (status === 'Cancelled') {
      return (
        <div className="trip-steps">
          <div className="trip-step done"><div className="step-dot">1</div>Draft</div>
          <div className="step-connector done"></div>
          <div className="trip-step done"><div className="step-dot">✕</div>Cancelled</div>
        </div>
      );
    }
    const cur = steps.indexOf(status);
    return (
      <div className="trip-steps">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <div className={`step-connector ${i <= cur ? 'done' : ''}`} />}
            <div className={`trip-step ${i < cur ? 'done' : i === cur ? 'active' : ''}`}>
              <div className="step-dot">{i < cur ? '✓' : i + 1}</div>{s}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const openModal = (id = null) => {
    setCargoErr('');
    if (id) {
      const t = trips.find(x => x.id === id);
      if (!t) return;
      setEditId(id);
      setFormSource(t.source);
      setFormDestination(t.destination);
      setFormVehicleId(t.vehicleId);
      setFormDriverId(t.driverId);
      setFormCargoWeight(t.cargoWeight);
      setFormPlannedDistance(t.plannedDistance);
      setFormRevenue(t.revenue || '');
    } else {
      setEditId(null);
      setFormSource('');
      setFormDestination('');
      setFormVehicleId('');
      setFormDriverId('');
      setFormCargoWeight('');
      setFormPlannedDistance('');
      setFormRevenue('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
  };

  const validateCargo = (vehicleId, weightStr) => {
    const weight = parseFloat(weightStr) || 0;
    const v = vehicles.find(x => x.id === vehicleId);
    if (v && weight > v.maxLoad) {
      setCargoErr(`⚠️ Cargo (${weight} kg) exceeds vehicle capacity (${v.maxLoad} kg)!`);
      return false;
    }
    setCargoErr('');
    return true;
  };

  const handleVehicleChange = (vid) => {
    setFormVehicleId(vid);
    validateCargo(vid, formCargoWeight);
  };

  const handleCargoChange = (w) => {
    setFormCargoWeight(w);
    validateCargo(formVehicleId, w);
  };

  const handleSave = async () => {
    const source = formSource.trim();
    const destination = formDestination.trim();
    const vehicleId = formVehicleId;
    const driverId = formDriverId;
    const cargoWeight = parseFloat(formCargoWeight) || 0;
    const plannedDistance = parseFloat(formPlannedDistance) || 0;
    const revenue = parseFloat(formRevenue) || 0;

    if (!source || !destination || !vehicleId || !driverId) {
      toast('Please fill all required fields.', 'error');
      return;
    }

    if (source.length < 2 || destination.length < 2) {
      toast('Source and destination must be at least 2 characters.', 'error');
      return;
    }

    if (cargoWeight <= 0) {
      toast('Cargo weight must be greater than 0 kg.', 'error');
      return;
    }

    if (plannedDistance <= 0) {
      toast('Planned distance must be greater than 0 km.', 'error');
      return;
    }

    if (revenue < 0) {
      toast('Revenue cannot be negative.', 'error');
      return;
    }

    const v = vehicles.find(x => x.id === vehicleId);
    const d = drivers.find(x => x.id === driverId);
    const ls = licenseStatus(d?.licenseExpiry || '2000-01-01');

    if (!v || (v.status !== 'Available' && (!editId || trips.find(t => t.id === editId)?.vehicleId !== vehicleId))) {
      toast('Selected vehicle is not available!', 'error');
      return;
    }
    if (!d || (d.status !== 'Available' && (!editId || trips.find(t => t.id === editId)?.driverId !== driverId))) {
      toast('Selected driver is not available!', 'error');
      return;
    }
    if (ls.label === 'Expired') {
      toast('Driver license is expired!', 'error');
      return;
    }
    if (d.status === 'Suspended') {
      toast('Driver is suspended!', 'error');
      return;
    }
    if (cargoWeight > v.maxLoad) {
      toast(`Cargo (${cargoWeight} kg) exceeds max load (${v.maxLoad} kg)!`, 'error');
      return;
    }

    try {
      const payload = { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, revenue };
      if (editId) {
        await api.updateTrip(editId, payload);
        toast('Trip updated!', 'success');
      } else {
        await api.createTrip(payload);
        toast('Trip created as Draft!', 'success');
      }
      await refreshData();
      closeModal();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDispatch = async (id) => {
    try {
      await api.dispatchTrip(id);
      toast('🚀 Trip dispatched! Vehicle & driver are now On Trip.', 'success');
      await refreshData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleCancel = async (id) => {
    const ok = await confirmAction('Cancel this dispatched trip? Vehicle and driver will be restored to Available.');
    if (!ok) return;

    try {
      await api.cancelTrip(id);
      toast('Trip cancelled. Vehicle & driver restored to Available.', 'warn');
      await refreshData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const openCompleteModal = (id) => {
    const t = trips.find(x => x.id === id);
    const v = vehicles.find(x => x.id === t?.vehicleId);
    setCompletingTripId(id);
    setFormActualDistance(t ? t.plannedDistance.toString() : '');
    setFormFuelUsed('');
    setFormFuelRate('96.50');
    setFormEndOdometer(v ? v.odometer.toString() : '');
    setIsCompleteModalOpen(true);
  };

  const closeCompleteModal = () => {
    setIsCompleteModalOpen(false);
    setCompletingTripId(null);
  };

  const submitComplete = async () => {
    const id = completingTripId;
    const actualDistance = parseFloat(formActualDistance) || 0;
    const fuelUsed = parseFloat(formFuelUsed) || 0;
    const fuelRate = parseFloat(formFuelRate) || 0;
    const endOdometer = parseFloat(formEndOdometer) || 0;

    if (actualDistance <= 0) {
      toast('Actual distance must be greater than 0 km.', 'error');
      return;
    }
    if (parseFloat(formFuelUsed) < 0) {
      toast('Fuel used cannot be negative.', 'error');
      return;
    }
    if (fuelRate <= 0) {
      toast('Fuel rate must be greater than 0.', 'error');
      return;
    }

    const trip = trips.find(t => t.id === id);
    const vehicle = vehicles.find(v => v.id === trip?.vehicleId);
    const currentOdo = vehicle?.odometer || 0;
    if (endOdometer <= currentOdo) {
      toast(`End odometer (${endOdometer} km) must be greater than vehicle starting odometer (${currentOdo} km)!`, 'error');
      return;
    }

    try {
      await api.completeTrip(id, { actualDistance, fuelUsed, fuelRate, endOdometer });
      toast('✅ Trip completed! Vehicle and driver are now Available.', 'success');
      await refreshData();
      closeCompleteModal();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDeleteTrip = async (id) => {
    const t = trips.find(x => x.id === id);
    if (!t) return;
    const ok = await confirmAction(`Delete trip "${t.source} → ${t.destination}"?`);
    if (!ok) return;

    try {
      await api.deleteTrip(id);
      toast('Trip deleted.', 'warn');
      await refreshData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filteredData = getFilteredData();

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Trip Management</h2>
          <p>Create, dispatch, complete and track your fleet trips</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => openModal()}>➕ New Trip</button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            type="text"
            placeholder="Search by source/destination…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="chip">{filteredData.length} trip{filteredData.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Cargo (kg)</th>
              <th>Distance (km)</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-icon">🗺️</div>
                    <h4>No trips found</h4>
                    <p>Create your first trip dispatch</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.source} → {t.destination}</div>
                    {renderTripSteps(t.status)}
                  </td>
                  <td>
                    {t.vehicle ? (
                      <div style={{ fontSize: '12px' }}>
                        <strong>{t.vehicle.name}</strong><br />
                        <span className="td-mono">{t.vehicle.regNo}</span>
                      </div>
                    ) : <span className="text-muted">–</span>}
                  </td>
                  <td>
                    {t.driver ? (
                      <div style={{ fontSize: '12px' }}>
                        <strong>{t.driver.name}</strong><br />
                        <span className="text-muted">{t.driver.licenseCategory}</span>
                      </div>
                    ) : <span className="text-muted">–</span>}
                  </td>
                  <td>{fmt.number(t.cargoWeight)}</td>
                  <td>{fmt.number(t.plannedDistance)}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="fs-11">{fmt.dateShort(t.createdAt)}</td>
                  <td>
                    <div className="actions">
                      {t.status === 'Draft' && canDispatch && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => handleDispatch(t.id)}>🚀 Dispatch</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => openModal(t.id)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTrip(t.id)}>🗑️</button>
                        </>
                      )}
                      {t.status === 'Dispatched' && canDispatch && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => openCompleteModal(t.id)}>✅ Complete</button>
                          <button className="btn btn-warning btn-sm" onClick={() => handleCancel(t.id)}>❌ Cancel</button>
                        </>
                      )}
                      {(t.status === 'Completed' || t.status === 'Cancelled') && (
                        <span className="text-muted fs-11">Closed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target.classList.contains('modal-overlay') && closeModal()}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">{editId ? 'Edit Trip' : 'New Trip'}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Source *</label>
                  <input className="form-control" placeholder="Mumbai" value={formSource} onChange={(e) => setFormSource(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination *</label>
                  <input className="form-control" placeholder="Pune" value={formDestination} onChange={(e) => setFormDestination(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle * <span className="text-muted fs-11">(Available only)</span></label>
                  <select className="form-control" value={formVehicleId} onChange={(e) => handleVehicleChange(e.target.value)}>
                    <option value="">Select vehicle</option>
                    {getDispatchableVehicles().map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} · {v.regNo} ({fmt.number(v.maxLoad)} kg max)
                      </option>
                    ))}
                  </select>
                  <div className="form-hint">
                    {formVehicleId && `Max load: ${fmt.number(vehicles.find(x => x.id === formVehicleId)?.maxLoad)} kg`}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Driver * <span className="text-muted fs-11">(Available + Valid license)</span></label>
                  <select className="form-control" value={formDriverId} onChange={(e) => setFormDriverId(e.target.value)}>
                    <option value="">Select driver</option>
                    {getEligibleDrivers().map(d => {
                      const ls = licenseStatus(d.licenseExpiry);
                      const warn = ls.label !== 'Valid' ? ` ⚠️ ${ls.label}` : '';
                      return (
                        <option key={d.id} value={d.id}>
                          {d.name} · {d.licenseCategory}{warn}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cargo Weight (kg) *</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="1000"
                    min="0"
                    value={formCargoWeight}
                    onChange={(e) => handleCargoChange(e.target.value)}
                  />
                  {cargoErr && <div className="form-error">{cargoErr}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Planned Distance (km)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="200"
                    min="0"
                    value={formPlannedDistance}
                    onChange={(e) => setFormPlannedDistance(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Revenue (₹)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="15000"
                    min="0"
                    value={formRevenue}
                    onChange={(e) => setFormRevenue(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>💾 Save Draft</button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      {isCompleteModalOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target.classList.contains('modal-overlay') && closeCompleteModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">✅ Complete Trip</span>
              <button className="modal-close" onClick={closeCompleteModal}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '16px' }}>
                Enter final trip metrics to complete and record in the system.
              </p>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Actual Distance (km)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="210"
                    min="0"
                    value={formActualDistance}
                    onChange={(e) => setFormActualDistance(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fuel Consumed (liters)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="35"
                    min="0"
                    value={formFuelUsed}
                    onChange={(e) => setFormFuelUsed(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fuel Cost (₹/liter)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="96.50"
                    step="0.01"
                    min="0"
                    value={formFuelRate}
                    onChange={(e) => setFormFuelRate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Odometer (km)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="48500"
                    min="0"
                    value={formEndOdometer}
                    onChange={(e) => setFormEndOdometer(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeCompleteModal}>Cancel</button>
              <button className="btn btn-success" onClick={submitComplete}>✅ Complete Trip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

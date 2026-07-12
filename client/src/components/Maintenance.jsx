import React, { useState } from 'react';
import { fmt, StatusBadge } from '../utils/helpers';
import { Store } from '../utils/store';

const TYPES = ['Oil Change', 'Tyre Rotation', 'Brake Service', 'Engine Overhaul', 'Electrical', 'Body Work', 'AC Service', 'Other'];

export default function Maintenance({
  maintenance, setMaintenance,
  vehicles, setVehicles,
  currentUser, toast, confirmAction
}) {
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formVehicleId, setFormVehicleId] = useState('');
  const [formType, setFormType] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formStartDate, setFormStartDate] = useState('');

  const canEdit = ['fleet_manager'].includes(currentUser?.role);

  const getFilteredData = () => {
    let data = [...maintenance];
    if (searchQ) {
      const q = searchQ.toLowerCase();
      data = data.filter(m => {
        const v = vehicles.find(x => x.id === m.vehicleId);
        return (
          m.type.toLowerCase().includes(q) ||
          (v?.name || '').toLowerCase().includes(q) ||
          (v?.regNo || '').toLowerCase().includes(q)
        );
      });
    }
    if (filterStatus) data = data.filter(m => m.status === filterStatus);
    if (filterVehicle) data = data.filter(m => m.vehicleId === filterVehicle);

    data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    return data.map(m => ({
      ...m,
      vehicle: vehicles.find(v => v.id === m.vehicleId)
    }));
  };

  const openModal = (id = null) => {
    if (id) {
      const m = maintenance.find(x => x.id === id);
      if (!m) return;
      setEditId(id);
      setFormVehicleId(m.vehicleId);
      setFormType(m.type);
      setFormDescription(m.description || '');
      setFormCost(m.cost || '');
      setFormStartDate(m.startDate ? m.startDate.slice(0, 10) : '');
    } else {
      setEditId(null);
      setFormVehicleId('');
      setFormType('');
      setFormDescription('');
      setFormCost('');
      setFormStartDate(new Date().toISOString().slice(0, 10));
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
  };

  const handleSave = () => {
    const vehicleId = formVehicleId;
    const type = formType;
    const description = formDescription.trim();
    const cost = parseFloat(formCost) || 0;
    const startDate = formStartDate;

    if (!vehicleId || !type || !startDate) {
      toast('Please fill all required fields.', 'error');
      return;
    }

    let updatedMaint;
    let updatedVehicles = [...vehicles];

    if (editId) {
      updatedMaint = maintenance.map(m =>
        m.id === editId
          ? { ...m, vehicleId, type, description, cost, startDate }
          : m
      );
      toast('Record updated!', 'success');
    } else {
      // Auto: set vehicle to In Shop
      const vidx = updatedVehicles.findIndex(v => v.id === vehicleId);
      if (vidx >= 0) {
        const prevStatus = updatedVehicles[vidx].status;
        updatedVehicles[vidx] = { ...updatedVehicles[vidx], status: 'In Shop' };
        if (prevStatus !== 'In Shop') {
          toast(`🔧 Vehicle set to "In Shop" automatically.`, 'warn');
        }
      }

      updatedMaint = [
        ...maintenance,
        { id: Store.genId(), vehicleId, type, description, cost, startDate, status: 'Active', endDate: null }
      ];
      toast('Maintenance record created! Vehicle is now In Shop.', 'success');
    }

    setMaintenance(updatedMaint);
    Store.set('maintenance', updatedMaint);
    setVehicles(updatedVehicles);
    Store.set('vehicles', updatedVehicles);
    closeModal();
  };

  const handleCloseMaintenance = async (id) => {
    const ok = await confirmAction('Close this maintenance record? Vehicle will be restored to Available (unless Retired).');
    if (!ok) return;

    const m = maintenance.find(x => x.id === id);
    if (!m) return;

    const updatedMaint = maintenance.map(x =>
      x.id === id
        ? { ...x, status: 'Closed', endDate: new Date().toISOString().slice(0, 10) }
        : x
    );

    const updatedVehicles = vehicles.map(v =>
      v.id === m.vehicleId && v.status !== 'Retired'
        ? { ...v, status: 'Available' }
        : v
    );

    setMaintenance(updatedMaint);
    Store.set('maintenance', updatedMaint);
    setVehicles(updatedVehicles);
    Store.set('vehicles', updatedVehicles);

    toast('✅ Maintenance closed. Vehicle restored to Available.', 'success');
  };

  const handleDelete = async (id) => {
    const ok = await confirmAction('Delete this maintenance record?');
    if (!ok) return;

    const updatedMaint = maintenance.filter(x => x.id !== id);
    setMaintenance(updatedMaint);
    Store.set('maintenance', updatedMaint);
    toast('Record deleted.', 'warn');
  };

  const filteredData = getFilteredData();

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Maintenance</h2>
          <p>Log and track vehicle maintenance. Creating a record sets vehicle to In Shop.</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => openModal()}>🔧 New Record</button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            type="text"
            placeholder="Search records…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>
        <select className="filter-select" value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}>
          <option value="">All Vehicles</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <span className="chip">{filteredData.length} record{filteredData.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Description</th>
              <th>Cost (₹)</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 8 : 7}>
                  <div className="empty-state">
                    <div className="empty-icon">🔧</div>
                    <h4>No maintenance records</h4>
                    <p>Add a maintenance log to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map(m => (
                <tr key={m.id}>
                  <td>
                    {m.vehicle ? (
                      <>
                        <strong>{m.vehicle.name}</strong><br />
                        <span className="td-mono fs-11">{m.vehicle.regNo}</span>
                      </>
                    ) : '–'}
                  </td>
                  <td><span className="chip">{m.type}</span></td>
                  <td><span className="fs-12">{m.description || '–'}</span></td>
                  <td><strong>{fmt.currency(m.cost)}</strong></td>
                  <td>{fmt.date(m.startDate)}</td>
                  <td>{m.endDate ? fmt.date(m.endDate) : <span className="text-muted">Ongoing</span>}</td>
                  <td><StatusBadge status={m.status} /></td>
                  {canEdit && (
                    <td>
                      <div className="actions">
                        {m.status === 'Active' ? (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleCloseMaintenance(m.id)}>✅ Close</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => openModal(m.id)}>✏️</button>
                          </>
                        ) : null}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>🗑️</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target.classList.contains('modal-overlay') && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editId ? 'Edit Record' : 'New Maintenance Record'}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="card mb-16" style={{ borderLeft: '3px solid var(--warning)', padding: '10px 14px' }}>
                <span style={{ fontSize: '13px' }}>
                  ⚠️ <strong>Note:</strong> Creating an Active record will automatically set the vehicle status to <strong>In Shop</strong> and remove it from dispatch.
                </span>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Vehicle *</label>
                  <select
                    className="form-control"
                    value={formVehicleId}
                    onChange={(e) => setFormVehicleId(e.target.value)}
                  >
                    <option value="">Select vehicle</option>
                    {vehicles.filter(v => v.status !== 'Retired' || (editId && v.id === formVehicleId)).map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} · {v.regNo} ({v.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Maintenance Type *</label>
                  <select
                    className="form-control"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    <option value="">Select type</option>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description</label>
                  <input
                    className="form-control"
                    placeholder="Describe the maintenance work…"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Cost (₹)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="5000"
                    min="0"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    className="form-control"
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>💾 Save Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { fmt, StatusBadge } from '../utils/helpers';
import { api } from '../utils/api';

const TYPES = ['Mini Truck', 'Truck', 'Van', 'Pickup', 'Bus', 'Trailer', 'Other'];
const STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired'];
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];

export default function Vehicles({ vehicles, refreshData, currentUser, toast, confirmAction }) {
  const [searchQ, setSearchQ] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState(1);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formRegNo, setFormRegNo] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [formMaxLoad, setFormMaxLoad] = useState('');
  const [formOdometer, setFormOdometer] = useState('');
  const [formAcquisitionCost, setFormAcquisitionCost] = useState('');
  const [formRegion, setFormRegion] = useState('');
  const [formStatus, setFormStatus] = useState('Available');
  const [regNoErr, setRegNoErr] = useState('');

  const canEdit = ['fleet_manager'].includes(currentUser?.role);

  // Filter and Sort Data
  const getFilteredData = () => {
    let data = [...vehicles];
    if (searchQ) {
      const q = searchQ.toLowerCase();
      data = data.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.regNo.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q)
      );
    }
    if (filterType) data = data.filter(v => v.type === filterType);
    if (filterStatus) data = data.filter(v => v.status === filterStatus);
    if (filterRegion) data = data.filter(v => v.region === filterRegion);

    data.sort((a, b) => {
      let av = a[sortCol] ?? '';
      let bv = b[sortCol] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * sortDir;
      }
      return av.toString().localeCompare(bv.toString()) * sortDir;
    });

    return data;
  };

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(sortDir * -1);
    } else {
      setSortCol(col);
      setSortDir(1);
    }
  };

  const getSortIcon = (col) => {
    if (sortCol !== col) return '↕';
    return sortDir === 1 ? '↑' : '↓';
  };

  const openModal = (id = null) => {
    setRegNoErr('');
    if (id) {
      const v = vehicles.find(x => x.id === id);
      if (!v) return;
      setEditId(id);
      setFormRegNo(v.regNo);
      setFormName(v.name);
      setFormType(v.type);
      setFormMaxLoad(v.maxLoad);
      setFormOdometer(v.odometer);
      setFormAcquisitionCost(v.acquisitionCost);
      setFormRegion(v.region || '');
      setFormStatus(v.status);
    } else {
      setEditId(null);
      setFormRegNo('');
      setFormName('');
      setFormType('');
      setFormMaxLoad('');
      setFormOdometer('');
      setFormAcquisitionCost('');
      setFormRegion('');
      setFormStatus('Available');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
  };

  const handleSave = async () => {
    const rawReg = formRegNo.trim();
    const name = formName.trim();
    const type = formType;
    const maxLoad = parseFloat(formMaxLoad) || 0;
    const odometer = parseFloat(formOdometer) || 0;
    const acquisitionCost = parseFloat(formAcquisitionCost) || 0;
    const region = formRegion;
    const status = formStatus;

    if (!rawReg || !name || !type) {
      toast('Please fill all required fields.', 'error');
      return;
    }

    // Reg No format validation: Indian plate regex
    const regNoRegex = /^[A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{1,2}[ -]?[0-9]{4}$/i;
    if (!regNoRegex.test(rawReg)) {
      setRegNoErr('Invalid format. Example: MH-01-AA-1234');
      toast('Registration number format is invalid!', 'error');
      return;
    }

    // Auto-normalize: MH01AA1234 -> MH-01-AA-1234
    const cleanReg = rawReg.replace(/[^a-zA-Z0-9]/g, '');
    const regNo = cleanReg.replace(/^([A-Z]{2})([0-9]{2})([A-Z]{1,2})([0-9]{4})$/i, '$1-$2-$3-$4').toUpperCase();

    if (maxLoad <= 0) {
      toast('Max load capacity must be greater than 0 kg.', 'error');
      return;
    }
    if (parseFloat(formOdometer) < 0) {
      toast('Odometer reading cannot be negative.', 'error');
      return;
    }
    if (parseFloat(formAcquisitionCost) < 0) {
      toast('Acquisition cost cannot be negative.', 'error');
      return;
    }

    // Unique check
    const duplicate = vehicles.find(v => v.regNo === regNo && v.id !== editId);
    if (duplicate) {
      setRegNoErr('This registration number already exists!');
      toast('Registration number must be unique!', 'error');
      return;
    }
    setRegNoErr('');

    try {
      const payload = { regNo, name, type, maxLoad, odometer, acquisitionCost, region, status };
      if (editId) {
        await api.updateVehicle(editId, payload);
        toast(`Vehicle "${name}" updated!`, 'success');
      } else {
        await api.createVehicle(payload);
        toast(`Vehicle "${name}" added!`, 'success');
      }
      await refreshData();
      closeModal();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const v = vehicles.find(x => x.id === id);
    if (!v) return;
    const ok = await confirmAction(`Delete vehicle "${v.name}" (${v.regNo})? This cannot be undone.`);
    if (!ok) return;

    try {
      await api.deleteVehicle(id);
      toast(`Vehicle "${v.name}" deleted.`, 'warn');
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
          <h2>Vehicle Registry</h2>
          <p>Manage your fleet assets and monitor their status</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => openModal()}>➕ Add Vehicle</button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            type="text"
            placeholder="Search vehicles…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
          <option value="">All Regions</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className="chip">{filteredData.length} vehicle{filteredData.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('regNo')}>Reg No <span className="sort-icon">{getSortIcon('regNo')}</span></th>
              <th onClick={() => handleSort('name')}>Vehicle <span className="sort-icon">{getSortIcon('name')}</span></th>
              <th onClick={() => handleSort('type')}>Type <span className="sort-icon">{getSortIcon('type')}</span></th>
              <th onClick={() => handleSort('maxLoad')}>Max Load <span className="sort-icon">{getSortIcon('maxLoad')}</span></th>
              <th onClick={() => handleSort('odometer')}>Odometer <span className="sort-icon">{getSortIcon('odometer')}</span></th>
              <th onClick={() => handleSort('acquisitionCost')}>Acq. Cost <span className="sort-icon">{getSortIcon('acquisitionCost')}</span></th>
              <th onClick={() => handleSort('region')}>Region <span className="sort-icon">{getSortIcon('region')}</span></th>
              <th onClick={() => handleSort('status')}>Status <span className="sort-icon">{getSortIcon('status')}</span></th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 9 : 8}>
                  <div className="empty-state">
                    <div className="empty-icon">🚛</div>
                    <h4>No vehicles found</h4>
                    <p>Add your first vehicle or adjust filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map(v => (
                <tr key={v.id}>
                  <td className="td-mono">{v.regNo}</td>
                  <td><strong>{v.name}</strong></td>
                  <td>{v.type}</td>
                  <td>{fmt.number(v.maxLoad)} kg</td>
                  <td>{fmt.km(v.odometer)}</td>
                  <td>{fmt.currency(v.acquisitionCost)}</td>
                  <td>{v.region || '–'}</td>
                  <td><StatusBadge status={v.status} /></td>
                  {canEdit && (
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openModal(v.id)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>🗑️ Delete</button>
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
              <span className="modal-title">{editId ? 'Edit Vehicle' : 'Add Vehicle'}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Registration Number *</label>
                  <input
                    className="form-control"
                    placeholder="MH-01-AA-1234"
                    value={formRegNo}
                    onChange={(e) => setFormRegNo(e.target.value)}
                  />
                  {regNoErr && <div className="form-error">{regNoErr}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Name / Model *</label>
                  <input
                    className="form-control"
                    placeholder="Tata Ace Gold"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-control"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    <option value="">Select type</option>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Max Load Capacity (kg) *</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="1000"
                    min="0"
                    value={formMaxLoad}
                    onChange={(e) => setFormMaxLoad(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Odometer (km)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formOdometer}
                    onChange={(e) => setFormOdometer(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Acquisition Cost (₹)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="1000000"
                    min="0"
                    value={formAcquisitionCost}
                    onChange={(e) => setFormAcquisitionCost(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Region</label>
                  <select
                    className="form-control"
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                  >
                    <option value="">Select region</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>💾 Save Vehicle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

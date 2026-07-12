import React, { useState } from 'react';
import { fmt, StatusBadge, licenseStatus } from '../utils/helpers';
import { Store } from '../utils/store';

const STATUSES = ['Available', 'On Trip', 'Off Duty', 'Suspended'];
const CATEGORIES = ['LMV', 'HMV', 'HPMV', 'Transport'];

export default function Drivers({ drivers, setDrivers, currentUser, toast, confirmAction }) {
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState(1);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formLicenseNo, setFormLicenseNo] = useState('');
  const [formLicenseCategory, setFormLicenseCategory] = useState('');
  const [formLicenseExpiry, setFormLicenseExpiry] = useState('');
  const [formSafetyScore, setFormSafetyScore] = useState('');
  const [formStatus, setFormStatus] = useState('Available');

  const canEdit = ['fleet_manager', 'safety_officer'].includes(currentUser?.role);

  const getFilteredData = () => {
    let data = [...drivers];
    if (searchQ) {
      const q = searchQ.toLowerCase();
      data = data.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.licenseNo.toLowerCase().includes(q) ||
        d.contact.includes(q)
      );
    }
    if (filterStatus) data = data.filter(d => d.status === filterStatus);
    if (filterCategory) data = data.filter(d => d.licenseCategory === filterCategory);

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

  const renderScoreBar = (score) => {
    const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div className="score-bar">
          <div className="score-fill" style={{ width: `${score}%`, background: color }}></div>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, color: color }}>{score}</span>
      </div>
    );
  };

  const openModal = (id = null) => {
    if (id) {
      const d = drivers.find(x => x.id === id);
      if (!d) return;
      setEditId(id);
      setFormName(d.name);
      setFormContact(d.contact);
      setFormLicenseNo(d.licenseNo);
      setFormLicenseCategory(d.licenseCategory);
      setFormLicenseExpiry(d.licenseExpiry);
      setFormSafetyScore(d.safetyScore);
      setFormStatus(d.status);
    } else {
      setEditId(null);
      setFormName('');
      setFormContact('');
      setFormLicenseNo('');
      setFormLicenseCategory('');
      setFormLicenseExpiry('');
      setFormSafetyScore('80');
      setFormStatus('Available');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
  };

  const handleSave = () => {
    const name = formName.trim();
    const contact = formContact.trim();
    const licenseNo = formLicenseNo.trim().toUpperCase();
    const licenseCategory = formLicenseCategory;
    const licenseExpiry = formLicenseExpiry;
    const safetyScore = parseInt(formSafetyScore) || 80;
    const status = formStatus;

    if (!name || !contact || !licenseNo || !licenseCategory || !licenseExpiry) {
      toast('Please fill all required fields.', 'error');
      return;
    }

    let updatedDrivers;
    if (editId) {
      updatedDrivers = drivers.map(d =>
        d.id === editId
          ? { ...d, name, contact, licenseNo, licenseCategory, licenseExpiry, safetyScore, status }
          : d
      );
      toast(`Driver "${name}" updated!`, 'success');
    } else {
      updatedDrivers = [
        ...drivers,
        { id: Store.genId(), name, contact, licenseNo, licenseCategory, licenseExpiry, safetyScore, status }
      ];
      toast(`Driver "${name}" added!`, 'success');
    }

    setDrivers(updatedDrivers);
    Store.set('drivers', updatedDrivers);
    closeModal();
  };

  const handleDelete = async (id) => {
    const d = drivers.find(x => x.id === id);
    if (!d) return;
    const ok = await confirmAction(`Delete driver "${d.name}"? This cannot be undone.`);
    if (!ok) return;

    const updatedDrivers = drivers.filter(x => x.id !== id);
    setDrivers(updatedDrivers);
    Store.set('drivers', updatedDrivers);
    toast(`Driver "${d.name}" removed.`, 'warn');
  };

  const filteredData = getFilteredData();

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Driver Management</h2>
          <p>Driver profiles, license compliance, and status tracking</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => openModal()}>➕ Add Driver</button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            type="text"
            placeholder="Search drivers…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="chip">{filteredData.length} driver{filteredData.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Name <span className="sort-icon">{getSortIcon('name')}</span></th>
              <th onClick={() => handleSort('licenseNo')}>License No <span className="sort-icon">{getSortIcon('licenseNo')}</span></th>
              <th onClick={() => handleSort('licenseCategory')}>Category <span className="sort-icon">{getSortIcon('licenseCategory')}</span></th>
              <th onClick={() => handleSort('licenseExpiry')}>Expiry <span className="sort-icon">{getSortIcon('licenseExpiry')}</span></th>
              <th>License Status</th>
              <th onClick={() => handleSort('contact')}>Contact <span className="sort-icon">{getSortIcon('contact')}</span></th>
              <th onClick={() => handleSort('safetyScore')}>Safety Score <span className="sort-icon">{getSortIcon('safetyScore')}</span></th>
              <th onClick={() => handleSort('status')}>Status <span className="sort-icon">{getSortIcon('status')}</span></th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 9 : 8}>
                  <div className="empty-state">
                    <div className="empty-icon">👤</div>
                    <h4>No drivers found</h4>
                    <p>Add your first driver or adjust filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map(d => {
                const ls = licenseStatus(d.licenseExpiry);
                return (
                  <tr key={d.id}>
                    <td><strong>{d.name}</strong></td>
                    <td className="td-mono">{d.licenseNo}</td>
                    <td><span className="chip">{d.licenseCategory}</span></td>
                    <td>{fmt.date(d.licenseExpiry)}</td>
                    <td><span className={`badge ${ls.cls}`}>{ls.label}</span></td>
                    <td>{d.contact}</td>
                    <td>{renderScoreBar(d.safetyScore)}</td>
                    <td><StatusBadge status={d.status} /></td>
                    {canEdit && (
                      <td>
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openModal(d.id)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>🗑️ Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target.classList.contains('modal-overlay') && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editId ? 'Edit Driver' : 'Add Driver'}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-control"
                    placeholder="Ravi Kumar"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    className="form-control"
                    placeholder="9876543210"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">License Number *</label>
                  <input
                    className="form-control"
                    placeholder="MH-2020-1234567"
                    value={formLicenseNo}
                    onChange={(e) => setFormLicenseNo(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">License Category *</label>
                  <select
                    className="form-control"
                    value={formLicenseCategory}
                    onChange={(e) => setFormLicenseCategory(e.target.value)}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">License Expiry Date *</label>
                  <input
                    className="form-control"
                    type="date"
                    value={formLicenseExpiry}
                    onChange={(e) => setFormLicenseExpiry(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Safety Score (0–100)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="85"
                    min="0"
                    max="100"
                    value={formSafetyScore}
                    onChange={(e) => setFormSafetyScore(e.target.value)}
                  />
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
              <button className="btn btn-primary" onClick={handleSave}>💾 Save Driver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

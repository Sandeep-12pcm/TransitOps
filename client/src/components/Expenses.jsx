import React, { useState, useEffect } from 'react';
import { fmt } from '../utils/helpers';
import { api } from '../utils/api';

const EXPENSE_CATEGORIES = ['Toll', 'Maintenance', 'Repair', 'Permit', 'Miscellaneous'];

export default function Expenses({
  fuelLogs,
  expenses,
  vehicles,
  refreshData,
  currentUser, toast, confirmAction
}) {
  const [activeTab, setActiveTab] = useState('fuel');
  const [searchQ, setSearchQ] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');

  // Fuel Log Form State
  const [flVehicleId, setFlVehicleId] = useState('');
  const [flDate, setFlDate] = useState(new Date().toISOString().slice(0, 10));
  const [flLiters, setFlLiters] = useState('');
  const [flRate, setFlRate] = useState('96.50');
  const [flTotal, setFlTotal] = useState('0.00');
  const [flOdometer, setFlOdometer] = useState('');

  // General Expense Form State
  const [expVehicleId, setExpVehicleId] = useState('');
  const [expCategory, setExpCategory] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expNotes, setExpNotes] = useState('');

  // Auto calculate fuel total
  useEffect(() => {
    const liters = parseFloat(flLiters) || 0;
    const rate = parseFloat(flRate) || 0;
    setFlTotal((liters * rate).toFixed(2));
  }, [flLiters, flRate]);

  const getVehicleName = (id) => {
    const v = vehicles.find(x => x.id === id);
    return v ? `${v.name} (${v.regNo})` : '–';
  };

  // Filter fuel logs
  const getFilteredFuelLogs = () => {
    let data = [...fuelLogs];
    if (filterVehicle) data = data.filter(f => f.vehicleId === filterVehicle);
    if (searchQ) {
      const q = searchQ.toLowerCase();
      data = data.filter(f => getVehicleName(f.vehicleId).toLowerCase().includes(q));
    }
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    return data;
  };

  // Filter expenses
  const getFilteredExpenses = () => {
    let data = [...expenses];
    if (filterVehicle) data = data.filter(e => e.vehicleId === filterVehicle);
    if (searchQ) {
      const q = searchQ.toLowerCase();
      data = data.filter(e =>
        getVehicleName(e.vehicleId).toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    return data;
  };

  const handleSaveFuel = async () => {
    const vehicleId = flVehicleId;
    const date = flDate;
    const liters = parseFloat(flLiters) || 0;
    const rate = parseFloat(flRate) || 0;
    const odometer = parseFloat(flOdometer) || 0;

    if (!vehicleId || !date) {
      toast('Please fill all required fields.', 'error');
      return;
    }

    if (liters <= 0) {
      toast('Fuel volume must be greater than 0 liters.', 'error');
      return;
    }

    if (rate <= 0) {
      toast('Fuel rate must be greater than 0.', 'error');
      return;
    }

    if (parseFloat(flOdometer) < 0) {
      toast('Odometer reading cannot be negative.', 'error');
      return;
    }

    try {
      const payload = {
        vehicleId,
        date,
        liters,
        totalCost: liters * rate,
        odometer: odometer || undefined
      };
      await api.createFuelLog(payload);
      toast('Fuel log saved!', 'success');
      await refreshData();

      // Reset Form
      setFlVehicleId('');
      setFlLiters('');
      setFlOdometer('');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDeleteFuel = async (id) => {
    const ok = await confirmAction('Delete this fuel log?');
    if (!ok) return;

    try {
      await api.deleteFuelLog(id);
      toast('Fuel log deleted.', 'warn');
      await refreshData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleSaveExpense = async () => {
    const vehicleId = expVehicleId;
    const category = expCategory;
    const amount = parseFloat(expAmount) || 0;
    const date = expDate;
    const notes = expNotes.trim();

    if (!vehicleId || !category || !date) {
      toast('Please fill all required fields.', 'error');
      return;
    }

    if (amount <= 0) {
      toast('Expense amount must be greater than 0.', 'error');
      return;
    }
    try {
      const payload = {
        vehicleId,
        category,
        amount,
        date,
        notes
      };
      await api.createExpense(payload);
      toast('Expense saved!', 'success');
      await refreshData();

      // Reset Form
      setExpVehicleId('');
      setExpCategory('');
      setExpAmount('');
      setExpNotes('');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDeleteExpense = async (id) => {
    const ok = await confirmAction('Delete this expense record?');
    if (!ok) return;

    try {
      await api.deleteExpense(id);
      toast('Expense deleted.', 'warn');
      await refreshData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filteredFuel = getFilteredFuelLogs();
  const filteredExp = getFilteredExpenses();

  const totalFuelCost = filteredFuel.reduce((s, f) => s + (f.totalCost || 0), 0);
  const totalFuelLiters = filteredFuel.reduce((s, f) => s + (f.liters || 0), 0);
  const totalExpenseCost = filteredExp.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Fuel & Expenses</h2>
          <p>Track fuel consumption and operational costs per vehicle</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            type="text"
            placeholder="Search…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}>
          <option value="">All Vehicles</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <div className="d-flex gap-8" style={{ marginLeft: 'auto' }}>
          <button className={`btn ${activeTab === 'fuel' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('fuel')}>
            ⛽ Fuel Logs
          </button>
          <button className={`btn ${activeTab === 'expense' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('expense')}>
            💸 Expenses
          </button>
        </div>
      </div>

      {activeTab === 'fuel' ? (
        <div>
          <div className="d-flex gap-12 align-center mb-16" style={{ flexWrap: 'wrap' }}>
            <span className="chip">Total Cost: {fmt.currency(totalFuelCost)}</span>
            <span className="chip">Total Liters: {fmt.number(totalFuelLiters)} L</span>
            <span className="chip">{filteredFuel.length} records</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Date</th>
                  <th>Liters</th>
                  <th>Rate (₹/L)</th>
                  <th>Total Cost</th>
                  <th>Odometer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFuel.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-icon">⛽</div>
                        <h4>No fuel logs found</h4>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFuel.map(f => (
                    <tr key={f.id}>
                      <td><strong>{getVehicleName(f.vehicleId)}</strong></td>
                      <td>{fmt.date(f.date)}</td>
                      <td>{fmt.number(f.liters)} L</td>
                      <td>{fmt.currency(f.costPerLiter)}</td>
                      <td><strong>{fmt.currency(f.totalCost)}</strong></td>
                      <td>{f.odometer ? fmt.km(f.odometer) : '–'}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteFuel(f.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Fuel Log Form */}
          <div className="card mt-20">
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>➕ Add Fuel Log</h4>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Vehicle *</label>
                <select className="form-control" value={flVehicleId} onChange={(e) => setFlVehicleId(e.target.value)}>
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} · {v.regNo}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-control" type="date" value={flDate} onChange={(e) => setFlDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Liters *</label>
                <input
                  className="form-control"
                  type="number"
                  placeholder="40"
                  min="0"
                  step="0.1"
                  value={flLiters}
                  onChange={(e) => setFlLiters(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cost per Liter (₹)</label>
                <input
                  className="form-control"
                  type="number"
                  placeholder="96.50"
                  step="0.01"
                  value={flRate}
                  onChange={(e) => setFlRate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Cost (₹)</label>
                <input className="form-control" type="number" value={flTotal} readOnly style={{ opacity: 0.7 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Odometer Reading (km)</label>
                <input
                  className="form-control"
                  type="number"
                  placeholder="48500"
                  min="0"
                  value={flOdometer}
                  onChange={(e) => setFlOdometer(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleSaveFuel}>💾 Save Fuel Log</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="d-flex gap-12 align-center mb-16" style={{ flexWrap: 'wrap' }}>
            <span className="chip">Total: {fmt.currency(totalExpenseCost)}</span>
            <span className="chip">{filteredExp.length} records</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Category</th>
                  <th>Amount (₹)</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExp.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <div className="empty-icon">💸</div>
                        <h4>No expense records found</h4>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExp.map(e => (
                    <tr key={e.id}>
                      <td><strong>{getVehicleName(e.vehicleId)}</strong></td>
                      <td><span className="chip">{e.category}</span></td>
                      <td><strong>{fmt.currency(e.amount)}</strong></td>
                      <td>{fmt.date(e.date)}</td>
                      <td className="fs-12 text-muted">{e.notes || '–'}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteExpense(e.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Expense Form */}
          <div className="card mt-20">
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>➕ Add Expense</h4>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Vehicle *</label>
                <select className="form-control" value={expVehicleId} onChange={(e) => setExpVehicleId(e.target.value)}>
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} · {v.regNo}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input
                  className="form-control"
                  type="number"
                  placeholder="500"
                  min="0"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-control" type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Notes</label>
                <input
                  className="form-control"
                  placeholder="Brief description…"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleSaveExpense}>💾 Save Expense</button>
          </div>
        </div>
      )}
    </div>
  );
}

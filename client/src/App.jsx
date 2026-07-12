import React, { useState, useEffect } from 'react';
import { Store } from './utils/store';
import { StatusBadge, licenseStatus } from './utils/helpers';
import Dashboard from './components/Dashboard';
import Vehicles from './components/Vehicles';
import Drivers from './components/Drivers';
import Trips from './components/Trips';
import Maintenance from './components/Maintenance';
import Expenses from './components/Expenses';
import Reports from './components/Reports';

const PAGES = {
  dashboard: { title: 'Dashboard', subtitle: 'Operational overview & KPIs', icon: '📊', permission: 'dashboard' },
  vehicles: { title: 'Vehicle Registry', subtitle: 'Manage fleet vehicles', icon: '🚛', permission: 'vehicles' },
  drivers: { title: 'Driver Management', subtitle: 'Driver profiles & compliance', icon: '👤', permission: 'drivers' },
  trips: { title: 'Trip Management', subtitle: 'Dispatch & lifecycle tracking', icon: '🗺️', permission: 'trips' },
  maintenance: { title: 'Maintenance', subtitle: 'Vehicle maintenance logs', icon: '🔧', permission: 'maintenance' },
  expenses: { title: 'Fuel & Expenses', subtitle: 'Fuel logs & operational costs', icon: '⛽', permission: 'expenses' },
  reports: { title: 'Reports & Analytics', subtitle: 'KPIs, charts & exports', icon: '📈', permission: 'reports' },
};

const PERMISSIONS = {
  fleet_manager: ['dashboard', 'vehicles', 'drivers', 'trips', 'maintenance', 'expenses', 'reports'],
  driver: ['dashboard', 'trips', 'expenses'],
  safety_officer: ['dashboard', 'drivers', 'trips', 'reports'],
  financial_analyst: ['dashboard', 'expenses', 'reports'],
};

const ROLE_LABELS = {
  fleet_manager: 'Fleet Manager',
  driver: 'Driver',
  safety_officer: 'Safety Officer',
  financial_analyst: 'Financial Analyst',
};

const ROLE_COLORS = {
  fleet_manager: '#6c63ff',
  driver: '#00c9a7',
  safety_officer: '#ff6b6b',
  financial_analyst: '#ffd166',
};

export default function App() {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('transitops_theme') || 'dark');

  // Sidebar Open State (for responsive layout)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Seeding state & user roles loading
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  // Core Data Lists
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    resolve: null
  });

  // Init Data and Seed
  useEffect(() => {
    Store.seed();

    const loadedUsers = Store.get('users');
    setUsers(loadedUsers);

    // Bypassing login: default to fleet manager
    const fleetMgr = loadedUsers.find(u => u.role === 'fleet_manager') || loadedUsers[0];
    setCurrentUser(fleetMgr);

    setVehicles(Store.get('vehicles'));
    setDrivers(Store.get('drivers'));
    setTrips(Store.get('trips'));
    setMaintenance(Store.get('maintenance'));
    setFuelLogs(Store.get('fuelLogs'));
    setExpenses(Store.get('expenses'));
  }, []);

  // Theme effect
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('transitops_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Toast Notification Helper
  const toast = (msg, type = 'info', duration = 3500) => {
    const id = Store.genId();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, fadeOut: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, duration);
  };

  // Confirm Dialog Helper
  const confirmAction = (message) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        message,
        resolve
      });
    });
  };

  const handleConfirmClose = (result) => {
    if (confirmDialog.resolve) {
      confirmDialog.resolve(result);
    }
    setConfirmDialog({ isOpen: false, message: '', resolve: null });
  };

  // Role Switcher Selection
  const selectRole = (role) => {
    const matchingUser = users.find(u => u.role === role);
    if (matchingUser) {
      setCurrentUser(matchingUser);
      // Auto-redirect if page not allowed for new role
      const allowedPages = PERMISSIONS[role] || [];
      if (!allowedPages.includes(activePage)) {
        setActivePage('dashboard');
      }
      toast(`Switched role to ${ROLE_LABELS[role]}`, 'info');
    }
  };

  const canAccess = (page) => {
    if (!currentUser) return false;
    return (PERMISSIONS[currentUser.role] || []).includes(page);
  };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const roleColor = currentUser ? (ROLE_COLORS[currentUser.role] || '#888') : '#888';

  const renderActivePage = () => {
    if (!canAccess(activePage)) return <div>Access Denied</div>;

    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            vehicles={vehicles}
            drivers={drivers}
            trips={trips}
            fuelLogs={fuelLogs}
            expenses={expenses}
            maintenance={maintenance}
          />
        );
      case 'vehicles':
        return (
          <Vehicles
            vehicles={vehicles}
            setVehicles={setVehicles}
            currentUser={currentUser}
            toast={toast}
            confirmAction={confirmAction}
          />
        );
      case 'drivers':
        return (
          <Drivers
            drivers={drivers}
            setDrivers={setDrivers}
            currentUser={currentUser}
            toast={toast}
            confirmAction={confirmAction}
          />
        );
      case 'trips':
        return (
          <Trips
            trips={trips}
            setTrips={setTrips}
            vehicles={vehicles}
            setVehicles={setVehicles}
            drivers={drivers}
            setDrivers={setDrivers}
            fuelLogs={fuelLogs}
            setFuelLogs={setFuelLogs}
            currentUser={currentUser}
            toast={toast}
            confirmAction={confirmAction}
          />
        );
      case 'maintenance':
        return (
          <Maintenance
            maintenance={maintenance}
            setMaintenance={setMaintenance}
            vehicles={vehicles}
            setVehicles={setVehicles}
            currentUser={currentUser}
            toast={toast}
            confirmAction={confirmAction}
          />
        );
      case 'expenses':
        return (
          <Expenses
            fuelLogs={fuelLogs}
            setFuelLogs={setFuelLogs}
            expenses={expenses}
            setExpenses={setExpenses}
            vehicles={vehicles}
            currentUser={currentUser}
            toast={toast}
            confirmAction={confirmAction}
          />
        );
      case 'reports':
        return (
          <Reports
            vehicles={vehicles}
            trips={trips}
            fuelLogs={fuelLogs}
            expenses={expenses}
            maintenance={maintenance}
            toast={toast}
          />
        );
      default:
        return <div>Page Not Found</div>;
    }
  };

  const navItems = Object.entries(PAGES)
    .filter(([key]) => canAccess(key))
    .map(([key, info]) => (
      <div
        key={key}
        className={`nav-item ${activePage === key ? 'active' : ''}`}
        onClick={() => {
          setActivePage(key);
          setIsSidebarOpen(false);
        }}
      >
        <span className="nav-icon">{info.icon}</span>
        <span>{info.title}</span>
      </div>
    ));

  return (
    <div id="app" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav id="sidebar" className={isSidebarOpen ? 'open' : ''}>
        <div className="sidebar-logo">
          <div className="logo-icon">🚚</div>
          <div className="logo-text">
            <strong>TransitOps</strong>
            <span>Transport Platform</span>
          </div>
        </div>
        {currentUser && (
          <div id="sidebar-user">
            <div className="user-avatar" style={{ background: `${roleColor}22`, color: roleColor }}>{initials}</div>
            <div className="user-info">
              <div className="u-name">{currentUser.name}</div>
              <div className="u-role">{ROLE_LABELS[currentUser.role]}</div>
            </div>
          </div>
        )}
        <nav id="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems}
        </nav>
        <div className="sidebar-footer">
          {/* Active Demo Role Switcher */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-3)' }}>Demo Role Switcher</label>
            <select
              className="form-control"
              style={{ fontSize: '11px', padding: '6px 10px', background: 'var(--bg-3)', color: 'var(--text-1)' }}
              value={currentUser?.role || ''}
              onChange={(e) => selectRole(e.target.value)}
            >
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <option key={role} value={role}>{label}</option>
              ))}
            </select>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div id="main-content">
        <header id="top-header">
          <div className="d-flex align-center">
            {/* Hamburger Button for Mobile View */}
            <button
              className="btn btn-ghost"
              style={{ marginRight: '14px', padding: '6px 12px', fontSize: '16px' }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              ☰
            </button>
            <div>
              <div className="header-title" id="header-title">{PAGES[activePage]?.title}</div>
              <div className="header-subtitle" id="header-subtitle">{PAGES[activePage]?.subtitle}</div>
            </div>
          </div>
          <div className="header-actions">
            {currentUser && (
              <span className="chip">{currentUser.name} · {ROLE_LABELS[currentUser.role]}</span>
            )}
          </div>
        </header>
        <div id="page-content">
          {renderActivePage()}
        </div>
      </div>

      {/* Toast Notifications */}
      <div id="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type} ${t.fadeOut ? 'fade-out' : ''}`}>
            <span>
              {t.type === 'success' && '✅'}
              {t.type === 'error' && '❌'}
              {t.type === 'warn' && '⚠️'}
              {t.type === 'info' && 'ℹ️'}
            </span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Custom Confirm Dialog Overlay */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay open" onClick={() => handleConfirmClose(false)}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <span className="modal-title">⚠️ Confirm Action</span>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: 'var(--text-2)' }}>{confirmDialog.message}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => handleConfirmClose(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleConfirmClose(true)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { fmt, StatusBadge, licenseStatus } from '../utils/helpers';

export default function Dashboard({ vehicles, drivers, trips, fuelLogs, expenses, maintenance }) {
  const vStatusChartRef = useRef(null);
  const tStatusChartRef = useRef(null);
  const vStatusChartInstance = useRef(null);
  const tStatusChartInstance = useRef(null);

  // Compute KPIs
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired').length;
  const availVehicles = vehicles.filter(v => v.status === 'Available').length;
  const inShopVehicles = vehicles.filter(v => v.status === 'In Shop').length;
  const onTripVehicles = vehicles.filter(v => v.status === 'On Trip').length;
  const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter(t => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter(d => d.status === 'On Trip').length;
  const fleetUtil = activeVehicles ? Math.round((onTripVehicles / activeVehicles) * 100) : 0;

  const expiredLicenses = drivers.filter(d => {
    const ls = licenseStatus(d.licenseExpiry);
    return ls.label === 'Expired';
  }).length;

  const nearExpiry = drivers.filter(d => {
    const ls = licenseStatus(d.licenseExpiry);
    return ls.label !== 'Valid' && d.status !== 'Suspended';
  });

  useEffect(() => {
    // 1. Vehicle Status Doughnut Chart
    if (vStatusChartRef.current) {
      if (vStatusChartInstance.current) {
        vStatusChartInstance.current.destroy();
      }
      vStatusChartInstance.current = new Chart(vStatusChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Available', 'On Trip', 'In Shop', 'Retired'],
          datasets: [{
            data: [
              vehicles.filter(v => v.status === 'Available').length,
              vehicles.filter(v => v.status === 'On Trip').length,
              vehicles.filter(v => v.status === 'In Shop').length,
              vehicles.filter(v => v.status === 'Retired').length,
            ],
            backgroundColor: ['#06d6a0', '#6c63ff', '#fca549', '#6b7394'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#9ca3c4', font: { size: 11 } }
            }
          },
          cutout: '72%',
        }
      });
    }

    // 2. Trip Status Bar Chart
    if (tStatusChartRef.current) {
      if (tStatusChartInstance.current) {
        tStatusChartInstance.current.destroy();
      }
      const counts = ['Draft', 'Dispatched', 'Completed', 'Cancelled'].map(s =>
        trips.filter(t => t.status === s).length
      );
      tStatusChartInstance.current = new Chart(tStatusChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
          datasets: [{
            data: counts,
            backgroundColor: ['#6b7394', '#6c63ff', '#06d6a0', '#ff6b6b'],
            borderRadius: 6,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              ticks: { color: '#6b7394', font: { size: 11 } },
              grid: { color: 'rgba(255,255,255,0.04)' },
              beginAtZero: true
            },
            x: {
              ticks: { color: '#9ca3c4', font: { size: 11 } },
              grid: { display: false }
            }
          }
        }
      });
    }

    return () => {
      if (vStatusChartInstance.current) vStatusChartInstance.current.destroy();
      if (tStatusChartInstance.current) tStatusChartInstance.current.destroy();
    };
  }, [vehicles, trips]);

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card c-primary">
          <div className="kpi-icon">🚛</div>
          <div className="kpi-value">{activeVehicles}</div>
          <div className="kpi-label">Total Active Vehicles</div>
        </div>
        <div className="kpi-card c-success">
          <div className="kpi-icon">✅</div>
          <div className="kpi-value">{availVehicles}</div>
          <div className="kpi-label">Available Vehicles</div>
        </div>
        <div className="kpi-card c-warning">
          <div className="kpi-icon">🔧</div>
          <div className="kpi-value">{inShopVehicles}</div>
          <div className="kpi-label">Vehicles in Maintenance</div>
        </div>
        <div className="kpi-card c-accent">
          <div className="kpi-icon">🗺️</div>
          <div className="kpi-value">{activeTrips}</div>
          <div className="kpi-label">Active Trips</div>
        </div>
        <div className="kpi-card c-info">
          <div className="kpi-icon">📋</div>
          <div className="kpi-value">{pendingTrips}</div>
          <div className="kpi-label">Pending Trips</div>
        </div>
        <div className="kpi-card c-accent2">
          <div className="kpi-icon">👤</div>
          <div className="kpi-value">{driversOnDuty}</div>
          <div className="kpi-label">Drivers On Duty</div>
        </div>
        <div className="kpi-card c-primary">
          <div className="kpi-icon">📊</div>
          <div className="kpi-value">{fleetUtil}%</div>
          <div className="kpi-label">Fleet Utilization</div>
        </div>
        <div className="kpi-card c-danger">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-value">{expiredLicenses}</div>
          <div className="kpi-label">License Issues</div>
        </div>
      </div>

      {nearExpiry.length > 0 && (
        <div className="card mb-20" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="d-flex align-center gap-8" style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <strong>License Compliance Alerts</strong>
          </div>
          {nearExpiry.map(d => {
            const ls = licenseStatus(d.licenseExpiry);
            return (
              <div key={d.id} className="d-flex align-center gap-12 fs-12" style={{ marginBottom: '6px' }}>
                <span style={{ width: '140px', fontWeight: 600 }}>{d.name}</span>
                <span className={`badge ${ls.cls}`}>{ls.label}</span>
                <span className="text-muted">Expires: {fmt.date(d.licenseExpiry)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="chart-grid">
        <div className="chart-card">
          <h4>Vehicle Status Distribution</h4>
          <div className="chart-container" style={{ height: '220px' }}>
            <canvas ref={vStatusChartRef} id="chart-vehicle-status"></canvas>
          </div>
        </div>
        <div className="chart-card">
          <h4>Trip Status Overview</h4>
          <div className="chart-container" style={{ height: '220px' }}>
            <canvas ref={tStatusChartRef} id="chart-trip-status"></canvas>
          </div>
        </div>
      </div>

      <div className="form-grid-2" style={{ gap: '16px' }}>
        <div className="card">
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>Recent Vehicle Activity</h4>
          {vehicles.slice(0, 5).map(v => (
            <div key={v.id} className="d-flex align-center gap-12" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '18px' }}>🚛</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{v.name}</div>
                <div className="fs-11 text-muted">{v.regNo}</div>
              </div>
              <StatusBadge status={v.status} />
            </div>
          ))}
        </div>
        <div className="card">
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>Driver Overview</h4>
          {drivers.slice(0, 5).map(d => (
            <div key={d.id} className="d-flex align-center gap-12" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '18px' }}>👤</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{d.name}</div>
                <div className="fs-11 text-muted">{d.licenseCategory} · Score: {d.safetyScore}</div>
              </div>
              <StatusBadge status={d.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

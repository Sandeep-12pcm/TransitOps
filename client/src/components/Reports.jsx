import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { fmt } from '../utils/helpers';

export default function Reports({
  vehicles, trips, fuelLogs, expenses, maintenance, toast
}) {
  const chartOpCostRef = useRef(null);
  const chartEfficiencyRef = useRef(null);
  const chartRevCostRef = useRef(null);
  const chartRoiRef = useRef(null);

  const chartInstances = useRef({
    opCost: null,
    efficiency: null,
    revCost: null,
    roi: null
  });

  const getVehicleName = (id) => {
    const v = vehicles.find(x => x.id === id);
    return v ? v.name : 'Unknown';
  };

  // Compute analytics per vehicle
  const buildVehicleAnalytics = () => {
    return vehicles.map(v => {
      const vTrips = trips.filter(t => t.vehicleId === v.id && t.status === 'Completed');
      const vFuel = fuelLogs.filter(f => f.vehicleId === v.id);
      const vExp = expenses.filter(e => e.vehicleId === v.id);
      const vMaint = maintenance.filter(m => m.vehicleId === v.id);

      const totalDist = vTrips.reduce((s, t) => s + (t.actualDistance || t.plannedDistance || 0), 0);
      const totalFuelL = vFuel.reduce((s, f) => s + (f.liters || 0), 0);
      const totalFuelC = vFuel.reduce((s, f) => s + (f.totalCost || 0), 0);
      const totalMaint = vExp.filter(e => e.category === 'Maintenance').reduce((s, e) => s + (e.amount || 0), 0)
        + vMaint.reduce((s, m) => s + (m.cost || 0), 0);
      const totalOtherC = vExp.filter(e => e.category !== 'Maintenance').reduce((s, e) => s + (e.amount || 0), 0);
      const totalOpCost = totalFuelC + totalMaint + totalOtherC;
      const totalRev = vTrips.reduce((s, t) => s + (t.revenue || 0), 0);
      const fuelEff = totalFuelL > 0 ? (totalDist / totalFuelL) : 0;
      const roi = v.acquisitionCost > 0 ? ((totalRev - totalOpCost) / v.acquisitionCost) * 100 : 0;
      const tripCount = vTrips.length;

      return { v, totalDist, totalFuelL, totalFuelC, totalMaint, totalOtherC, totalOpCost, totalRev, fuelEff, roi, tripCount };
    });
  };

  const analytics = buildVehicleAnalytics();

  // Summary figures
  const totalRevenue = analytics.reduce((s, a) => s + a.totalRev, 0);
  const totalOpCost = analytics.reduce((s, a) => s + a.totalOpCost, 0);
  const totalFuelCost = analytics.reduce((s, a) => s + a.totalFuelC, 0);
  const totalMaintCost = analytics.reduce((s, a) => s + a.totalMaint, 0);

  // Initialize charts
  useEffect(() => {
    const labels = analytics.map(a => a.v.name.split(' ').slice(0, 2).join(' '));
    const colors = ['#6c63ff', '#00c9a7', '#ffd166', '#ff6b6b', '#4cc9f0', '#fca549', '#06d6a0'];

    const chartOpts = (unit, legend = false) => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: legend,
          labels: { color: '#9ca3c4', font: { size: 11 } }
        }
      },
      scales: {
        y: {
          ticks: {
            color: '#6b7394',
            font: { size: 11 },
            callback: (val) => unit === '₹' ? '₹' + val.toLocaleString('en-IN') : val + unit
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
          beginAtZero: true
        },
        x: {
          ticks: { color: '#9ca3c4', font: { size: 11 } },
          grid: { display: false }
        }
      }
    });

    // 1. Operational Cost
    if (chartOpCostRef.current) {
      if (chartInstances.current.opCost) chartInstances.current.opCost.destroy();
      chartInstances.current.opCost = new Chart(chartOpCostRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Op. Cost (₹)',
            data: analytics.map(a => a.totalOpCost),
            backgroundColor: colors,
            borderRadius: 6,
          }]
        },
        options: chartOpts('₹')
      });
    }

    // 2. Fuel Efficiency
    if (chartEfficiencyRef.current) {
      if (chartInstances.current.efficiency) chartInstances.current.efficiency.destroy();
      chartInstances.current.efficiency = new Chart(chartEfficiencyRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'km/L',
            data: analytics.map(a => parseFloat(a.fuelEff.toFixed(2))),
            backgroundColor: analytics.map(a => a.fuelEff > 10 ? '#06d6a0' : a.fuelEff > 5 ? '#fca549' : '#ff6b6b'),
            borderRadius: 6,
          }]
        },
        options: chartOpts('km/L')
      });
    }

    // 3. Revenue vs Cost
    if (chartRevCostRef.current) {
      if (chartInstances.current.revCost) chartInstances.current.revCost.destroy();
      chartInstances.current.revCost = new Chart(chartRevCostRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Revenue', data: analytics.map(a => a.totalRev), backgroundColor: '#06d6a0', borderRadius: 6 },
            { label: 'Op. Cost', data: analytics.map(a => a.totalOpCost), backgroundColor: '#ff6b6b', borderRadius: 6 },
          ]
        },
        options: chartOpts('₹', true)
      });
    }

    // 4. ROI
    if (chartRoiRef.current) {
      if (chartInstances.current.roi) chartInstances.current.roi.destroy();
      chartInstances.current.roi = new Chart(chartRoiRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'ROI %',
            data: analytics.map(a => parseFloat(a.roi.toFixed(2))),
            backgroundColor: analytics.map(a => a.roi >= 0 ? '#06d6a0' : '#ff6b6b'),
            borderRadius: 6,
          }]
        },
        options: chartOpts('%')
      });
    }

    return () => {
      Object.keys(chartInstances.current).forEach(key => {
        if (chartInstances.current[key]) {
          chartInstances.current[key].destroy();
          chartInstances.current[key] = null;
        }
      });
    };
  }, [vehicles, trips, fuelLogs, expenses, maintenance]);

  const handleExportCSV = (type) => {
    let rows = [];
    let filename = '';

    if (type === 'vehicles') {
      filename = 'transitops_vehicles.csv';
      rows = [
        ['Reg No', 'Name', 'Type', 'Max Load (kg)', 'Odometer (km)', 'Acquisition Cost', 'Status', 'Region'],
        ...vehicles.map(v => [v.regNo, v.name, v.type, v.maxLoad, v.odometer, v.acquisitionCost, v.status, v.region || ''])
      ];
    } else if (type === 'trips') {
      filename = 'transitops_trips.csv';
      rows = [
        ['Source', 'Destination', 'Vehicle', 'Driver', 'Cargo (kg)', 'Planned Dist', 'Actual Dist', 'Status', 'Revenue', 'Created'],
        ...trips.map(t => [
          t.source,
          t.destination,
          getVehicleName(t.vehicleId),
          '–',
          t.cargoWeight,
          t.plannedDistance,
          t.actualDistance || '',
          t.status,
          t.revenue || '',
          t.createdAt?.slice(0, 10) || ''
        ])
      ];
    } else if (type === 'analytics') {
      filename = 'transitops_analytics.csv';
      rows = [
        ['Vehicle', 'Reg No', 'Trips', 'Total Distance', 'Fuel (L)', 'Fuel Efficiency (km/L)', 'Fuel Cost', 'Maintenance Cost', 'Total Op Cost', 'Revenue', 'ROI %'],
        ...analytics.map(a => [
          a.v.name,
          a.v.regNo,
          a.tripCount,
          a.totalDist.toFixed(0),
          a.totalFuelL.toFixed(1),
          a.fuelEff.toFixed(2),
          a.totalFuelC.toFixed(0),
          a.totalMaint.toFixed(0),
          a.totalOpCost.toFixed(0),
          a.totalRev.toFixed(0),
          a.roi.toFixed(2)
        ])
      ];
    }

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast(`📥 ${filename} exported!`, 'success');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Reports & Analytics</h2>
          <p>Operational KPIs, efficiency metrics, and cost analysis</p>
        </div>
        <div className="d-flex gap-8">
          <button className="btn btn-ghost" onClick={() => handleExportCSV('vehicles')}>📥 Export Vehicles</button>
          <button className="btn btn-ghost" onClick={() => handleExportCSV('trips')}>📥 Export Trips</button>
          <button className="btn btn-primary" onClick={() => handleExportCSV('analytics')}>📊 Export Analytics</button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card c-primary">
          <div className="kpi-icon">💰</div>
          <div className="kpi-value" style={{ fontSize: '20px' }}>{fmt.currency(totalRevenue)}</div>
          <div className="kpi-label">Total Revenue</div>
        </div>
        <div className="kpi-card c-danger">
          <div className="kpi-icon">💸</div>
          <div className="kpi-value" style={{ fontSize: '20px' }}>{fmt.currency(totalOpCost)}</div>
          <div className="kpi-label">Total Operational Cost</div>
        </div>
        <div className="kpi-card c-success">
          <div className="kpi-icon">⛽</div>
          <div className="kpi-value" style={{ fontSize: '20px' }}>{fmt.currency(totalFuelCost)}</div>
          <div className="kpi-label">Total Fuel Cost</div>
        </div>
        <div className="kpi-card c-warning">
          <div className="kpi-icon">🔧</div>
          <div className="kpi-value" style={{ fontSize: '20px' }}>{fmt.currency(totalMaintCost)}</div>
          <div className="kpi-label">Total Maintenance Cost</div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <div className="chart-card">
          <h4>Operational Cost per Vehicle</h4>
          <div className="chart-container" style={{ height: '260px' }}>
            <canvas ref={chartOpCostRef}></canvas>
          </div>
        </div>
        <div className="chart-card">
          <h4>Fuel Efficiency (km/L) by Vehicle</h4>
          <div className="chart-container" style={{ height: '260px' }}>
            <canvas ref={chartEfficiencyRef}></canvas>
          </div>
        </div>
        <div className="chart-card">
          <h4>Revenue vs Operational Cost</h4>
          <div className="chart-container" style={{ height: '260px' }}>
            <canvas ref={chartRevCostRef}></canvas>
          </div>
        </div>
        <div className="chart-card">
          <h4>Vehicle ROI (%)</h4>
          <div className="chart-container" style={{ height: '260px' }}>
            <canvas ref={chartRoiRef}></canvas>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Vehicle Analytics Breakdown</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Trips</th>
              <th>Distance (km)</th>
              <th>Fuel Used (L)</th>
              <th>Fuel Efficiency</th>
              <th>Fuel Cost (₹)</th>
              <th>Maintenance (₹)</th>
              <th>Total Op. Cost (₹)</th>
              <th>Revenue (₹)</th>
              <th>ROI (%)</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map(a => (
              <tr key={a.v.id}>
                <td>
                  <div style={{ fontSize: '13px' }}>
                    <strong>{a.v.name}</strong><br />
                    <span className="td-mono fs-11">{a.v.regNo}</span>
                  </div>
                </td>
                <td>{a.tripCount}</td>
                <td>{fmt.km(a.totalDist)}</td>
                <td>{fmt.number(a.totalFuelL.toFixed(1))} L</td>
                <td>
                  <strong style={{ color: a.fuelEff > 10 ? 'var(--success)' : a.fuelEff > 5 ? 'var(--warning)' : 'var(--danger)' }}>
                    {a.fuelEff > 0 ? a.fuelEff.toFixed(2) + ' km/L' : '–'}
                  </strong>
                </td>
                <td>{fmt.currency(a.totalFuelC)}</td>
                <td>{fmt.currency(a.totalMaint)}</td>
                <td><strong>{fmt.currency(a.totalOpCost)}</strong></td>
                <td><strong style={{ color: 'var(--success)' }}>{fmt.currency(a.totalRev)}</strong></td>
                <td>
                  <strong style={{ color: a.roi >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {a.roi !== 0 ? a.roi.toFixed(1) + '%' : '–'}
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

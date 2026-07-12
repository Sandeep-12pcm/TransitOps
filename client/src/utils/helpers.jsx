import React from 'react';

// Formatting Helpers
export const fmt = {
  currency: (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }),
  number: (n) => Number(n || 0).toLocaleString('en-IN'),
  date: (s) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–',
  dateShort: (s) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '–',
  pct: (n) => Number(n || 0).toFixed(1) + '%',
  km: (n) => Number(n || 0).toLocaleString('en-IN') + ' km',
};

// React Status Badge Component
export function StatusBadge({ status }) {
  const map = {
    'Available': 'available', 'On Trip': 'on-trip', 'In Shop': 'in-shop',
    'Retired': 'retired', 'Off Duty': 'off-duty', 'Suspended': 'suspended',
    'Draft': 'draft', 'Dispatched': 'dispatched', 'Completed': 'completed',
    'Cancelled': 'cancelled', 'Active': 'active', 'Closed': 'closed',
  };
  const cls = map[status] || 'draft';
  return <span className={`badge badge-${cls}`}>{status}</span>;
}

// License Expiry Status Check
export function licenseStatus(expiry) {
  if (!expiry) return { label: 'No Expiry', cls: 'badge-retired', color: 'text-muted' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp = new Date(expiry); exp.setHours(0, 0, 0, 0);
  const diff = Math.floor((exp - today) / 86400000);
  if (diff < 0) return { label: 'Expired', cls: 'badge-expired', color: 'text-danger' };
  if (diff <= 30) return { label: `${diff}d left`, cls: 'badge-near-expiry', color: 'text-warning' };
  return { label: 'Valid', cls: 'badge-valid', color: 'text-success' };
}

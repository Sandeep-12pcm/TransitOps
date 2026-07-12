import React from 'react';

const StatusBadge = ({ status }) => {
  let label = status;
  let bgStyles = '';

  switch (status) {
    case 'Available':
      label = 'Available';
      bgStyles = 'bg-emerald-50 text-emerald-700 border-emerald-250';
      break;
    case 'On_Trip':
    case 'On Trip':
      label = 'On Trip';
      bgStyles = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'In_Shop':
    case 'In Shop':
      label = 'In Shop';
      bgStyles = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'Retired':
      label = 'Retired';
      bgStyles = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    default:
      label = status;
      bgStyles = 'bg-slate-50 text-slate-700 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${bgStyles}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
};

export default StatusBadge;

import React, { useState } from 'react';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaTruck } from 'react-icons/fa';
import StatusBadge from './StatusBadge';

const ITEMS_PER_PAGE = 7;

const VehicleTable = ({ vehicles, onEdit, onDelete, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when queries change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Local Filter Logic for Instant UI updates
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = 
      vehicle.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Status Normalization for matching
    const normalizedStatus = vehicle.status === 'On_Trip' 
      ? 'On Trip' 
      : vehicle.status === 'In_Shop' 
        ? 'In Shop' 
        : vehicle.status;

    const matchesStatus = statusFilter === '' || normalizedStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatCost = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatDistance = (val) => {
    return new Intl.NumberFormat('en-US').format(val) + ' km';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Table Filters & Toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Instant Search input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <FaSearch className="text-sm" />
          </span>
          <input
            type="text"
            placeholder="Search by reg number, model, or type..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-350 rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <FaFilter className="text-xs" />
            </span>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="pl-9 pr-8 py-2 bg-white border border-slate-350 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-3 py-2 rounded-lg border border-slate-300 select-none">
            Found: <span className="text-indigo-650 font-bold">{filteredVehicles.length}</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-500">Querying Fleet Registry...</p>
          </div>
        ) : paginatedVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="bg-slate-100 p-4 rounded-full text-slate-405 border border-slate-200 mb-4">
              <FaTruck className="text-3xl" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No Vehicles Registered</h4>
            <p className="text-sm text-slate-450 mt-1 max-w-sm">
              {searchTerm || statusFilter 
                ? 'No fleet assets match your active search terms or status filters. Try resetting them.'
                : 'Get started by creating your first vehicle record using the registration form.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-80 text-slate-600 border-b border-slate-200 text-xs font-bold uppercase tracking-wider select-none">
                <th className="px-6 py-4">Reg Number</th>
                <th className="px-6 py-4">Vehicle Model</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Max Load</th>
                <th className="px-6 py-4 text-right">Odometer</th>
                <th className="px-6 py-4 text-right">Cost</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {paginatedVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {vehicle.registrationNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{vehicle.vehicleName}</td>
                  <td className="px-6 py-4 text-slate-500 font-normal">{vehicle.vehicleType}</td>
                  <td className="px-6 py-4 text-right text-slate-650 table-cell">
                    {vehicle.maximumLoadCapacity} Tons
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-slate-650">
                    {formatDistance(vehicle.odometer)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-800">
                    {formatCost(vehicle.acquisitionCost)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={vehicle.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2.5">
                      <button
                        onClick={() => onEdit(vehicle)}
                        title="Edit Vehicle"
                        className="p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      >
                        <FaEdit className="text-base" />
                      </button>
                      <button
                        onClick={() => onDelete(vehicle)}
                        title="Delete Vehicle"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      >
                        <FaTrash className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {filteredVehicles.length > 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500 select-none">
          <div>
            Showing <span className="text-slate-805 font-bold">{startIndex + 1}</span> to{' '}
            <span className="text-slate-805 font-bold">
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredVehicles.length)}
            </span>{' '}
            of <span className="text-slate-805 font-bold">{filteredVehicles.length}</span> fleet assets
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Prev
            </button>
            
            <div className="px-3 text-slate-700">
              Page <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
              <span className="font-bold text-slate-900">{totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTable;

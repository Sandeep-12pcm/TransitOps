import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaTruck, FaMapMarkedAlt, FaWrench, FaBan, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import VehicleTable from '../components/VehicleTable';
import VehicleForm from '../components/VehicleForm';
import vehicleApi from '../services/vehicleApi';

const VehicleRegistry = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom Delete confirmation states
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Fetch all vehicles
  const fetchFleet = async () => {
    setIsLoading(true);
    try {
      const response = await vehicleApi.getVehicles();
      if (response && response.success) {
        setVehicles(response.data || []);
      } else {
        toast.error('Failed to load fleet registry records.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error occurred while loading fleet records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  // Form submission handler (Create or Update)
  const handleFormSubmit = async (formData) => {
    setIsSaving(true);
    try {
      if (editingVehicle) {
        // Edit mode
        const res = await vehicleApi.updateVehicle(editingVehicle.id, formData);
        if (res && res.success) {
          toast.success(res.message || 'Vehicle details updated successfully!');
          fetchFleet();
          closeFormModal();
        }
      } else {
        // Create mode
        const res = await vehicleApi.createVehicle(formData);
        if (res && res.success) {
          toast.success(res.message || 'New vehicle registered successfully!');
          fetchFleet();
          closeFormModal();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save vehicle. Verify inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deletingVehicle) return;
    try {
      const res = await vehicleApi.deleteVehicle(deletingVehicle.id);
      if (res && res.success) {
        toast.success(res.message || `Vehicle ${deletingVehicle.registrationNumber} deleted successfully.`);
        fetchFleet();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete vehicle record.');
    } finally {
      setIsConfirmingDelete(false);
      setDeletingVehicle(null);
    }
  };

  // Helper opens
  const openAddModal = () => {
    setEditingVehicle(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingVehicle(null);
  };

  const triggerDeleteConfirm = (vehicle) => {
    setDeletingVehicle(vehicle);
    setIsConfirmingDelete(true);
  };

  // KPI Calculations
  const totalFleet = vehicles.length;
  const countAvailable = vehicles.filter(v => v.status === 'Available').length;
  const countOnTrip = vehicles.filter(v => ['On Trip', 'On_Trip'].includes(v.status)).length;
  const countInShop = vehicles.filter(v => ['In Shop', 'In_Shop'].includes(v.status)).length;
  const countRetired = vehicles.filter(v => v.status === 'Retired').length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Navbar overlay */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar overlay */}
        <Sidebar activeTab="vehicles" />

        {/* Dashboard Main Container */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Vehicle Registry</h2>
              <p className="text-sm text-slate-500 font-medium">Manage, monitor, and configure fleet vehicles across active logs.</p>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer"
            >
              <FaPlus className="mr-2 text-xs" />
              Register Vehicle
            </button>
          </div>

          {/* Fleet KPI Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* KPI 1 */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-205 shadow-sm flex items-center space-x-3.5">
              <div className="bg-slate-105 p-3 rounded-lg text-slate-700">
                <FaTruck className="text-xl" />
              </div>
              <div>
                <span className="text-[11px] block font-bold text-slate-400 uppercase tracking-widest leading-normal">Total Fleet</span>
                <span className="text-xl font-black text-slate-800 leading-none">{totalFleet}</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-205 shadow-sm flex items-center space-x-3.5">
              <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
                <FaTruck className="text-xl animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] block font-bold text-slate-400 uppercase tracking-widest leading-normal">Available</span>
                <span className="text-xl font-black text-emerald-600 leading-none">{countAvailable}</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-205 shadow-sm flex items-center space-x-3.5">
              <div className="bg-sky-50 p-3 rounded-lg text-sky-600">
                <FaMapMarkedAlt className="text-xl" />
              </div>
              <div>
                <span className="text-[11px] block font-bold text-slate-400 uppercase tracking-widest leading-normal">On Trip</span>
                <span className="text-xl font-black text-sky-600 leading-none">{countOnTrip}</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-205 shadow-sm flex items-center space-x-3.5">
              <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
                <FaWrench className="text-xl" />
              </div>
              <div>
                <span className="text-[11px] block font-bold text-slate-400 uppercase tracking-widest leading-normal">In Shop</span>
                <span className="text-xl font-black text-amber-650 leading-none">{countInShop}</span>
              </div>
            </div>

            {/* KPI 5 */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-205 shadow-sm flex items-center space-x-3.5">
              <div className="bg-rose-50 p-3 rounded-lg text-rose-600">
                <FaBan className="text-xl" />
              </div>
              <div>
                <span className="text-[11px] block font-bold text-slate-400 uppercase tracking-widest leading-normal">Retired</span>
                <span className="text-xl font-black text-rose-600 leading-none">{countRetired}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Table Container */}
          <div className="flex-1 min-h-[400px]">
            <VehicleTable 
              vehicles={vehicles} 
              onEdit={openEditModal} 
              onDelete={triggerDeleteConfirm}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>

      {/* MODAL CONFIG FOR VEHICLE FORM (CREATE & EDIT) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden transform scale-100 transition-all duration-200">
            {/* Close cross */}
            <button 
              onClick={closeFormModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <FaTimes className="text-base" />
            </button>

            {/* Inner Form content */}
            <VehicleForm 
              onSubmit={handleFormSubmit}
              initialData={editingVehicle}
              onCancel={closeFormModal}
              isSaving={isSaving}
            />
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isConfirmingDelete && deletingVehicle && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-100 p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600 select-none">
              <div className="bg-rose-100 p-2.5 rounded-full">
                <FaExclamationTriangle className="text-xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">De-register Vehicle Asset?</h3>
            </div>
            
            <p className="text-sm text-slate-500 font-medium">
              Are you sure you want to permanently delete the vehicle registry record for{' '}
              <strong className="text-slate-800 font-bold">{deletingVehicle.vehicleName}</strong>{' '}
              (<span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">{deletingVehicle.registrationNumber}</span>)?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsConfirmingDelete(false);
                  setDeletingVehicle(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                No, Keep it
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-650 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRegistry;

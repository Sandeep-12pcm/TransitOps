import React, { useState, useEffect } from 'react';

const INITIAL_STATE = {
  registrationNumber: '',
  vehicleName: '',
  vehicleType: '',
  maximumLoadCapacity: '',
  odometer: '',
  acquisitionCost: '',
  status: 'Available'
};

const VEHICLE_TYPES = [
  'Heavy Duty Dump Truck',
  'Semi-Trailer Truck',
  'Flatbed Carrier',
  'Light Delivery Van',
  'Refrigerator Box Truck',
  'Dry Van Trailer',
  'Pickup Custom Van'
];

const VehicleForm = ({ onSubmit, initialData = null, onCancel = null, isSaving = false }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // If status is On_Trip or In_Shop (returned from backend with underscores),
      // we normalize it to 'On Trip' or 'In Shop' for the UI select value
      const statusUi = initialData.status === 'On_Trip' 
        ? 'On Trip' 
        : initialData.status === 'In_Shop' 
          ? 'In Shop' 
          : initialData.status;

      setFormData({
        registrationNumber: initialData.registrationNumber || '',
        vehicleName: initialData.vehicleName || '',
        vehicleType: initialData.vehicleType || '',
        maximumLoadCapacity: initialData.maximumLoadCapacity?.toString() || '',
        odometer: initialData.odometer?.toString() || '',
        acquisitionCost: initialData.acquisitionCost?.toString() || '',
        status: statusUi
      });
    } else {
      setFormData(INITIAL_STATE);
    }
    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.registrationNumber.trim()) {
      tempErrors.registrationNumber = 'Registration Number is required.';
    }
    if (!formData.vehicleName.trim()) {
      tempErrors.vehicleName = 'Vehicle Name is required.';
    }
    if (!formData.vehicleType.trim()) {
      tempErrors.vehicleType = 'Vehicle Type is required.';
    }
    
    const capacity = parseFloat(formData.maximumLoadCapacity);
    if (!formData.maximumLoadCapacity) {
      tempErrors.maximumLoadCapacity = 'Load Capacity is required.';
    } else if (isNaN(capacity) || capacity < 0) {
      tempErrors.maximumLoadCapacity = 'Capacity cannot be negative.';
    }

    const odo = parseFloat(formData.odometer);
    if (!formData.odometer) {
      tempErrors.odometer = 'Odometer value is required.';
    } else if (isNaN(odo) || odo < 0) {
      tempErrors.odometer = 'Odometer value cannot be negative.';
    }

    const cost = parseFloat(formData.acquisitionCost);
    if (!formData.acquisitionCost) {
      tempErrors.acquisitionCost = 'Acquisition Cost is required.';
    } else if (isNaN(cost) || cost < 0) {
      tempErrors.acquisitionCost = 'Acquisition Cost cannot be negative.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData(INITIAL_STATE);
    setErrors({});
  };

  const isEditMode = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
        {isEditMode ? 'Modify Vehicle Details' : 'Register New Fleet Asset'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Registration Number */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            placeholder="e.g. MH-12-AB-5678"
            disabled={isEditMode} // Usually registration unique number is immutable or editable
            className={`w-full px-3.5 py-2 border rounded-lg text-sm text-slate-800 outline-none transition-all ${
              isEditMode ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed' : ''
            } ${errors.registrationNumber ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-450' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
          />
          {errors.registrationNumber && (
            <p className="mt-1 text-xs text-red-550 font-medium">{errors.registrationNumber}</p>
          )}
        </div>

        {/* Vehicle Name */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Vehicle Name / Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="vehicleName"
            value={formData.vehicleName}
            onChange={handleChange}
            placeholder="e.g. BharatBenz 2823R"
            className={`w-full px-3.5 py-2 border rounded-lg text-sm text-slate-800 outline-none transition-all ${
              errors.vehicleName ? 'border-red-400 focus:border-red-400 focus:ring-1' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
          />
          {errors.vehicleName && (
            <p className="mt-1 text-xs text-red-550 font-medium">{errors.vehicleName}</p>
          )}
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Vehicle Type <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="vehicleType"
              list="types-list"
              value={formData.vehicleType}
              onChange={handleChange}
              placeholder="Select or enter vehicle type"
              className={`w-full px-3.5 py-2 border rounded-lg text-sm text-slate-800 outline-none transition-all ${
                errors.vehicleType ? 'border-red-400 focus:border-red-400 focus:ring-1' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
            />
            <datalist id="types-list">
              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </div>
          {errors.vehicleType && (
            <p className="mt-1 text-xs text-red-550 font-medium">{errors.vehicleType}</p>
          )}
        </div>

        {/* Max Load Capacity */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Max Load Capacity (Tons) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            name="maximumLoadCapacity"
            value={formData.maximumLoadCapacity}
            onChange={handleChange}
            placeholder="e.g. 15.5"
            className={`w-full px-3.5 py-2 border rounded-lg text-sm text-slate-800 outline-none transition-all ${
              errors.maximumLoadCapacity ? 'border-red-400 focus:border-red-400 focus:ring-1' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
          />
          {errors.maximumLoadCapacity && (
            <p className="mt-1 text-xs text-red-550 font-medium">{errors.maximumLoadCapacity}</p>
          )}
        </div>

        {/* Odometer */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Odometer (km) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            name="odometer"
            value={formData.odometer}
            onChange={handleChange}
            placeholder="e.g. 12450.5"
            className={`w-full px-3.5 py-2 border rounded-lg text-sm text-slate-800 outline-none transition-all ${
              errors.odometer ? 'border-red-400 focus:border-red-400 focus:ring-1' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
          />
          {errors.odometer && (
            <p className="mt-1 text-xs text-red-550 font-medium">{errors.odometer}</p>
          )}
        </div>

        {/* Acquisition Cost */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Acquisition Cost ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            name="acquisitionCost"
            value={formData.acquisitionCost}
            onChange={handleChange}
            placeholder="e.g. 45000"
            className={`w-full px-3.5 py-2 border rounded-lg text-sm text-slate-800 outline-none transition-all ${
              errors.acquisitionCost ? 'border-red-400 focus:border-red-400 focus:ring-1' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
          />
          {errors.acquisitionCost && (
            <p className="mt-1 text-xs text-red-550 font-medium">{errors.acquisitionCost}</p>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Vehicle Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
        {isEditMode ? (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-md disabled:bg-indigo-400 transition-colors"
            >
              {isSaving ? 'Updating...' : 'Update Vehicle'}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-550 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-md disabled:bg-indigo-400 transition-colors"
            >
              {isSaving ? 'Registering...' : 'Add Vehicle'}
            </button>
          </>
        )}
      </div>
    </form>
  );
};

export default VehicleForm;

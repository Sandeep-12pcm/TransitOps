import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/vehicles';

const vehicleApi = {
  getVehicles: async (filters = {}) => {
    const response = await axios.get(API_BASE_URL, { params: filters });
    return response.data;
  },

  getVehicleById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  createVehicle: async (vehicleData) => {
    const response = await axios.post(API_BASE_URL, vehicleData);
    return response.data;
  },

  updateVehicle: async (id, vehicleData) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  }
};

export default vehicleApi;

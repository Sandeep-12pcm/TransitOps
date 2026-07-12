// ============================================================
// api.js – Unified API client wrapper with JWT authentication
// ============================================================

const TOKEN_KEY = 'transitops_jwt';
const USER_KEY = 'transitops_user';

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.message || parsed.error || errorMessage;
    } catch (_) {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export const api = {
  // Auth Helpers
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(t) {
    localStorage.setItem(TOKEN_KEY, t);
  },
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },
  setUser(u) {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  },

  // Auth API Endpoints
  async login(email, password) {
    const data = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  },

  async register(name, email, password, role) {
    const data = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  },

  // Vehicles CRUD
  async getVehicles() {
    return fetchWithAuth('/api/vehicles');
  },
  async createVehicle(data) {
    return fetchWithAuth('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateVehicle(id, data) {
    return fetchWithAuth(`/api/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async deleteVehicle(id) {
    return fetchWithAuth(`/api/vehicles/${id}`, { method: 'DELETE' });
  },

  // Drivers CRUD
  async getDrivers() {
    return fetchWithAuth('/api/drivers');
  },
  async createDriver(data) {
    return fetchWithAuth('/api/drivers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateDriver(id, data) {
    return fetchWithAuth(`/api/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async deleteDriver(id) {
    return fetchWithAuth(`/api/drivers/${id}`, { method: 'DELETE' });
  },

  // Trips CRUD & Transitions
  async getTrips() {
    return fetchWithAuth('/api/trips');
  },
  async createTrip(data) {
    return fetchWithAuth('/api/trips', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateTrip(id, data) {
    return fetchWithAuth(`/api/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async deleteTrip(id) {
    return fetchWithAuth(`/api/trips/${id}`, { method: 'DELETE' });
  },
  async dispatchTrip(id) {
    return fetchWithAuth(`/api/trips/${id}/dispatch`, { method: 'POST' });
  },
  async completeTrip(id, cmpData) {
    return fetchWithAuth(`/api/trips/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(cmpData)
    });
  },
  async cancelTrip(id) {
    return fetchWithAuth(`/api/trips/${id}/cancel`, { method: 'POST' });
  },

  // Maintenance CRUD & Transitions
  async getMaintenance() {
    return fetchWithAuth('/api/maintenance');
  },
  async createMaintenance(data) {
    return fetchWithAuth('/api/maintenance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateMaintenance(id, data) {
    return fetchWithAuth(`/api/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async closeMaintenance(id) {
    return fetchWithAuth(`/api/maintenance/${id}/close`, { method: 'POST' });
  },
  async deleteMaintenance(id) {
    return fetchWithAuth(`/api/maintenance/${id}`, { method: 'DELETE' });
  },

  // Fuel Logs CRUD
  async getFuelLogs() {
    return fetchWithAuth('/api/fuel-logs');
  },
  async createFuelLog(data) {
    return fetchWithAuth('/api/fuel-logs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async deleteFuelLog(id) {
    return fetchWithAuth(`/api/fuel-logs/${id}`, { method: 'DELETE' });
  },

  // Expenses CRUD
  async getExpenses() {
    return fetchWithAuth('/api/expenses');
  },
  async createExpense(data) {
    return fetchWithAuth('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async deleteExpense(id) {
    return fetchWithAuth(`/api/expenses/${id}`, { method: 'DELETE' });
  }
};

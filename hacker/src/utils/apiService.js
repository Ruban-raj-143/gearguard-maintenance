// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Equipment API methods
  async getEquipment() {
    return this.request('/equipment');
  }

  async getEquipmentById(id) {
    return this.request(`/equipment/${id}`);
  }

  async createEquipment(equipment) {
    return this.request('/equipment', {
      method: 'POST',
      body: equipment,
    });
  }

  async updateEquipment(id, updates) {
    return this.request(`/equipment/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async getEquipmentRequests(id) {
    return this.request(`/equipment/${id}/requests`);
  }

  // Technicians API methods
  async getTechnicians() {
    return this.request('/technicians');
  }

  async getTechnicianById(id) {
    return this.request(`/technicians/${id}`);
  }

  async getTechniciansByTeam(teamId) {
    return this.request(`/technicians/team/${teamId}`);
  }

  async createTechnician(technician) {
    return this.request('/technicians', {
      method: 'POST',
      body: technician,
    });
  }

  async updateTechnician(id, updates) {
    return this.request(`/technicians/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async getTechnicianRequests(id) {
    return this.request(`/technicians/${id}/requests`);
  }

  // Maintenance Requests API methods
  async getRequests() {
    return this.request('/requests');
  }

  async getRequestById(id) {
    return this.request(`/requests/${id}`);
  }

  async createRequest(request) {
    return this.request('/requests', {
      method: 'POST',
      body: request,
    });
  }

  async updateRequest(id, updates) {
    return this.request(`/requests/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteRequest(id) {
    return this.request(`/requests/${id}`, {
      method: 'DELETE',
    });
  }

  // Teams API methods
  async getTeams() {
    return this.request('/teams');
  }

  async getTeamById(id) {
    return this.request(`/teams/${id}`);
  }

  async createTeam(team) {
    return this.request('/teams', {
      method: 'POST',
      body: team,
    });
  }

  async updateTeam(id, updates) {
    return this.request(`/teams/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async getTeamWorkload(id) {
    return this.request(`/teams/${id}/workload`);
  }

  // Analytics API methods
  async getDashboardAnalytics() {
    return this.request('/analytics/dashboard');
  }

  async getEquipmentHealthTrends() {
    return this.request('/analytics/equipment-health');
  }

  async getTechnicianPerformance() {
    return this.request('/analytics/technician-performance');
  }

  async getCostAnalysis() {
    return this.request('/analytics/cost-analysis');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
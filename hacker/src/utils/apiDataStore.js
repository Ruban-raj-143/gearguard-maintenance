import { apiService } from './apiService.js';
import { dataStore as fallbackStore } from './dataStore.js';

// API-based data store with localStorage fallback
class ApiDataStore {
  constructor() {
    this.isOnline = true;
    this.cache = {
      equipment: [],
      teams: [],
      technicians: [],
      requests: []
    };
    this.lastSync = null;
    
    // Check backend connectivity on initialization
    this.checkConnectivity();
  }

  async checkConnectivity() {
    try {
      await apiService.healthCheck();
      this.isOnline = true;
      console.log('🌐 Backend API connected successfully');
    } catch (error) {
      this.isOnline = false;
      console.warn('⚠️ Backend API not available, using localStorage fallback');
    }
  }

  // Equipment methods
  async getEquipment() {
    if (this.isOnline) {
      try {
        const equipment = await apiService.getEquipment();
        this.cache.equipment = equipment;
        return equipment;
      } catch (error) {
        console.warn('API call failed, using fallback:', error);
        this.isOnline = false;
      }
    }
    return fallbackStore.getEquipment();
  }

  async addEquipment(equipment) {
    if (this.isOnline) {
      try {
        const newEquipment = await apiService.createEquipment({
          name: equipment.name,
          serial_number: equipment.serialNumber,
          purchase_date: equipment.purchaseDate,
          warranty_expiry: equipment.warrantyExpiry,
          location: equipment.location,
          department: equipment.department,
          assigned_team_id: equipment.assignedTeamId
        });
        
        // Update cache
        this.cache.equipment.push(newEquipment);
        return newEquipment;
      } catch (error) {
        console.warn('API call failed, using fallback:', error);
        this.isOnline = false;
      }
    }
    return fallbackStore.addEquipment(equipment);
  }

  async updateEquipment(id, updates) {
    if (this.isOnline) {
      try {
        // Convert frontend field names to backend field names
        const backendUpdates = {};
        if (updates.healthScore !== undefined) backendUpdates.health_score = updates.healthScore;
        if (updates.isUsable !== undefined) backendUpdates.is_usable = updates.isUsable ? 1 : 0;
        if (updates.name !== undefined) backendUpdates.name = updates.name;
        if (updates.serialNumber !== undefined) backendUpdates.serial_number = updates.serialNumber;
        if (updates.location !== undefined) backendUpdates.location = updates.location;
        if (updates.department !== undefined) backendUpdates.department = updates.department;
        if (updates.assignedTeamId !== undefined) backendUpdates.assigned_team_id = updates.assignedTeamId;

        const updatedEquipment = await apiService.updateEquipment(id, backendUpdates);
        
        // Update cache
        const index = this.cache.equipment.findIndex(eq => eq.id === id);
        if (index !== -1) {
          this.cache.equipment[index] = updatedEquipment;
        }
        
        return updatedEquipment;
      } catch (error) {
        console.warn('API call failed, using fallback:', error);
        this.isOnline = false;
      }
    }
    return fallbackStore.updateEquipment(id, updates);
  }

  // Teams methods
  async getTeams() {
    if (this.isOnline) {
      try {
        const teams = await apiService.getTeams();
        this.cache.teams = teams;
        return teams;
      } catch (error) {
        console.warn('API call failed, using fallback:', error);
        this.isOnline = false;
      }
    }
    return fallbackStore.getTeams();
  }

  // Technicians methods
  async getTechnicians() {
    if (this.isOnline) {
      try {
        const technicians = await apiService.getTechnicians();
        this.cache.technicians = technicians;
        return technicians;
      } catch (error) {
        console.warn('API call failed, using fallback:', error);
        this.isOnline = false;
      }
    }
    return fallbackStore.getTechnicians();
  }

  async getTechniciansByTeam(teamId) {
    if (this.isOnline) {
      try {
        return await apiService.getTechniciansByTeam(teamId);
      } catch (error) {
        console.warn('API call failed, using fallback:', error);
        this.isOnline = false;
      }
    }
    return fallbackStore.getTechniciansByTeam(teamId);
  }

  // Requests methods
  async getRequests() {
    if (this.isOnline) {
      try {
        const requests = await apiService.getRequests();
        this.cache.requests = requests;
        return requests;
      } catch (error) {
        console.warn('API call failed, using fallback:', error);
        this.isOnline = false;
      }
    }
    return fallbackStore.getRequests();
  }

  async addRequest(request) {
    if (this.isOnline) {
      try {
        const newRequest = await apiService.createRequest({
          subject: request.subject,
          equipment_id: request.equipmentId,
          type: request.type,
          scheduled_date: request.scheduledDate,
          duration: request.duration,
          assigned_technician_id: request.assignedTechnicianId,
          priority: request.priority,
          notes: request.notes || ''
        });
        
        // Update cache
        this.cache.requests.push(newRequest);
        return newRequest;
      } catch (error) {
        console.warn('API call failed, using fallback:', error);
        this.isOnline = false;
      }
    }
    return fallbackStore.addRequest(request);
  }

  async updateRequest(id, updates) {
    if (this.isOnline) {
      try {
        // Convert frontend field names to backend field names
        const backendUpdates = {};
        if (updates.status !== undefined) backendUpdates.status = updates.status;
        if (updates.assignedTechnicianId !== undefined) backendUpdates.assigned_technician_id = updates.assignedTechnicianId;
        if (updates.priority !== undefined) backendUpdates.priority = updates.priority;
        if (updates.scheduledDate !== undefined) backendUpdates.scheduled_date = updates.scheduledDate;
        if (updates.duration !== undefined) backendUpdates.duration = updates.duration;
        if (updates.notes !== undefined) backendUpdates.notes = updates.notes;

        const updatedRequest = await apiService.updateRequest(id, backendUpdates);
        
        // Update cache
        const index = this.cache.requests.findIndex(req => req.id === id);
        if (index !== -1) {
          this.cache.requests[index] = updatedRequest;
        }
        
        return updatedRequest;
      } catch (error) {
        console.warn('API call failed, using fallback:', error);
        this.isOnline = false;
      }
    }
    return fallbackStore.updateRequest(id, updates);
  }

  // Smart automation methods (fallback to localStorage logic)
  getMaintenanceTeamForEquipment(equipmentId) {
    const equipment = this.cache.equipment.find(eq => eq.id === equipmentId) ||
                     fallbackStore.getEquipment().find(eq => eq.id === equipmentId);
    return equipment ? equipment.assigned_team_id || equipment.assignedTeamId : null;
  }

  suggestTechnician(teamId) {
    const teamTechnicians = this.cache.technicians.filter(tech => tech.team_id === teamId || tech.teamId === teamId) ||
                           fallbackStore.getTechniciansByTeam(teamId);
    if (teamTechnicians.length === 0) return null;
    
    // Find technician with least active requests
    return teamTechnicians.reduce((min, tech) => 
      (tech.active_requests || tech.activeRequests || 0) < (min.active_requests || min.activeRequests || 0) ? tech : min
    );
  }

  calculatePriority(equipmentId, requestType) {
    const equipment = this.cache.equipment.find(eq => eq.id === equipmentId) ||
                     fallbackStore.getEquipment().find(eq => eq.id === equipmentId);
    if (!equipment) return 'Low';

    const healthScore = equipment.health_score || equipment.healthScore || 100;
    const warrantyExpiry = equipment.warranty_expiry || equipment.warrantyExpiry;
    const isWarrantyExpired = new Date(warrantyExpiry) < new Date();
    
    if (healthScore < 40 || isWarrantyExpired) {
      return 'High';
    } else if (requestType === 'Corrective') {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  async getEquipmentBreakdownWarnings() {
    if (this.isOnline) {
      try {
        const analytics = await apiService.getDashboardAnalytics();
        return analytics.breakdownWarnings || [];
      } catch (error) {
        console.warn('API call failed, using fallback:', error);
        this.isOnline = false;
      }
    }
    return fallbackStore.getEquipmentBreakdownWarnings();
  }

  // Analytics methods
  async getDashboardAnalytics() {
    if (this.isOnline) {
      try {
        return await apiService.getDashboardAnalytics();
      } catch (error) {
        console.warn('API call failed for analytics:', error);
        this.isOnline = false;
      }
    }
    
    // Fallback: generate basic analytics from cached/localStorage data
    const equipment = this.cache.equipment.length > 0 ? this.cache.equipment : fallbackStore.getEquipment();
    const requests = this.cache.requests.length > 0 ? this.cache.requests : fallbackStore.getRequests();
    
    return {
      equipment: {
        total_equipment: equipment.length,
        healthy_equipment: equipment.filter(eq => (eq.health_score || eq.healthScore) >= 80).length,
        warning_equipment: equipment.filter(eq => {
          const health = eq.health_score || eq.healthScore;
          return health >= 40 && health < 80;
        }).length,
        critical_equipment: equipment.filter(eq => (eq.health_score || eq.healthScore) < 40).length,
        avg_health_score: equipment.reduce((sum, eq) => sum + (eq.health_score || eq.healthScore), 0) / equipment.length
      },
      requests: {
        total_requests: requests.length,
        new_requests: requests.filter(req => req.status === 'New').length,
        in_progress_requests: requests.filter(req => req.status === 'In Progress').length,
        completed_requests: requests.filter(req => req.status === 'Repaired').length
      }
    };
  }

  // Connection status
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      cacheSize: {
        equipment: this.cache.equipment.length,
        teams: this.cache.teams.length,
        technicians: this.cache.technicians.length,
        requests: this.cache.requests.length
      }
    };
  }

  // Force reconnection attempt
  async reconnect() {
    await this.checkConnectivity();
    if (this.isOnline) {
      // Refresh cache
      await Promise.all([
        this.getEquipment(),
        this.getTeams(),
        this.getTechnicians(),
        this.getRequests()
      ]);
      this.lastSync = new Date().toISOString();
    }
    return this.isOnline;
  }
}

export const apiDataStore = new ApiDataStore();
export default apiDataStore;
import { initializeDemoData } from './demoData.js';

// Simple in-memory data store with localStorage persistence
class DataStore {
  constructor() {
    this.data = {
      equipment: [],
      teams: [],
      technicians: [],
      requests: []
    };
    this.loadFromStorage();
    this.initializeDefaultData();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('gearguard-data');
      if (stored) {
        this.data = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('gearguard-data', JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  initializeDefaultData() {
    if (this.data.teams.length === 0) {
      // Initialize with demo data for better showcase
      this.data = initializeDemoData();
    }
    this.saveToStorage();
  }

  // Equipment methods
  getEquipment() {
    return this.data.equipment;
  }

  addEquipment(equipment) {
    const newEquipment = {
      ...equipment,
      id: Date.now(),
      healthScore: 100,
      isUsable: true
    };
    this.data.equipment.push(newEquipment);
    this.saveToStorage();
    return newEquipment;
  }

  updateEquipment(id, updates) {
    const index = this.data.equipment.findIndex(eq => eq.id === id);
    if (index !== -1) {
      this.data.equipment[index] = { ...this.data.equipment[index], ...updates };
      this.saveToStorage();
      return this.data.equipment[index];
    }
    return null;
  }

  // Teams methods
  getTeams() {
    return this.data.teams;
  }

  // Technicians methods
  getTechnicians() {
    return this.data.technicians;
  }

  getTechniciansByTeam(teamId) {
    return this.data.technicians.filter(tech => tech.teamId === teamId);
  }

  // Requests methods
  getRequests() {
    return this.data.requests;
  }

  addRequest(request) {
    const newRequest = {
      ...request,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'New'
    };
    this.data.requests.push(newRequest);
    
    // Update technician active requests count
    if (request.assignedTechnicianId) {
      this.updateTechnicianActiveRequests(request.assignedTechnicianId, 1);
    }
    
    this.saveToStorage();
    return newRequest;
  }

  updateRequest(id, updates) {
    const index = this.data.requests.findIndex(req => req.id === id);
    if (index !== -1) {
      const oldRequest = this.data.requests[index];
      this.data.requests[index] = { ...oldRequest, ...updates };
      
      // Handle status changes and health score updates
      if (updates.status && updates.status !== oldRequest.status) {
        this.handleRequestStatusChange(this.data.requests[index], oldRequest.status);
      }
      
      this.saveToStorage();
      return this.data.requests[index];
    }
    return null;
  }

  handleRequestStatusChange(request, oldStatus) {
    const equipment = this.data.equipment.find(eq => eq.id === request.equipmentId);
    if (!equipment) return;

    // Update technician active requests count
    if (oldStatus === 'New' || oldStatus === 'In Progress') {
      if (request.status === 'Repaired' || request.status === 'Scrap') {
        this.updateTechnicianActiveRequests(request.assignedTechnicianId, -1);
      }
    }

    // Update equipment health score based on request completion
    if (request.status === 'Repaired') {
      if (request.type === 'Preventive') {
        equipment.healthScore = Math.min(100, equipment.healthScore + 5);
      }
    } else if (request.status === 'Scrap') {
      equipment.healthScore = 0;
      equipment.isUsable = false;
    }

    // Reduce health score for corrective requests when created
    if (request.type === 'Corrective' && oldStatus === 'New') {
      equipment.healthScore = Math.max(0, equipment.healthScore - 10);
    }
  }

  updateTechnicianActiveRequests(technicianId, change) {
    const technician = this.data.technicians.find(tech => tech.id === technicianId);
    if (technician) {
      technician.activeRequests = Math.max(0, technician.activeRequests + change);
    }
  }

  // Smart automation methods
  getMaintenanceTeamForEquipment(equipmentId) {
    const equipment = this.data.equipment.find(eq => eq.id === equipmentId);
    return equipment ? equipment.assignedTeamId : null;
  }

  suggestTechnician(teamId) {
    const teamTechnicians = this.getTechniciansByTeam(teamId);
    if (teamTechnicians.length === 0) return null;
    
    // Find technician with least active requests
    return teamTechnicians.reduce((min, tech) => 
      tech.activeRequests < min.activeRequests ? tech : min
    );
  }

  calculatePriority(equipmentId, requestType) {
    const equipment = this.data.equipment.find(eq => eq.id === equipmentId);
    if (!equipment) return 'Low';

    const isWarrantyExpired = new Date(equipment.warrantyExpiry) < new Date();
    
    if (equipment.healthScore < 40 || isWarrantyExpired) {
      return 'High';
    } else if (requestType === 'Corrective') {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  getEquipmentBreakdownWarnings() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const warnings = [];
    
    this.data.equipment.forEach(equipment => {
      const recentBreakdowns = this.data.requests.filter(request => 
        request.equipmentId === equipment.id &&
        request.type === 'Corrective' &&
        new Date(request.createdAt) > thirtyDaysAgo
      );

      if (recentBreakdowns.length >= 3) {
        warnings.push({
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          breakdownCount: recentBreakdowns.length,
          message: `${equipment.name} has ${recentBreakdowns.length} breakdowns in the last 30 days. Consider scrapping.`
        });
      }
    });

    return warnings;
  }
}

export const dataStore = new DataStore();
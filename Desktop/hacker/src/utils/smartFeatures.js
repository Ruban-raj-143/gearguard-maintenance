import { dataStore } from './dataStore.js';
import { differenceInDays, subDays, addDays } from 'date-fns';

// Smart Failure Prediction Engine
export class FailurePredictionEngine {
  static calculateRiskLevel(equipmentId) {
    const equipment = dataStore.getEquipment().find(eq => eq.id === equipmentId);
    const requests = dataStore.getRequests();
    
    if (!equipment) return { level: 'Low', confidence: 0, reasons: [] };

    const reasons = [];
    let riskScore = 0;

    // Factor 1: Current health score
    if (equipment.healthScore < 40) {
      riskScore += 40;
      reasons.push('Critical health score below 40%');
    } else if (equipment.healthScore < 60) {
      riskScore += 20;
      reasons.push('Health score declining');
    }

    // Factor 2: Recent breakdown frequency
    const last60Days = subDays(new Date(), 60);
    const recentBreakdowns = requests.filter(req => 
      req.equipmentId === equipmentId &&
      req.type === 'Corrective' &&
      new Date(req.createdAt) > last60Days
    );

    if (recentBreakdowns.length >= 3) {
      riskScore += 35;
      reasons.push(`${recentBreakdowns.length} breakdowns in last 60 days`);
    } else if (recentBreakdowns.length >= 2) {
      riskScore += 20;
      reasons.push(`${recentBreakdowns.length} breakdowns in last 60 days`);
    }

    // Factor 3: Health score decline rate
    const healthHistory = this.getHealthScoreHistory(equipmentId);
    const declineRate = this.calculateHealthDeclineRate(healthHistory);
    
    if (declineRate > 20) {
      riskScore += 25;
      reasons.push('Rapid health decline detected');
    } else if (declineRate > 10) {
      riskScore += 15;
      reasons.push('Moderate health decline');
    }

    // Factor 4: Warranty status
    const isWarrantyExpired = new Date(equipment.warrantyExpiry) < new Date();
    if (isWarrantyExpired) {
      riskScore += 10;
      reasons.push('Warranty expired - higher failure risk');
    }

    // Factor 5: Time since last preventive maintenance
    const lastPreventive = requests
      .filter(req => req.equipmentId === equipmentId && req.type === 'Preventive' && req.status === 'Repaired')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (lastPreventive) {
      const daysSincePreventive = differenceInDays(new Date(), new Date(lastPreventive.createdAt));
      if (daysSincePreventive > 90) {
        riskScore += 15;
        reasons.push('No preventive maintenance in 90+ days');
      }
    } else {
      riskScore += 20;
      reasons.push('No preventive maintenance history');
    }

    // Determine risk level
    let level = 'Low';
    let confidence = Math.min(riskScore, 100);

    if (riskScore >= 70) {
      level = 'High';
    } else if (riskScore >= 40) {
      level = 'Medium';
    }

    return { level, confidence, reasons, score: riskScore };
  }

  static getHealthScoreHistory(equipmentId) {
    // In a real system, this would come from historical data
    // For demo, we'll simulate based on current health and request history
    const equipment = dataStore.getEquipment().find(eq => eq.id === equipmentId);
    const requests = dataStore.getRequests()
      .filter(req => req.equipmentId === equipmentId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let currentHealth = 100;
    const history = [{ date: equipment.purchaseDate, health: 100 }];

    requests.forEach(req => {
      if (req.type === 'Corrective') {
        currentHealth = Math.max(0, currentHealth - 10);
      } else if (req.type === 'Preventive' && req.status === 'Repaired') {
        currentHealth = Math.min(100, currentHealth + 5);
      }
      history.push({ date: req.createdAt, health: currentHealth });
    });

    return history;
  }

  static calculateHealthDeclineRate(history) {
    if (history.length < 2) return 0;
    
    const recent = history.slice(-3); // Last 3 data points
    if (recent.length < 2) return 0;

    const firstPoint = recent[0];
    const lastPoint = recent[recent.length - 1];
    
    const healthDiff = firstPoint.health - lastPoint.health;
    const daysDiff = differenceInDays(new Date(lastPoint.date), new Date(firstPoint.date));
    
    if (daysDiff === 0) return 0;
    
    // Return decline rate per month
    return (healthDiff / daysDiff) * 30;
  }

  static predictNextFailure(equipmentId) {
    const risk = this.calculateRiskLevel(equipmentId);
    const equipment = dataStore.getEquipment().find(eq => eq.id === equipmentId);
    
    if (!equipment) return null;

    let daysToFailure = 365; // Default to 1 year

    if (risk.level === 'High') {
      daysToFailure = 30; // 1 month
    } else if (risk.level === 'Medium') {
      daysToFailure = 90; // 3 months
    } else {
      daysToFailure = 180; // 6 months
    }

    const predictedDate = addDays(new Date(), daysToFailure);

    return {
      predictedDate,
      daysToFailure,
      confidence: risk.confidence,
      recommendations: this.getRecommendations(risk, equipment)
    };
  }

  static getRecommendations(risk, equipment) {
    const recommendations = [];

    if (risk.level === 'High') {
      recommendations.push('Schedule immediate inspection');
      recommendations.push('Consider replacement planning');
      recommendations.push('Increase preventive maintenance frequency');
    } else if (risk.level === 'Medium') {
      recommendations.push('Schedule preventive maintenance within 2 weeks');
      recommendations.push('Monitor closely for warning signs');
    } else {
      recommendations.push('Continue regular maintenance schedule');
      recommendations.push('Monitor health score trends');
    }

    if (equipment.healthScore < 50) {
      recommendations.push('Consider major overhaul or replacement');
    }

    return recommendations;
  }
}

// QR Code Generator (Simple implementation)
export class QRCodeGenerator {
  static generateEquipmentQR(equipmentId) {
    // In a real app, you'd use a proper QR code library
    // For demo, we'll create a simple data URL
    const qrData = {
      type: 'equipment',
      id: equipmentId,
      url: `${window.location.origin}/equipment/${equipmentId}`
    };

    return {
      data: JSON.stringify(qrData),
      url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`,
      printableUrl: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(JSON.stringify(qrData))}`
    };
  }

  static parseQRData(qrString) {
    try {
      return JSON.parse(qrString);
    } catch (error) {
      return null;
    }
  }
}

// Maintenance Cost Calculator
export class CostCalculator {
  static calculateMaintenanceCosts(equipmentId) {
    const equipment = dataStore.getEquipment().find(eq => eq.id === equipmentId);
    const requests = dataStore.getRequests().filter(req => req.equipmentId === equipmentId);
    
    if (!equipment) return null;

    // Estimated costs (in a real system, these would be actual recorded costs)
    const costPerHour = {
      'Corrective': 150, // Higher cost for emergency repairs
      'Preventive': 75   // Lower cost for planned maintenance
    };

    let totalCost = 0;
    let totalDowntime = 0;
    let correctiveCost = 0;
    let preventiveCost = 0;

    requests.forEach(req => {
      const cost = (req.duration || 2) * costPerHour[req.type];
      totalCost += cost;
      totalDowntime += req.duration || 2;

      if (req.type === 'Corrective') {
        correctiveCost += cost;
      } else {
        preventiveCost += cost;
      }
    });

    // Estimate equipment value depreciation
    const purchaseYear = new Date(equipment.purchaseDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - purchaseYear;
    
    // Assume 10% depreciation per year, minimum 20% residual value
    const depreciationRate = Math.min(age * 0.1, 0.8);
    const estimatedOriginalValue = 50000; // Default estimate
    const currentValue = estimatedOriginalValue * (1 - depreciationRate);

    // Calculate replacement threshold
    const maintenanceToValueRatio = totalCost / currentValue;
    const shouldReplace = maintenanceToValueRatio > 0.6;

    return {
      totalMaintenanceCost: totalCost,
      correctiveCost,
      preventiveCost,
      totalDowntimeHours: totalDowntime,
      estimatedCurrentValue: currentValue,
      maintenanceToValueRatio,
      shouldReplace,
      recommendation: shouldReplace 
        ? `Replacement recommended - Maintenance cost (${Math.round(maintenanceToValueRatio * 100)}%) exceeds 60% of current value`
        : 'Continue maintenance - Cost effective',
      costBreakdown: {
        emergency: correctiveCost,
        planned: preventiveCost,
        downtime: totalDowntime * 200 // Estimated downtime cost per hour
      }
    };
  }
}

// Technician Skill Matching System
export class SkillMatcher {
  static getTechnicianSkills() {
    // Enhanced technician data with skills
    return {
      1: ['hydraulics', 'mechanical', 'welding', 'fabrication'],
      2: ['mechanical', 'pneumatics', 'fabrication', 'quality_control'],
      3: ['electrical', 'plc', 'motor_repair', 'instrumentation'],
      4: ['electrical', 'instrumentation', 'calibration', 'automation'],
      5: ['networking', 'software', 'hardware', 'database'],
      6: ['software', 'database', 'security', 'cloud_systems'],
      7: ['hydraulics', 'mechanical', 'welding', 'cnc_programming'],
      8: ['electrical', 'plc', 'automation', 'robotics'],
      9: ['networking', 'software', 'hardware', 'cybersecurity'],
      10: ['mechanical', 'welding', 'fabrication', 'quality_control'],
      11: ['electrical', 'motor_repair', 'power_systems', 'renewable_energy'],
      12: ['software', 'ai_ml', 'data_analytics', 'cloud_systems'],
      13: ['mechanical', 'hydraulics', 'heavy_machinery', 'diesel_engines'],
      14: ['electrical', 'power_systems', 'transformers', 'high_voltage'],
      15: ['software', 'database', 'system_administration', 'virtualization'],
      16: ['mechanical', 'pneumatics', 'conveyor_systems', 'packaging'],
      17: ['electrical', 'hvac', 'refrigeration', 'building_automation'],
      18: ['networking', 'cybersecurity', 'firewall_management', 'penetration_testing']
    };
  }

  static getEquipmentSkillRequirements() {
    // Map equipment types to required skills
    return {
      'CNC': ['mechanical', 'electrical', 'plc', 'cnc_programming'],
      'Server': ['networking', 'software', 'hardware', 'cybersecurity'],
      'Database': ['software', 'database', 'system_administration'],
      'Hydraulic': ['hydraulics', 'mechanical', 'pressure_systems'],
      'Generator': ['electrical', 'engine', 'fuel_systems', 'power_systems'],
      'PC': ['software', 'hardware', 'networking'],
      'Workstation': ['software', 'hardware', 'networking'],
      'Conveyor': ['mechanical', 'electrical', 'automation', 'conveyor_systems'],
      'Chiller': ['refrigeration', 'electrical', 'plumbing', 'hvac'],
      'Network': ['networking', 'cybersecurity', 'hardware'],
      'Welding': ['welding', 'robotics', 'automation', 'quality_control'],
      'UPS': ['electrical', 'power_systems', 'battery_systems'],
      'Injection': ['mechanical', 'hydraulics', 'plc', 'quality_control'],
      'Molding': ['mechanical', 'hydraulics', 'plc', 'quality_control'],
      'Air': ['mechanical', 'pneumatics', 'electrical'],
      'Compressor': ['mechanical', 'pneumatics', 'electrical'],
      'Forklift': ['mechanical', 'hydraulics', 'diesel_engines', 'heavy_machinery'],
      'Transformer': ['electrical', 'power_systems', 'high_voltage', 'transformers'],
      'Firewall': ['networking', 'cybersecurity', 'firewall_management', 'penetration_testing'],
      'Packaging': ['mechanical', 'pneumatics', 'packaging', 'automation'],
      'HVAC': ['hvac', 'electrical', 'refrigeration', 'building_automation']
    };
  }

  static findBestTechnician(equipmentId, teamId) {
    const equipment = dataStore.getEquipment().find(eq => eq.id === equipmentId);
    const technicians = dataStore.getTechnicians().filter(tech => tech.teamId === teamId);
    const techSkills = this.getTechnicianSkills();
    const equipmentSkills = this.getEquipmentSkillRequirements();
    
    if (!equipment || technicians.length === 0) return null;

    // Determine required skills based on equipment name
    let requiredSkills = [];
    Object.keys(equipmentSkills).forEach(type => {
      if (equipment.name.toLowerCase().includes(type.toLowerCase())) {
        requiredSkills = equipmentSkills[type];
      }
    });

    // Score technicians based on skill match and workload
    const scoredTechnicians = technicians.map(tech => {
      const skills = techSkills[tech.id] || [];
      const skillMatch = requiredSkills.filter(skill => skills.includes(skill)).length;
      const skillScore = requiredSkills.length > 0 ? (skillMatch / requiredSkills.length) * 100 : 50;
      
      // Lower workload = higher score
      const workloadScore = Math.max(0, 100 - (tech.activeRequests * 20));
      
      // Combined score
      const totalScore = (skillScore * 0.7) + (workloadScore * 0.3);
      
      return {
        ...tech,
        skillMatch,
        skillScore,
        workloadScore,
        totalScore,
        matchedSkills: requiredSkills.filter(skill => skills.includes(skill))
      };
    });

    // Return best match
    return scoredTechnicians.sort((a, b) => b.totalScore - a.totalScore)[0];
  }
}
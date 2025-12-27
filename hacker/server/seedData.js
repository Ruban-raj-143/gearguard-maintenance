const database = require('./database/database');

// Demo data from frontend
const demoData = {
  teams: [
    { id: 1, name: 'Mechanics', specialization: 'Mechanical Equipment' },
    { id: 2, name: 'Electricians', specialization: 'Electrical Systems' },
    { id: 3, name: 'IT Support', specialization: 'Computer Equipment' }
  ],
  technicians: [
    { id: 1, name: 'Rajesh Kumar', teamId: 1, avatar: '👨‍🔧', activeRequests: 2, skills: ['hydraulics', 'engine repair', 'welding', 'pneumatics'] },
    { id: 2, name: 'Priya Sharma', teamId: 1, avatar: '👩‍🔧', activeRequests: 1, skills: ['mechanical systems', 'conveyor maintenance', 'safety protocols'] },
    { id: 3, name: 'Ahmed Hassan', teamId: 2, avatar: '👨‍💼', activeRequests: 3, skills: ['electrical systems', 'motor control', 'power distribution'] },
    { id: 4, name: 'Maria Rodriguez', teamId: 2, avatar: '👩‍💼', activeRequests: 0, skills: ['industrial automation', 'PLC programming', 'HVAC systems'] },
    { id: 5, name: 'Chen Wei', teamId: 3, avatar: '👨‍💻', activeRequests: 1, skills: ['networking', 'server maintenance', 'cybersecurity'] },
    { id: 6, name: 'Fatima Al-Zahra', teamId: 3, avatar: '👩‍💻', activeRequests: 2, skills: ['database administration', 'cloud systems', 'backup solutions'] },
    { id: 7, name: 'Arjun Patel', teamId: 1, avatar: '👨‍🔧', activeRequests: 0, skills: ['precision machining', 'quality control', 'measurement tools'] },
    { id: 8, name: 'Aisha Johnson', teamId: 2, avatar: '👩‍💼', activeRequests: 1, skills: ['electrical troubleshooting', 'circuit analysis', 'safety compliance'] },
    { id: 9, name: 'Carlos Santos', teamId: 3, avatar: '👨‍💻', activeRequests: 2, skills: ['system integration', 'software deployment', 'performance monitoring'] },
    { id: 10, name: 'Yuki Tanaka', teamId: 1, avatar: '👩‍🔧', activeRequests: 1, skills: ['robotics maintenance', 'sensor calibration', 'automation systems'] },
    { id: 11, name: 'Omar Ibrahim', teamId: 2, avatar: '👨‍💼', activeRequests: 0, skills: ['power systems', 'generator maintenance', 'electrical safety'] },
    { id: 12, name: 'Sophie Dubois', teamId: 3, avatar: '👩‍💻', activeRequests: 3, skills: ['network security', 'firewall management', 'incident response'] },
    { id: 13, name: 'Kwame Asante', teamId: 1, avatar: '👨‍🔧', activeRequests: 1, skills: ['heavy machinery', 'hydraulic systems', 'preventive maintenance'] },
    { id: 14, name: 'Elena Petrov', teamId: 2, avatar: '👩‍💼', activeRequests: 2, skills: ['industrial controls', 'motor drives', 'energy efficiency'] },
    { id: 15, name: 'Hiroshi Yamamoto', teamId: 3, avatar: '👨‍💻', activeRequests: 0, skills: ['data recovery', 'hardware diagnostics', 'system optimization'] },
    { id: 16, name: 'Amara Okafor', teamId: 1, avatar: '👩‍🔧', activeRequests: 1, skills: ['material handling', 'conveyor systems', 'logistics equipment'] },
    { id: 17, name: 'Diego Fernandez', teamId: 2, avatar: '👨‍💼', activeRequests: 2, skills: ['facility management', 'HVAC systems', 'building automation'] },
    { id: 18, name: 'Zara Al-Rashid', teamId: 3, avatar: '👩‍💻', activeRequests: 1, skills: ['cloud infrastructure', 'virtualization', 'disaster recovery'] }
  ],
  equipment: [
    {
      id: 1, name: 'CNC Machine #1', serialNumber: 'CNC-001', purchaseDate: '2022-01-15',
      warrantyExpiry: '2025-01-15', location: 'Factory Floor A', department: 'Production',
      assignedTeamId: 1, healthScore: 85, isUsable: true
    },
    {
      id: 2, name: 'Server Rack #1', serialNumber: 'SRV-001', purchaseDate: '2023-03-10',
      warrantyExpiry: '2026-03-10', location: 'Data Center', department: 'IT',
      assignedTeamId: 3, healthScore: 95, isUsable: true
    },
    {
      id: 3, name: 'Hydraulic Press #2', serialNumber: 'HYD-002', purchaseDate: '2021-06-20',
      warrantyExpiry: '2024-06-20', location: 'Factory Floor B', department: 'Production',
      assignedTeamId: 1, healthScore: 35, isUsable: true
    },
    {
      id: 4, name: 'Generator #1', serialNumber: 'GEN-001', purchaseDate: '2020-09-15',
      warrantyExpiry: '2023-09-15', location: 'Power Room', department: 'Facilities',
      assignedTeamId: 2, healthScore: 60, isUsable: true
    },
    {
      id: 5, name: 'Workstation PC #15', serialNumber: 'PC-015', purchaseDate: '2023-08-01',
      warrantyExpiry: '2026-08-01', location: 'Office Floor 2', department: 'Engineering',
      assignedTeamId: 3, healthScore: 100, isUsable: true
    },
    {
      id: 6, name: 'Conveyor Belt System #3', serialNumber: 'CVB-003', purchaseDate: '2022-11-05',
      warrantyExpiry: '2025-11-05', location: 'Assembly Line C', department: 'Production',
      assignedTeamId: 1, healthScore: 78, isUsable: true
    },
    {
      id: 7, name: 'Industrial Chiller #2', serialNumber: 'ICH-002', purchaseDate: '2021-04-12',
      warrantyExpiry: '2024-04-12', location: 'HVAC Room', department: 'Facilities',
      assignedTeamId: 2, healthScore: 42, isUsable: true
    },
    {
      id: 8, name: 'Network Switch #7', serialNumber: 'NSW-007', purchaseDate: '2023-02-28',
      warrantyExpiry: '2026-02-28', location: 'Server Room B', department: 'IT',
      assignedTeamId: 3, healthScore: 92, isUsable: true
    },
    {
      id: 9, name: 'Welding Robot #4', serialNumber: 'WRB-004', purchaseDate: '2022-07-18',
      warrantyExpiry: '2025-07-18', location: 'Welding Bay 2', department: 'Production',
      assignedTeamId: 1, healthScore: 67, isUsable: true
    },
    {
      id: 10, name: 'UPS System #1', serialNumber: 'UPS-001', purchaseDate: '2020-12-03',
      warrantyExpiry: '2023-12-03', location: 'Power Distribution', department: 'Facilities',
      assignedTeamId: 2, healthScore: 28, isUsable: true
    },
    {
      id: 11, name: 'Injection Molding Machine #5', serialNumber: 'IMM-005', purchaseDate: '2021-09-22',
      warrantyExpiry: '2024-09-22', location: 'Molding Department', department: 'Production',
      assignedTeamId: 1, healthScore: 73, isUsable: true
    },
    {
      id: 12, name: 'Air Compressor #3', serialNumber: 'ACM-003', purchaseDate: '2020-05-14',
      warrantyExpiry: '2023-05-14', location: 'Utility Room', department: 'Facilities',
      assignedTeamId: 2, healthScore: 55, isUsable: true
    },
    {
      id: 13, name: 'Database Server #2', serialNumber: 'DBS-002', purchaseDate: '2023-01-08',
      warrantyExpiry: '2026-01-08', location: 'Data Center', department: 'IT',
      assignedTeamId: 3, healthScore: 98, isUsable: true
    },
    {
      id: 14, name: 'Forklift #7', serialNumber: 'FLT-007', purchaseDate: '2022-03-25',
      warrantyExpiry: '2025-03-25', location: 'Warehouse A', department: 'Logistics',
      assignedTeamId: 1, healthScore: 82, isUsable: true
    },
    {
      id: 15, name: 'Transformer #2', serialNumber: 'TRF-002', purchaseDate: '2019-11-30',
      warrantyExpiry: '2022-11-30', location: 'Electrical Substation', department: 'Facilities',
      assignedTeamId: 2, healthScore: 45, isUsable: true
    },
    {
      id: 16, name: 'Firewall Server #1', serialNumber: 'FWS-001', purchaseDate: '2023-06-12',
      warrantyExpiry: '2026-06-12', location: 'Security Operations Center', department: 'IT',
      assignedTeamId: 3, healthScore: 100, isUsable: true
    },
    {
      id: 17, name: 'Packaging Machine #4', serialNumber: 'PKM-004', purchaseDate: '2021-12-18',
      warrantyExpiry: '2024-12-18', location: 'Packaging Line 2', department: 'Production',
      assignedTeamId: 1, healthScore: 69, isUsable: true
    },
    {
      id: 18, name: 'HVAC Unit #5', serialNumber: 'HVC-005', purchaseDate: '2020-08-07',
      warrantyExpiry: '2023-08-07', location: 'Building B - Roof', department: 'Facilities',
      assignedTeamId: 2, healthScore: 38, isUsable: true
    }
  ],
  requests: [
    {
      id: 1, subject: 'CNC Machine calibration needed', equipmentId: 1, type: 'Corrective',
      scheduledDate: '2024-12-28', duration: 3, assignedTechnicianId: 1, priority: 'Medium',
      status: 'New', createdAt: '2024-12-27T10:00:00Z'
    },
    {
      id: 2, subject: 'Monthly server maintenance', equipmentId: 2, type: 'Preventive',
      scheduledDate: '2024-12-30', duration: 2, assignedTechnicianId: 5, priority: 'Low',
      status: 'In Progress', createdAt: '2024-12-26T14:30:00Z'
    },
    {
      id: 3, subject: 'Hydraulic system leak repair', equipmentId: 3, type: 'Corrective',
      scheduledDate: '2024-12-27', duration: 4, assignedTechnicianId: 2, priority: 'High',
      status: 'In Progress', createdAt: '2024-12-25T09:15:00Z'
    }
    // ... more requests would be added here
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Wait a moment for database initialization to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Clear existing data (with error handling for missing tables)
    const tablesToClear = [
      'maintenance_costs',
      'equipment_health_history', 
      'maintenance_requests',
      'equipment',
      'technicians',
      'teams'
    ];

    for (const table of tablesToClear) {
      try {
        await database.run(`DELETE FROM ${table}`);
      } catch (error) {
        console.log(`⚠️ Table ${table} doesn't exist yet, skipping...`);
      }
    }

    // Reset auto-increment counters
    try {
      await database.run('DELETE FROM sqlite_sequence');
    } catch (error) {
      console.log('⚠️ sqlite_sequence table not found, skipping...');
    }

    // Seed teams
    console.log('📋 Seeding teams...');
    for (const team of demoData.teams) {
      await database.run(
        'INSERT INTO teams (id, name, specialization) VALUES (?, ?, ?)',
        [team.id, team.name, team.specialization]
      );
    }

    // Seed technicians
    console.log('👥 Seeding technicians...');
    for (const tech of demoData.technicians) {
      await database.run(
        'INSERT INTO technicians (id, name, team_id, avatar, skills, active_requests) VALUES (?, ?, ?, ?, ?, ?)',
        [tech.id, tech.name, tech.teamId, tech.avatar, JSON.stringify(tech.skills || []), tech.activeRequests]
      );
    }

    // Seed equipment
    console.log('🔧 Seeding equipment...');
    for (const equipment of demoData.equipment) {
      await database.run(
        `INSERT INTO equipment (
          id, name, serial_number, purchase_date, warranty_expiry, 
          location, department, assigned_team_id, health_score, is_usable
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          equipment.id, equipment.name, equipment.serialNumber, equipment.purchaseDate,
          equipment.warrantyExpiry, equipment.location, equipment.department,
          equipment.assignedTeamId, equipment.healthScore, equipment.isUsable ? 1 : 0
        ]
      );
    }

    // Seed maintenance requests (first few for demo)
    console.log('📝 Seeding maintenance requests...');
    const sampleRequests = [
      {
        id: 1, subject: 'CNC Machine calibration needed', equipment_id: 1, type: 'Corrective',
        scheduled_date: '2024-12-28', duration: 3, assigned_technician_id: 1, priority: 'Medium',
        status: 'New', notes: 'Machine showing precision issues'
      },
      {
        id: 2, subject: 'Monthly server maintenance', equipment_id: 2, type: 'Preventive',
        scheduled_date: '2024-12-30', duration: 2, assigned_technician_id: 5, priority: 'Low',
        status: 'In Progress', notes: 'Routine maintenance and updates'
      },
      {
        id: 3, subject: 'Hydraulic system leak repair', equipment_id: 3, type: 'Corrective',
        scheduled_date: '2024-12-27', duration: 4, assigned_technician_id: 2, priority: 'High',
        status: 'In Progress', notes: 'Critical hydraulic leak detected'
      },
      {
        id: 4, subject: 'Generator fuel system check', equipment_id: 4, type: 'Preventive',
        scheduled_date: '2025-01-02', duration: 1.5, assigned_technician_id: 11, priority: 'Medium',
        status: 'New', notes: 'Scheduled fuel system inspection'
      },
      {
        id: 5, subject: 'Software updates and cleanup', equipment_id: 5, type: 'Preventive',
        scheduled_date: '2025-01-05', duration: 1, assigned_technician_id: 6, priority: 'Low',
        status: 'New', notes: 'OS updates and disk cleanup'
      }
    ];

    for (const request of sampleRequests) {
      await database.run(
        `INSERT INTO maintenance_requests (
          id, subject, equipment_id, type, scheduled_date, duration,
          assigned_technician_id, priority, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          request.id, request.subject, request.equipment_id, request.type,
          request.scheduled_date, request.duration, request.assigned_technician_id,
          request.priority, request.status, request.notes
        ]
      );
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded: ${demoData.teams.length} teams, ${demoData.technicians.length} technicians, ${demoData.equipment.length} equipment, ${sampleRequests.length} requests`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
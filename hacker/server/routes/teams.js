const express = require('express');
const router = express.Router();
const database = require('../database/database');

// GET /api/teams - Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await database.query(`
      SELECT t.*, 
             COUNT(tech.id) as technician_count,
             COUNT(e.id) as equipment_count
      FROM teams t
      LEFT JOIN technicians tech ON t.id = tech.team_id
      LEFT JOIN equipment e ON t.id = e.assigned_team_id
      GROUP BY t.id, t.name, t.specialization, t.created_at, t.updated_at
      ORDER BY t.name
    `);
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// GET /api/teams/:id - Get single team with details
router.get('/:id', async (req, res) => {
  try {
    const team = await database.get(`
      SELECT t.*, 
             COUNT(tech.id) as technician_count,
             COUNT(e.id) as equipment_count
      FROM teams t
      LEFT JOIN technicians tech ON t.id = tech.team_id
      LEFT JOIN equipment e ON t.id = e.assigned_team_id
      WHERE t.id = ?
      GROUP BY t.id, t.name, t.specialization, t.created_at, t.updated_at
    `, [req.params.id]);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Get team technicians
    const technicians = await database.query(`
      SELECT * FROM technicians WHERE team_id = ? ORDER BY name
    `, [req.params.id]);
    
    // Parse skills for each technician
    team.technicians = technicians.map(tech => ({
      ...tech,
      skills: tech.skills ? JSON.parse(tech.skills) : []
    }));
    
    // Get team equipment
    const equipment = await database.query(`
      SELECT * FROM equipment WHERE assigned_team_id = ? ORDER BY name
    `, [req.params.id]);
    
    team.equipment = equipment;
    
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// POST /api/teams - Create new team
router.post('/', async (req, res) => {
  try {
    const { name, specialization } = req.body;
    
    const result = await database.run(`
      INSERT INTO teams (name, specialization)
      VALUES (?, ?)
    `, [name, specialization]);

    const newTeam = await database.get(`
      SELECT t.*, 0 as technician_count, 0 as equipment_count
      FROM teams t WHERE t.id = ?
    `, [result.id]);
    
    res.status(201).json(newTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// PUT /api/teams/:id - Update team
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization } = req.body;
    
    await database.run(`
      UPDATE teams 
      SET name = ?, specialization = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, specialization, id]);

    const updatedTeam = await database.get(`
      SELECT t.*, 
             COUNT(tech.id) as technician_count,
             COUNT(e.id) as equipment_count
      FROM teams t
      LEFT JOIN technicians tech ON t.id = tech.team_id
      LEFT JOIN equipment e ON t.id = e.assigned_team_id
      WHERE t.id = ?
      GROUP BY t.id, t.name, t.specialization, t.created_at, t.updated_at
    `, [id]);
    
    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// GET /api/teams/:id/workload - Get team workload statistics
router.get('/:id/workload', async (req, res) => {
  try {
    const workload = await database.query(`
      SELECT 
        COUNT(CASE WHEN r.status = 'New' THEN 1 END) as new_requests,
        COUNT(CASE WHEN r.status = 'In Progress' THEN 1 END) as in_progress_requests,
        COUNT(CASE WHEN r.status = 'Repaired' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN r.type = 'Corrective' THEN 1 END) as corrective_requests,
        COUNT(CASE WHEN r.type = 'Preventive' THEN 1 END) as preventive_requests,
        AVG(r.duration) as avg_duration
      FROM maintenance_requests r
      JOIN technicians t ON r.assigned_technician_id = t.id
      WHERE t.team_id = ?
    `, [req.params.id]);
    
    res.json(workload[0] || {
      new_requests: 0,
      in_progress_requests: 0,
      completed_requests: 0,
      corrective_requests: 0,
      preventive_requests: 0,
      avg_duration: 0
    });
  } catch (error) {
    console.error('Error fetching team workload:', error);
    res.status(500).json({ error: 'Failed to fetch team workload' });
  }
});

module.exports = router;
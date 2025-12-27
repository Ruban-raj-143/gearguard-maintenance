const express = require('express');
const router = express.Router();
const database = require('../database/database');

// GET /api/technicians - Get all technicians
router.get('/', async (req, res) => {
  try {
    const technicians = await database.query(`
      SELECT t.*, tm.name as team_name, tm.specialization as team_specialization
      FROM technicians t
      LEFT JOIN teams tm ON t.team_id = tm.id
      ORDER BY t.name
    `);
    
    // Parse skills JSON for each technician
    const techniciansParsed = technicians.map(tech => ({
      ...tech,
      skills: tech.skills ? JSON.parse(tech.skills) : []
    }));
    
    res.json(techniciansParsed);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ error: 'Failed to fetch technicians' });
  }
});

// GET /api/technicians/:id - Get single technician
router.get('/:id', async (req, res) => {
  try {
    const technician = await database.get(`
      SELECT t.*, tm.name as team_name, tm.specialization as team_specialization
      FROM technicians t
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE t.id = ?
    `, [req.params.id]);
    
    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    // Parse skills JSON
    technician.skills = technician.skills ? JSON.parse(technician.skills) : [];
    
    res.json(technician);
  } catch (error) {
    console.error('Error fetching technician:', error);
    res.status(500).json({ error: 'Failed to fetch technician' });
  }
});

// GET /api/technicians/team/:teamId - Get technicians by team
router.get('/team/:teamId', async (req, res) => {
  try {
    const technicians = await database.query(`
      SELECT t.*, tm.name as team_name, tm.specialization as team_specialization
      FROM technicians t
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE t.team_id = ?
      ORDER BY t.active_requests ASC, t.name
    `, [req.params.teamId]);
    
    // Parse skills JSON for each technician
    const techniciansParsed = technicians.map(tech => ({
      ...tech,
      skills: tech.skills ? JSON.parse(tech.skills) : []
    }));
    
    res.json(techniciansParsed);
  } catch (error) {
    console.error('Error fetching team technicians:', error);
    res.status(500).json({ error: 'Failed to fetch team technicians' });
  }
});

// POST /api/technicians - Create new technician
router.post('/', async (req, res) => {
  try {
    const { name, team_id, avatar, skills } = req.body;
    
    const result = await database.run(`
      INSERT INTO technicians (name, team_id, avatar, skills)
      VALUES (?, ?, ?, ?)
    `, [name, team_id, avatar || '👨‍🔧', JSON.stringify(skills || [])]);

    const newTechnician = await database.get(`
      SELECT t.*, tm.name as team_name, tm.specialization as team_specialization
      FROM technicians t
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE t.id = ?
    `, [result.id]);
    
    // Parse skills JSON
    newTechnician.skills = newTechnician.skills ? JSON.parse(newTechnician.skills) : [];
    
    res.status(201).json(newTechnician);
  } catch (error) {
    console.error('Error creating technician:', error);
    res.status(500).json({ error: 'Failed to create technician' });
  }
});

// PUT /api/technicians/:id - Update technician
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, team_id, avatar, skills, active_requests } = req.body;
    
    await database.run(`
      UPDATE technicians 
      SET name = ?, team_id = ?, avatar = ?, skills = ?, active_requests = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, team_id, avatar, JSON.stringify(skills || []), active_requests || 0, id]);

    const updatedTechnician = await database.get(`
      SELECT t.*, tm.name as team_name, tm.specialization as team_specialization
      FROM technicians t
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE t.id = ?
    `, [id]);
    
    // Parse skills JSON
    updatedTechnician.skills = updatedTechnician.skills ? JSON.parse(updatedTechnician.skills) : [];
    
    res.json(updatedTechnician);
  } catch (error) {
    console.error('Error updating technician:', error);
    res.status(500).json({ error: 'Failed to update technician' });
  }
});

// GET /api/technicians/:id/requests - Get requests for technician
router.get('/:id/requests', async (req, res) => {
  try {
    const requests = await database.query(`
      SELECT r.*, e.name as equipment_name, e.location as equipment_location
      FROM maintenance_requests r
      LEFT JOIN equipment e ON r.equipment_id = e.id
      WHERE r.assigned_technician_id = ?
      ORDER BY r.scheduled_date ASC
    `, [req.params.id]);
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching technician requests:', error);
    res.status(500).json({ error: 'Failed to fetch technician requests' });
  }
});

module.exports = router;
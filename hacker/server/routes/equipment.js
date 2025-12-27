const express = require('express');
const router = express.Router();
const database = require('../database/database');

// GET /api/equipment - Get all equipment
router.get('/', async (req, res) => {
  try {
    const equipment = await database.query(`
      SELECT e.*, t.name as team_name 
      FROM equipment e 
      LEFT JOIN teams t ON e.assigned_team_id = t.id
      ORDER BY e.name
    `);
    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// GET /api/equipment/:id - Get single equipment
router.get('/:id', async (req, res) => {
  try {
    const equipment = await database.get(`
      SELECT e.*, t.name as team_name 
      FROM equipment e 
      LEFT JOIN teams t ON e.assigned_team_id = t.id
      WHERE e.id = ?
    `, [req.params.id]);
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// POST /api/equipment - Create new equipment
router.post('/', async (req, res) => {
  try {
    const {
      name,
      serial_number,
      purchase_date,
      warranty_expiry,
      location,
      department,
      assigned_team_id
    } = req.body;

    const result = await database.run(`
      INSERT INTO equipment (
        name, serial_number, purchase_date, warranty_expiry, 
        location, department, assigned_team_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, serial_number, purchase_date, warranty_expiry, location, department, assigned_team_id]);

    const newEquipment = await database.get(`
      SELECT e.*, t.name as team_name 
      FROM equipment e 
      LEFT JOIN teams t ON e.assigned_team_id = t.id
      WHERE e.id = ?
    `, [result.id]);

    res.status(201).json(newEquipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

// PUT /api/equipment/:id - Update equipment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    await database.run(`
      UPDATE equipment SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, values);

    const updatedEquipment = await database.get(`
      SELECT e.*, t.name as team_name 
      FROM equipment e 
      LEFT JOIN teams t ON e.assigned_team_id = t.id
      WHERE e.id = ?
    `, [id]);

    res.json(updatedEquipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// GET /api/equipment/:id/requests - Get requests for equipment
router.get('/:id/requests', async (req, res) => {
  try {
    const requests = await database.query(`
      SELECT r.*, t.name as technician_name, e.name as equipment_name
      FROM maintenance_requests r
      LEFT JOIN technicians t ON r.assigned_technician_id = t.id
      LEFT JOIN equipment e ON r.equipment_id = e.id
      WHERE r.equipment_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.id]);
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching equipment requests:', error);
    res.status(500).json({ error: 'Failed to fetch equipment requests' });
  }
});

module.exports = router;
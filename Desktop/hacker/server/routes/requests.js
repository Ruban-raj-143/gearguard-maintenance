const express = require('express');
const router = express.Router();
const database = require('../database/database');

// GET /api/requests - Get all maintenance requests
router.get('/', async (req, res) => {
  try {
    const requests = await database.query(`
      SELECT r.*, 
             e.name as equipment_name, 
             e.location as equipment_location,
             e.health_score as equipment_health,
             t.name as technician_name,
             t.avatar as technician_avatar,
             tm.name as team_name
      FROM maintenance_requests r
      LEFT JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN technicians t ON r.assigned_technician_id = t.id
      LEFT JOIN teams tm ON t.team_id = tm.id
      ORDER BY r.created_at DESC
    `);
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// GET /api/requests/:id - Get single request
router.get('/:id', async (req, res) => {
  try {
    const request = await database.get(`
      SELECT r.*, 
             e.name as equipment_name, 
             e.location as equipment_location,
             e.health_score as equipment_health,
             t.name as technician_name,
             t.avatar as technician_avatar,
             tm.name as team_name
      FROM maintenance_requests r
      LEFT JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN technicians t ON r.assigned_technician_id = t.id
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE r.id = ?
    `, [req.params.id]);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// POST /api/requests - Create new maintenance request
router.post('/', async (req, res) => {
  try {
    const {
      subject,
      equipment_id,
      type,
      scheduled_date,
      duration,
      assigned_technician_id,
      priority,
      notes
    } = req.body;

    const result = await database.run(`
      INSERT INTO maintenance_requests (
        subject, equipment_id, type, scheduled_date, duration,
        assigned_technician_id, priority, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [subject, equipment_id, type, scheduled_date, duration, assigned_technician_id, priority, notes]);

    // Update technician active requests count
    if (assigned_technician_id) {
      await database.run(`
        UPDATE technicians 
        SET active_requests = active_requests + 1 
        WHERE id = ?
      `, [assigned_technician_id]);
    }

    // Update equipment health score for corrective requests
    if (type === 'Corrective') {
      await database.run(`
        UPDATE equipment 
        SET health_score = CASE 
          WHEN health_score >= 10 THEN health_score - 10 
          ELSE 0 
        END,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [equipment_id]);

      // Log health score change
      await database.run(`
        INSERT INTO equipment_health_history (equipment_id, health_score, change_reason, request_id)
        SELECT id, health_score, 'Corrective request created', ? FROM equipment WHERE id = ?
      `, [result.id, equipment_id]);
    }

    const newRequest = await database.get(`
      SELECT r.*, 
             e.name as equipment_name, 
             e.location as equipment_location,
             e.health_score as equipment_health,
             t.name as technician_name,
             t.avatar as technician_avatar,
             tm.name as team_name
      FROM maintenance_requests r
      LEFT JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN technicians t ON r.assigned_technician_id = t.id
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE r.id = ?
    `, [result.id]);

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// PUT /api/requests/:id - Update maintenance request
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get current request to check for status changes
    const currentRequest = await database.get('SELECT * FROM maintenance_requests WHERE id = ?', [id]);
    if (!currentRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Build dynamic update query
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    await database.run(`
      UPDATE maintenance_requests SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, values);

    // Handle status changes
    if (updates.status && updates.status !== currentRequest.status) {
      await handleStatusChange(currentRequest, updates.status);
    }

    const updatedRequest = await database.get(`
      SELECT r.*, 
             e.name as equipment_name, 
             e.location as equipment_location,
             e.health_score as equipment_health,
             t.name as technician_name,
             t.avatar as technician_avatar,
             tm.name as team_name
      FROM maintenance_requests r
      LEFT JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN technicians t ON r.assigned_technician_id = t.id
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE r.id = ?
    `, [id]);

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Handle request status changes
async function handleStatusChange(request, newStatus) {
  const oldStatus = request.status;
  
  // Update technician active requests count
  if ((oldStatus === 'New' || oldStatus === 'In Progress') && 
      (newStatus === 'Repaired' || newStatus === 'Scrap')) {
    if (request.assigned_technician_id) {
      await database.run(`
        UPDATE technicians 
        SET active_requests = CASE 
          WHEN active_requests > 0 THEN active_requests - 1 
          ELSE 0 
        END 
        WHERE id = ?
      `, [request.assigned_technician_id]);
    }
  }

  // Update equipment health score and status
  if (newStatus === 'Repaired' && request.type === 'Preventive') {
    await database.run(`
      UPDATE equipment 
      SET health_score = CASE 
        WHEN health_score <= 95 THEN health_score + 5 
        ELSE 100 
      END,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [request.equipment_id]);

    // Log health score change
    await database.run(`
      INSERT INTO equipment_health_history (equipment_id, health_score, change_reason, request_id)
      SELECT id, health_score, 'Preventive maintenance completed', ? FROM equipment WHERE id = ?
    `, [request.id, request.equipment_id]);
  } else if (newStatus === 'Scrap') {
    await database.run(`
      UPDATE equipment 
      SET health_score = 0, is_usable = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [request.equipment_id]);

    // Log health score change
    await database.run(`
      INSERT INTO equipment_health_history (equipment_id, health_score, change_reason, request_id)
      VALUES (?, 0, 'Equipment scrapped', ?)
    `, [request.equipment_id, request.id]);
  }

  // Set completion timestamp
  if (newStatus === 'Repaired' || newStatus === 'Scrap') {
    await database.run(`
      UPDATE maintenance_requests 
      SET completed_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [request.id]);
  }
}

// DELETE /api/requests/:id - Delete maintenance request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get request details before deletion
    const request = await database.get('SELECT * FROM maintenance_requests WHERE id = ?', [id]);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update technician active requests count if needed
    if ((request.status === 'New' || request.status === 'In Progress') && request.assigned_technician_id) {
      await database.run(`
        UPDATE technicians 
        SET active_requests = CASE 
          WHEN active_requests > 0 THEN active_requests - 1 
          ELSE 0 
        END 
        WHERE id = ?
      `, [request.assigned_technician_id]);
    }

    await database.run('DELETE FROM maintenance_requests WHERE id = ?', [id]);
    
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

module.exports = router;
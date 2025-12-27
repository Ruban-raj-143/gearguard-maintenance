const express = require('express');
const router = express.Router();
const database = require('../database/database');

// GET /api/analytics/dashboard - Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Equipment statistics
    const equipmentStats = await database.get(`
      SELECT 
        COUNT(*) as total_equipment,
        COUNT(CASE WHEN health_score >= 80 THEN 1 END) as healthy_equipment,
        COUNT(CASE WHEN health_score BETWEEN 40 AND 79 THEN 1 END) as warning_equipment,
        COUNT(CASE WHEN health_score < 40 THEN 1 END) as critical_equipment,
        COUNT(CASE WHEN is_usable = 0 THEN 1 END) as scrapped_equipment,
        AVG(health_score) as avg_health_score
      FROM equipment
    `);

    // Request statistics
    const requestStats = await database.get(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'New' THEN 1 END) as new_requests,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_requests,
        COUNT(CASE WHEN status = 'Repaired' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN status = 'Scrap' THEN 1 END) as scrapped_requests,
        COUNT(CASE WHEN type = 'Corrective' THEN 1 END) as corrective_requests,
        COUNT(CASE WHEN type = 'Preventive' THEN 1 END) as preventive_requests
      FROM maintenance_requests
    `);

    // Team statistics
    const teamStats = await database.query(`
      SELECT 
        t.name,
        t.specialization,
        COUNT(tech.id) as technician_count,
        COUNT(e.id) as equipment_count,
        COUNT(r.id) as active_requests
      FROM teams t
      LEFT JOIN technicians tech ON t.id = tech.team_id
      LEFT JOIN equipment e ON t.id = e.assigned_team_id
      LEFT JOIN maintenance_requests r ON tech.id = r.assigned_technician_id 
        AND r.status IN ('New', 'In Progress')
      GROUP BY t.id, t.name, t.specialization
    `);

    // Recent activity
    const recentActivity = await database.query(`
      SELECT 
        r.id,
        r.subject,
        r.type,
        r.status,
        r.priority,
        r.created_at,
        e.name as equipment_name,
        t.name as technician_name
      FROM maintenance_requests r
      LEFT JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN technicians t ON r.assigned_technician_id = t.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);

    // Equipment breakdown warnings (3+ breakdowns in 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const breakdownWarnings = await database.query(`
      SELECT 
        e.id,
        e.name,
        e.health_score,
        COUNT(r.id) as breakdown_count
      FROM equipment e
      JOIN maintenance_requests r ON e.id = r.equipment_id
      WHERE r.type = 'Corrective' 
        AND r.created_at >= ?
      GROUP BY e.id, e.name, e.health_score
      HAVING COUNT(r.id) >= 3
    `, [thirtyDaysAgo.toISOString()]);

    res.json({
      equipment: equipmentStats,
      requests: requestStats,
      teams: teamStats,
      recentActivity,
      breakdownWarnings
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// GET /api/analytics/equipment-health - Get equipment health trends
router.get('/equipment-health', async (req, res) => {
  try {
    const healthTrends = await database.query(`
      SELECT 
        e.id,
        e.name,
        e.health_score,
        e.purchase_date,
        e.warranty_expiry,
        COUNT(r.id) as total_requests,
        COUNT(CASE WHEN r.type = 'Corrective' THEN 1 END) as breakdown_count,
        COUNT(CASE WHEN r.type = 'Preventive' THEN 1 END) as maintenance_count
      FROM equipment e
      LEFT JOIN maintenance_requests r ON e.id = r.equipment_id
      GROUP BY e.id, e.name, e.health_score, e.purchase_date, e.warranty_expiry
      ORDER BY e.health_score ASC
    `);

    res.json(healthTrends);
  } catch (error) {
    console.error('Error fetching equipment health trends:', error);
    res.status(500).json({ error: 'Failed to fetch equipment health trends' });
  }
});

// GET /api/analytics/technician-performance - Get technician performance metrics
router.get('/technician-performance', async (req, res) => {
  try {
    const performance = await database.query(`
      SELECT 
        t.id,
        t.name,
        t.avatar,
        tm.name as team_name,
        t.active_requests,
        COUNT(r.id) as total_completed,
        COUNT(CASE WHEN r.type = 'Corrective' THEN 1 END) as corrective_completed,
        COUNT(CASE WHEN r.type = 'Preventive' THEN 1 END) as preventive_completed,
        AVG(r.duration) as avg_duration
      FROM technicians t
      LEFT JOIN teams tm ON t.team_id = tm.id
      LEFT JOIN maintenance_requests r ON t.id = r.assigned_technician_id 
        AND r.status = 'Repaired'
      GROUP BY t.id, t.name, t.avatar, tm.name, t.active_requests
      ORDER BY total_completed DESC
    `);

    res.json(performance);
  } catch (error) {
    console.error('Error fetching technician performance:', error);
    res.status(500).json({ error: 'Failed to fetch technician performance' });
  }
});

// GET /api/analytics/cost-analysis - Get maintenance cost analysis
router.get('/cost-analysis', async (req, res) => {
  try {
    const costAnalysis = await database.query(`
      SELECT 
        e.id,
        e.name,
        e.purchase_date,
        e.health_score,
        COUNT(r.id) as total_requests,
        COALESCE(SUM(mc.total_cost), 0) as total_maintenance_cost,
        COALESCE(SUM(mc.downtime_hours), 0) as total_downtime_hours,
        COALESCE(AVG(mc.total_cost), 0) as avg_cost_per_request
      FROM equipment e
      LEFT JOIN maintenance_requests r ON e.id = r.equipment_id
      LEFT JOIN maintenance_costs mc ON r.id = mc.request_id
      GROUP BY e.id, e.name, e.purchase_date, e.health_score
      ORDER BY total_maintenance_cost DESC
    `);

    res.json(costAnalysis);
  } catch (error) {
    console.error('Error fetching cost analysis:', error);
    res.status(500).json({ error: 'Failed to fetch cost analysis' });
  }
});

module.exports = router;
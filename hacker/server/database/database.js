const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'gearguard.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('📊 Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    // Teams table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        specialization TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Technicians table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS technicians (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        team_id INTEGER NOT NULL,
        avatar TEXT DEFAULT '👨‍🔧',
        skills TEXT, -- JSON array of skills
        active_requests INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams (id)
      )
    `);

    // Equipment table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        serial_number TEXT NOT NULL UNIQUE,
        purchase_date DATE NOT NULL,
        warranty_expiry DATE NOT NULL,
        location TEXT NOT NULL,
        department TEXT NOT NULL,
        assigned_team_id INTEGER NOT NULL,
        health_score INTEGER DEFAULT 100,
        is_usable BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_team_id) REFERENCES teams (id)
      )
    `);

    // Maintenance requests table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        equipment_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('Corrective', 'Preventive')),
        scheduled_date DATE NOT NULL,
        duration REAL DEFAULT 0,
        assigned_technician_id INTEGER,
        priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
        status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Repaired', 'Scrap')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (equipment_id) REFERENCES equipment (id),
        FOREIGN KEY (assigned_technician_id) REFERENCES technicians (id)
      )
    `);

    // Equipment health history table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS equipment_health_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipment_id INTEGER NOT NULL,
        health_score INTEGER NOT NULL,
        change_reason TEXT,
        request_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment (id),
        FOREIGN KEY (request_id) REFERENCES maintenance_requests (id)
      )
    `);

    // Maintenance costs table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS maintenance_costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER NOT NULL,
        labor_cost REAL DEFAULT 0,
        parts_cost REAL DEFAULT 0,
        total_cost REAL DEFAULT 0,
        downtime_hours REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES maintenance_requests (id)
      )
    `);

    console.log('✅ Database tables initialized');
  }

  // Generic query method
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Generic run method for INSERT, UPDATE, DELETE
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // Get single record
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Close database connection
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('📊 Database connection closed');
          resolve();
        }
      });
    });
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;
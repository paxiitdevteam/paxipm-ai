// SQLite connection as fallback for testing
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../paxipm.db');

// Create database if it doesn't exist
if (!fs.existsSync(dbPath)) {
  console.log('📦 Creating SQLite database for testing...');
}

const db = new sqlite3.Database(dbPath);

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Convert SQL with ? placeholders to $1, $2 for SQLite
function convertSql(sql, params) {
  let paramIndex = 1;
  let convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  return convertedSql;
}

// Create tables if they don't exist
async function initializeSchema() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'Viewer',
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      client VARCHAR(255),
      start_date DATE,
      end_date DATE,
      status VARCHAR(50) DEFAULT 'Active',
      risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
      user_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title VARCHAR(255) NOT NULL,
      owner VARCHAR(255),
      progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      due_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      summary TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports(project_id);
  `;

  const statements = schema.split(';').filter(s => s.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        const convertedSql = convertSql(statement.trim() + ';', []);
        await dbRun(convertedSql);
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
          console.error('Schema error:', error.message);
        }
      }
    }
  }
}

// Initialize schema immediately
await initializeSchema();

// Create a mysql2-compatible pool interface
const pool = {
  async execute(sql, params = []) {
    try {
      const convertedSql = convertSql(sql, params);
      const result = await dbAll(convertedSql, params);
      return [result];
    } catch (error) {
      console.error('SQLite execute error:', error.message);
      throw error;
    }
  },

  async query(sql, params = []) {
    try {
      const convertedSql = convertSql(sql, params);
      
      if (sql.toUpperCase().trim().startsWith('INSERT')) {
        await dbRun(convertedSql, params);
        // Get last insert ID
        const row = await dbGet('SELECT last_insert_rowid() as insertId');
        return { insertId: row.insertId, rows: [] };
      } else if (sql.toUpperCase().includes('SELECT')) {
        const result = await dbAll(convertedSql, params);
        return { rows: result, insertId: null };
      } else {
        await dbRun(convertedSql, params);
        return { rows: [], insertId: null };
      }
    } catch (error) {
      console.error('SQLite query error:', error.message);
      throw error;
    }
  }
};

// Test connection
try {
  await dbRun('SELECT 1');
  console.log('✅ SQLite database connected successfully');
  console.log(`   Database: ${dbPath}\n`);
} catch (err) {
  console.error('❌ SQLite connection error:', err.message);
}

export default pool;

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

// Create all tables if they don't exist (including Phase 2 and Phase 3 tables)
async function initializeSchema() {
  const schema = `
    -- Core tables
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
      budgeted_amount DECIMAL(15, 2) DEFAULT 0.00,
      spent_amount DECIMAL(15, 2) DEFAULT 0.00,
      currency_code VARCHAR(3) DEFAULT 'USD',
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

    -- Phase 2: Core Project Management tables
    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      target_date DATE,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS risks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      probability VARCHAR(50) DEFAULT 'Medium',
      impact VARCHAR(50) DEFAULT 'Medium',
      status VARCHAR(50) DEFAULT 'Open',
      mitigation TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      priority VARCHAR(50) DEFAULT 'Medium',
      status VARCHAR(50) DEFAULT 'Open',
      resolution TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      filename VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER,
      mime_type VARCHAR(100),
      uploaded_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      project_id INTEGER,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      read_status INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      allocation_percent INTEGER DEFAULT 100,
      skills TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Phase 6: ITIL tables
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) DEFAULT 'Other',
      owner VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Active',
      location VARCHAR(255),
      serial_number VARCHAR(255),
      purchase_date DATE,
      warranty_expiry DATE,
      cost DECIMAL(15, 2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS slas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      name VARCHAR(255) NOT NULL,
      service_description TEXT,
      target_uptime DECIMAL(5,2) DEFAULT 99.90,
      response_time_target INTEGER DEFAULT 60,
      resolution_time_target INTEGER DEFAULT 240,
      penalty_clause TEXT,
      ai_risk_score DECIMAL(5,2) DEFAULT 0.00,
      status VARCHAR(50) DEFAULT 'Active',
      start_date DATE,
      end_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      asset_id INTEGER,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      priority VARCHAR(50) DEFAULT 'Medium',
      status VARCHAR(50) DEFAULT 'Open',
      reported_by VARCHAR(255),
      assigned_to VARCHAR(255),
      sla_id INTEGER,
      resolution TEXT,
      resolved_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
      FOREIGN KEY (sla_id) REFERENCES slas(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      change_type VARCHAR(50) DEFAULT 'Normal',
      status VARCHAR(50) DEFAULT 'Requested',
      requested_by VARCHAR(255),
      approved_by VARCHAR(255),
      implemented_by VARCHAR(255),
      implementation_date DATE,
      rollback_plan TEXT,
      risk_assessment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Phase 3: AI Enhancement tables
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      project_id INTEGER,
      title VARCHAR(255),
      language VARCHAR(10) DEFAULT 'en',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER,
      role VARCHAR(50) DEFAULT 'user',
      content TEXT NOT NULL,
      metadata TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      project_id INTEGER,
      endpoint VARCHAR(255) NOT NULL,
      request_data TEXT,
      response_data TEXT,
      tokens_used INTEGER,
      duration_ms INTEGER,
      cost_estimate DECIMAL(10, 4),
      language VARCHAR(10) DEFAULT 'en',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports(project_id);
    CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
    CREATE INDEX IF NOT EXISTS idx_risks_project_id ON risks(project_id);
    CREATE INDEX IF NOT EXISTS idx_issues_project_id ON issues(project_id);
    CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON notifications(read_status);
    CREATE INDEX IF NOT EXISTS idx_resources_project_id ON resources(project_id);
    CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id);
    CREATE INDEX IF NOT EXISTS idx_slas_project_id ON slas(project_id);
    CREATE INDEX IF NOT EXISTS idx_incidents_project_id ON incidents(project_id);
    CREATE INDEX IF NOT EXISTS idx_changes_project_id ON changes(project_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON ai_conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON ai_conversations(project_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON ai_messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON ai_usage_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_project_id ON ai_usage_logs(project_id);
  `;

  const statements = schema.split(';').filter(s => s.trim());
  for (const statement of statements) {
    if (statement.trim() && !statement.trim().startsWith('--')) {
      try {
        // Remove trailing semicolon if present and add back
        const cleanStatement = statement.trim().replace(/;$/, '') + ';';
        await dbRun(cleanStatement);
      } catch (error) {
        // Ignore "already exists" errors but log others
        if (!error.message.includes('already exists') && !error.message.includes('duplicate') && !error.message.includes('no such')) {
          console.error('Schema error:', error.message, 'Statement:', statement.substring(0, 100));
        }
      }
    }
  }
  console.log('✅ SQLite schema initialized with all Phase 2 and Phase 3 tables');
}

// Initialize schema immediately
await initializeSchema();

// Create pool-compatible interface
const pool = {
  async execute(sql, params = []) {
    const convertedSql = convertSql(sql, params);
    return [await dbAll(convertedSql)];
  },

  async query(sql, params = []) {
    const convertedSql = convertSql(sql, params);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return [await dbAll(convertedSql)];
    } else {
      const result = await dbRun(convertedSql);
      return [{ insertId: result.lastID, affectedRows: result.changes }];
    }
  },

  async get(sql, params = []) {
    const convertedSql = convertSql(sql, params);
    return await dbGet(convertedSql);
  }
};

export default pool;

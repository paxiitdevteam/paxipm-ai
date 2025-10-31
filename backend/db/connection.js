// Database connection - MariaDB/MySQL with automatic SQLite fallback
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (parent directory)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Check if we should use SQLite fallback
const USE_SQLITE = process.env.USE_SQLITE === 'true';

let pool;
let initialized = false;

// Initialize database connection
async function initPool() {
  if (initialized) return pool;

  // Use SQLite if explicitly requested
  if (USE_SQLITE) {
    console.log('📦 Using SQLite database for testing...\n');
    const sqliteModule = await import('./connection_sqlite.js');
    pool = sqliteModule.default;
    initialized = true;
    return pool;
  }

  // Try MariaDB first
  try {
    const testPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME || 'paxipm',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 3000,
      authSwitchHandler: (data, cb) => {
        if (data.pluginName === 'auth_gssapi_client' || 
            data.pluginName === 'unix_socket' ||
            !data.pluginName) {
          const error = new Error(`Unsupported authentication plugin: ${data.pluginName || 'unknown'}`);
          error.code = 'AUTH_PLUGIN_ERROR';
          cb(error);
        } else {
          cb(null, Buffer.from(data.password || ''));
        }
      }
    });

    // Quick connection test
    await testPool.query('SELECT 1');
    pool = testPool;
    console.log('✅ MariaDB connected successfully');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 3306}`);
    console.log(`   Database: ${process.env.DB_NAME || 'paxipm'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    initialized = true;
    return pool;
  } catch (err) {
    console.error('❌ MariaDB connection failed:', err.message);
    if (err.message.includes('auth') || err.message.includes('plugin')) {
      console.error('⚠️  MariaDB authentication plugin issue detected');
    }
    console.log('📦 Switching to SQLite database automatically...\n');
    
    // Fall back to SQLite automatically
    const sqliteModule = await import('./connection_sqlite.js');
    pool = sqliteModule.default;
    initialized = true;
    return pool;
  }
}

// Initialize immediately
const initPromise = initPool();

// Create pool wrapper that ensures initialization
const poolWrapper = {
  async execute(sql, params) {
    await initPromise;
    return pool.execute(sql, params);
  },
  async query(sql, params) {
    await initPromise;
    return pool.query(sql, params);
  }
};

export default poolWrapper;

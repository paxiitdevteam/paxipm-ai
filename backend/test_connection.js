// Test MariaDB connection directly
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Testing MariaDB connection...\n');
console.log('Configuration:');
console.log('  Host:', process.env.DB_HOST || 'localhost');
console.log('  Port:', process.env.DB_PORT || 3306);
console.log('  Database:', process.env.DB_NAME || 'paxipm');
console.log('  User:', process.env.DB_USER || 'root');
console.log('  Password:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET (empty)');
console.log('');

async function testConnection() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME || 'paxipm',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      connectTimeout: 5000
    });

    const [rows] = await connection.execute('SELECT NOW() as current_time, DATABASE() as current_db');
    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log('  Current time:', rows[0].current_time);
    console.log('  Database:', rows[0].current_db);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ CONNECTION FAILED!');
    console.error('  Error code:', error.code);
    console.error('  Error message:', error.message);
    console.error('');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.message.includes('Access denied')) {
      console.error('🔴 AUTHENTICATION ERROR:');
      console.error('  - Check DB_USER and DB_PASSWORD in .env file');
      console.error('  - Make sure password matches your MariaDB root password');
      console.error('');
      console.error('  To fix, run in MariaDB:');
      console.error('    ALTER USER \'root\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'your_password\';');
      console.error('    FLUSH PRIVILEGES;');
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      console.error('🔴 CONNECTION REFUSED:');
      console.error('  - MariaDB service might not be running');
      console.error('  - Check if MariaDB is started');
      console.error('  - Verify host and port in .env file');
    } else if (error.code === 'ER_BAD_DB_ERROR' || error.message.includes('Unknown database')) {
      console.error('🔴 DATABASE NOT FOUND:');
      console.error('  - Database "paxipm" does not exist');
      console.error('  - Run: CREATE DATABASE paxipm;');
    } else if (error.message.includes('auth') || error.message.includes('plugin')) {
      console.error('🔴 AUTHENTICATION PLUGIN ERROR:');
      console.error('  - MariaDB authentication plugin issue');
      console.error('  - Run in MariaDB:');
      console.error('    ALTER USER \'root\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'\';');
      console.error('    FLUSH PRIVILEGES;');
    }
    
    if (connection) {
      await connection.end().catch(() => {});
    }
    
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});


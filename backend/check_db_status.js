// Check database connection status
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Checking Database Connection...\n');
console.log('Configuration:');
console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`  Port: ${process.env.DB_PORT || 3306}`);
console.log(`  Database: ${process.env.DB_NAME || 'paxipm'}`);
console.log(`  User: ${process.env.DB_USER || 'root'}`);
console.log(`  Password: ${process.env.DB_PASSWORD ? '***SET***' : 'NOT SET (empty)'}\n`);

async function checkConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME || 'paxipm',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      connectTimeout: 5000
    });

    const [rows] = await connection.execute('SELECT NOW() as time, DATABASE() as db');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Current Time: ${rows[0].time}`);
    console.log(`  Database: ${rows[0].db || 'Not connected to database'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Database is working! You can now:');
    console.log('  1. Start backend: npm run dev');
    console.log('  2. Create test account: node create_test_user.js');
    console.log('  3. Login and test the app!\n');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ CONNECTION FAILED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    console.log('');
    
    if (error.message.includes('auth_gssapi_client')) {
      console.log('🔴 AUTHENTICATION PLUGIN ERROR DETECTED!\n');
      console.log('FIX REQUIRED: Run this in MariaDB:');
      console.log('');
      console.log('```sql');
      console.log(`ALTER USER '${process.env.DB_USER || 'root'}'@'localhost' IDENTIFIED WITH mysql_native_password BY '';`);
      console.log('FLUSH PRIVILEGES;');
      console.log('```');
      console.log('');
      console.log('Steps:');
      console.log('  1. Open MariaDB (HeidiSQL, phpMyAdmin, or command line)');
      console.log('  2. Run the ALTER USER command above');
      console.log('  3. Run: node check_db_status.js again to verify');
      console.log('');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔴 ACCESS DENIED ERROR!\n');
      console.log('Possible causes:');
      console.log('  1. Wrong password in .env file');
      console.log('  2. User doesn\'t exist');
      console.log('  3. Authentication plugin issue');
      console.log('');
      console.log('Fix: Run in MariaDB:');
      console.log(`  ALTER USER '${process.env.DB_USER || 'root'}'@'localhost' IDENTIFIED WITH mysql_native_password BY '';`);
      console.log('  FLUSH PRIVILEGES;');
      console.log('');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('🔴 DATABASE NOT FOUND!\n');
      console.log('Fix: Create database in MariaDB:');
      console.log('  CREATE DATABASE paxipm;');
      console.log('  Then import schema: mysql -u root -p paxipm < backend/db/schema.sql');
      console.log('');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔴 CONNECTION REFUSED!\n');
      console.log('Possible causes:');
      console.log('  1. MariaDB service is not running');
      console.log('  2. Wrong host or port in .env');
      console.log('  3. Firewall blocking connection');
      console.log('');
      console.log('Fix: Start MariaDB service');
      console.log('');
    }
    
    console.log('Run this after fixing: node check_db_status.js');
    process.exit(1);
  }
}

checkConnection();


// Automatic setup script - handles everything
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_NAME = process.env.DB_NAME || 'paxipm';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('   AUTOMATIC DATABASE SETUP');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function tryMysqlCommand(sql) {
  try {
    if (DB_PASSWORD) {
      const { stdout, stderr } = await execAsync(
        `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} -e "${sql}" 2>&1`,
        { env: { ...process.env, MYSQL_PWD: DB_PASSWORD } }
      );
      return { success: !stderr || stderr.includes('Warning'), output: stdout };
    } else {
      const { stdout, stderr } = await execAsync(
        `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -e "${sql}" 2>&1`
      );
      return { success: !stderr || stderr.includes('Warning'), output: stdout };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function checkConnection() {
  console.log('Step 1: Checking database connection...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT),
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD || '',
      connectTimeout: 3000
    });
    
    await connection.execute('SELECT 1');
    await connection.end();
    
    console.log('✅ Database connection works!\n');
    return true;
  } catch (error) {
    console.log('❌ Cannot connect to database\n');
    
    if (error.message.includes('auth_gssapi_client') || error.code === 'AUTH_PLUGIN_ERROR') {
      console.log('🔴 ISSUE: Authentication plugin needs to be fixed\n');
      return false;
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('🔴 ISSUE: Database does not exist\n');
      return false;
    } else {
      console.log('🔴 ISSUE:', error.message, '\n');
      return false;
    }
  }
}

async function fixAuthentication() {
  console.log('Step 2: Attempting to fix authentication...\n');
  
  const sql = `ALTER USER '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD || ''}'; FLUSH PRIVILEGES;`;
  
  console.log('Trying to fix automatically using mysql command...');
  const result = await tryMysqlCommand(sql.replace(/\n/g, ' '));
  
  if (result.success) {
    console.log('✅ Authentication fixed automatically!\n');
    return true;
  } else {
    console.log('⚠️  Cannot fix automatically (mysql command not in PATH)\n');
    return false;
  }
}

async function createDatabase() {
  console.log('Step 3: Checking if database exists...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD || '',
      connectTimeout: 3000
    });
    
    const [databases] = await connection.execute('SHOW DATABASES LIKE ?', [DB_NAME]);
    
    if (databases.length > 0) {
      console.log(`✅ Database "${DB_NAME}" exists\n`);
      await connection.end();
      return true;
    } else {
      console.log(`⚠️  Database "${DB_NAME}" does not exist\n`);
      console.log('Attempting to create database...');
      
      const result = await tryMysqlCommand(`CREATE DATABASE IF NOT EXISTS ${DB_NAME};`);
      
      if (result.success) {
        console.log(`✅ Database "${DB_NAME}" created!\n`);
        await connection.end();
        return true;
      } else {
        console.log('❌ Cannot create database automatically\n');
        await connection.end();
        return false;
      }
    }
  } catch (error) {
    console.log('❌ Cannot check database:', error.message, '\n');
    return false;
  }
}

async function importSchema() {
  console.log('Step 4: Checking if tables exist...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT),
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD || '',
      connectTimeout: 3000
    });
    
    const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
    
    if (tables.length > 0) {
      console.log('✅ Database schema already exists\n');
      await connection.end();
      return true;
    } else {
      console.log('⚠️  Schema not found, importing...\n');
      
      const schemaPath = path.join(__dirname, 'db/schema.sql');
      if (!fs.existsSync(schemaPath)) {
        console.log('❌ Schema file not found:', schemaPath, '\n');
        await connection.end();
        return false;
      }
      
      const result = await tryMysqlCommand(`SOURCE ${schemaPath}`);
      
      if (result.success) {
        console.log('✅ Schema imported!\n');
        await connection.end();
        return true;
      } else {
        // Try alternative method
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const statements = schema.split(';').filter(s => s.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await connection.execute(statement + ';');
            } catch (e) {
              // Ignore errors for IF EXISTS statements
            }
          }
        }
        
        console.log('✅ Schema imported!\n');
        await connection.end();
        return true;
      }
    }
  } catch (error) {
    console.log('❌ Cannot import schema:', error.message, '\n');
    return false;
  }
}

async function main() {
  // Step 1: Check connection
  const canConnect = await checkConnection();
  
  if (!canConnect) {
    // Try to fix authentication
    const fixed = await fixAuthentication();
    
    if (!fixed) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('   MANUAL FIX REQUIRED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('Open your MariaDB GUI tool (HeidiSQL, phpMyAdmin, etc.)');
      console.log('and run this SQL:\n');
      console.log(`ALTER USER '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '';`);
      console.log('FLUSH PRIVILEGES;\n');
      console.log('Then run this script again.\n');
      process.exit(1);
    }
    
    // Check connection again
    const recheck = await checkConnection();
    if (!recheck) {
      console.log('❌ Still cannot connect after fix attempt');
      console.log('Please run the SQL command manually and try again\n');
      process.exit(1);
    }
  }
  
  // Step 2: Create database
  await createDatabase();
  
  // Step 3: Import schema
  await importSchema();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ SETUP COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('You can now:');
  console.log('  1. Start backend: npm run dev');
  console.log('  2. Create test account: node create_test_user.js');
  console.log('  3. Test the app!\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});


// Automatic database authentication fix script
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

async function checkMariaDBConnection() {
  console.log('🔍 Checking MariaDB connection...\n');
  
  // Try to connect using mysql command
  try {
    const passwordArg = DB_PASSWORD ? `-p${DB_PASSWORD}` : '';
    const { stdout, stderr } = await execAsync(
      `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} ${passwordArg} -e "SELECT 1;" 2>&1`
    );
    
    if (stderr && !stderr.includes('mysql: [Warning]')) {
      console.log('❌ Cannot connect via mysql command');
      console.log('Error:', stderr);
      return false;
    }
    
    console.log('✅ Can connect via mysql command\n');
    return true;
  } catch (error) {
    console.log('⚠️  Cannot connect via mysql command');
    console.log('This might mean mysql command is not in PATH\n');
    return false;
  }
}

async function fixAuthenticationPlugin() {
  console.log('🔧 Attempting to fix authentication plugin...\n');
  
  const passwordArg = DB_PASSWORD ? `-p${DB_PASSWORD}` : '';
  const passwordString = DB_PASSWORD || '';
  
  const sqlCommands = `
USE mysql;
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${passwordString}';
FLUSH PRIVILEGES;
SELECT user, host, plugin FROM mysql.user WHERE user='${DB_USER}' AND host='localhost';
`.trim();

  // Try method 1: Direct mysql command
  try {
    console.log('Method 1: Using mysql command line...');
    
    if (DB_PASSWORD) {
      // With password - use here document
      const command = `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} -e "${sqlCommands.replace(/\n/g, '; ')}"`;
      const { stdout, stderr } = await execAsync(command, {
        env: { ...process.env, MYSQL_PWD: DB_PASSWORD }
      });
      
      if (stderr && !stderr.includes('mysql: [Warning]')) {
        throw new Error(stderr);
      }
      
      console.log('✅ Successfully fixed authentication plugin!\n');
      console.log('User plugin status:');
      console.log(stdout);
      return true;
    } else {
      // No password
      const command = `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -e "${sqlCommands.replace(/\n/g, '; ')}"`;
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('mysql: [Warning]')) {
        throw new Error(stderr);
      }
      
      console.log('✅ Successfully fixed authentication plugin!\n');
      console.log('User plugin status:');
      console.log(stdout);
      return true;
    }
  } catch (error) {
    console.log('⚠️  Cannot use mysql command automatically');
    console.log('Reason:', error.message);
    console.log('');
    return false;
  }
}

async function generateFixScript() {
  console.log('📝 Generating manual fix script...\n');
  
  const passwordString = DB_PASSWORD ? `'${DB_PASSWORD}'` : `''`;
  
  const sqlScript = `-- MariaDB Authentication Fix Script
-- Run this in MariaDB (mysql command line or GUI tool)

USE mysql;

-- Fix authentication plugin for root user
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY ${passwordString};

FLUSH PRIVILEGES;

-- Verify the change
SELECT user, host, plugin FROM mysql.user WHERE user='${DB_USER}' AND host='localhost';

-- Exit
EXIT;
`;

  const scriptPath = path.join(__dirname, 'fix_auth.sql');
  fs.writeFileSync(scriptPath, sqlScript);
  
  console.log(`✅ Fix script created: ${scriptPath}\n`);
  console.log('You can now:');
  console.log(`1. Run: mysql -u ${DB_USER} -p < backend/fix_auth.sql`);
  console.log(`2. Or open ${scriptPath} and run the SQL in your MariaDB GUI tool\n`);
  
  return scriptPath;
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   DATABASE AUTHENTICATION FIX SCRIPT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('Configuration:');
  console.log(`  Host: ${DB_HOST}`);
  console.log(`  Port: ${DB_PORT}`);
  console.log(`  User: ${DB_USER}`);
  console.log(`  Password: ${DB_PASSWORD ? '***SET***' : 'NOT SET (empty)'}\n`);
  
  // Step 1: Check if we can connect
  const canConnect = await checkMariaDBConnection();
  
  // Step 2: Try to fix automatically
  if (canConnect) {
    const fixed = await fixAuthenticationPlugin();
    if (fixed) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ FIXED! Restart your backend server now.');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }
  }
  
  // Step 3: Generate manual fix script
  console.log('Generating manual fix instructions...\n');
  const scriptPath = await generateFixScript();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   MANUAL FIX REQUIRED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('To fix manually:');
  console.log('');
  console.log('Option 1: Using command line');
  console.log(`  mysql -u ${DB_USER} ${DB_PASSWORD ? '-p' : ''} < backend/fix_auth.sql`);
  console.log('');
  console.log('Option 2: Using MariaDB GUI tool');
  console.log(`  1. Open ${scriptPath}`);
  console.log('  2. Copy all SQL commands');
  console.log('  3. Paste and execute in your MariaDB GUI tool (HeidiSQL, phpMyAdmin, etc.)');
  console.log('');
  console.log('Option 3: Manual SQL');
  console.log(`  Run in MariaDB:`);
  console.log(`  ALTER USER '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY ${DB_PASSWORD ? `'${DB_PASSWORD}'` : `''`};`);
  console.log('  FLUSH PRIVILEGES;');
  console.log('');
  console.log('After fixing, restart your backend server.\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});


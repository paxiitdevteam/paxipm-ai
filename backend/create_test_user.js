// Create test user for PaxiPM AI - Uses SQLite fallback
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

const TEST_USER = {
  name: 'Test User',
  email: 'test@paxipm.ai',
  password: 'Test123!',
  role: 'Project Manager'
};

async function createTestUser() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   CREATING TEST USER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Connecting to database...');

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [TEST_USER.email]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  Test user already exists!');
      console.log(`   Email: ${TEST_USER.email}`);
      console.log('   You can use this account to login.\n');
      
      // Show current user info
      const user = existingUsers[0];
      console.log('User details:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log('');
      console.log('✅ You can now login with these credentials:');
      console.log(`   Email: ${TEST_USER.email}`);
      console.log(`   Password: ${TEST_USER.password}\n`);
      return;
    }

    // Hash password
    console.log('Creating test user...');
    const passwordHash = await bcrypt.hash(TEST_USER.password, 10);

    // Insert user - use query() to get insertId
    const insertResult = await pool.query(
      'INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)',
      [TEST_USER.name, TEST_USER.email, TEST_USER.role, passwordHash]
    );

    console.log('\n✅ Test user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   TEST ACCOUNT CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);
    console.log(`   Role:     ${TEST_USER.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ You can now login with these credentials!');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error creating test user:');
    console.error('   Error:', error.message);
    console.error('');
    
    if (error.message && error.message.includes('connect')) {
      console.error('🔴 Database connection failed!');
      console.error('   Check your database configuration in .env file.');
    } else if (error.message && error.message.includes('table')) {
      console.error('🔴 Database schema not found!');
      console.error('   The users table does not exist.');
      console.error('   Please ensure database schema is initialized.');
    } else {
      console.error('   Full error:', error);
    }
    
    process.exit(1);
  }
}

createTestUser();

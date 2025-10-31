// Test MariaDB connection
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'paxipm',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const [rows] = await connection.execute('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('Current time:', rows[0].current_time);
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('\nCheck:');
    console.error('1. .env file exists in project root');
    console.error('2. DB_USER and DB_PASSWORD are correct');
    console.error('3. MariaDB service is running');
    console.error('4. Database exists: CREATE DATABASE paxipm;');
    
    if (error.message.includes('auth')) {
      console.error('\n🔴 AUTHENTICATION ERROR - Run this in MariaDB:');
      console.error("ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';");
      console.error('FLUSH PRIVILEGES;');
    }
    
    process.exit(1);
  }
}

testConnection();


// Test script to verify AI Engine connection
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

async function testAIEngine() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   AI ENGINE CONNECTION TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Testing AI Engine at: ${AI_ENGINE_URL}\n`);

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthRes = await axios.get(`${AI_ENGINE_URL}/`, { timeout: 5000 });
    console.log(`   ✅ Health Check: ${JSON.stringify(healthRes.data)}\n`);

    // Test 2: Charter Generation
    console.log('2. Testing charter generation...');
    const charterRes = await axios.post(
      `${AI_ENGINE_URL}/generate-charter`,
      {
        projectName: 'Test Project',
        description: 'A test project for validation'
      },
      { timeout: 10000 }
    );
    console.log(`   ✅ Charter Generation: Success`);
    console.log(`   Response: ${charterRes.data.projectName}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ AI ENGINE CONNECTION SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('All endpoints are working correctly.\n');

  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ AI ENGINE CONNECTION FAILED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('Cannot connect to AI Engine server.');
      console.error(`   URL: ${AI_ENGINE_URL}`);
      console.error('   Make sure AI Engine is running:\n');
      console.error('   cd ai_engine');
      console.error('   python -m uvicorn main:app --port 8000\n');
    } else if (error.response) {
      console.error('AI Engine responded with error:');
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data}\n`);
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
}

testAIEngine();


# ✅ Create Test Account for PaxiPM AI

## Quick Setup

I've created a script to automatically create a test user account.

### Step 1: Make Sure Database is Working

First, ensure your database connection works. If you're still getting authentication errors, fix that first (see `SOLUTION.md`).

### Step 2: Run the Script

```bash
cd backend
node create_test_user.js
```

### Step 3: Use Test Credentials

After running the script, you'll get test account credentials:

```
Email:    test@paxipm.ai
Password: Test123!
Role:     Project Manager
```

### Step 4: Login

Use these credentials on the login page.

## Manual Creation (Alternative)

If the script doesn't work, you can:

### Option 1: Use Register Page

1. Go to: `http://localhost:3000/register`
2. Fill in the form:
   - Name: `Test User`
   - Email: `test@paxipm.ai`
   - Password: `Test123!`
   - Role: `Project Manager`
3. Click Register

### Option 2: Create via SQL

Connect to MariaDB and run:

```sql
USE paxipm;

-- Password hash for 'Test123!' (bcrypt)
INSERT INTO users (name, email, role, password_hash) 
VALUES (
  'Test User',
  'test@paxipm.ai',
  'Project Manager',
  '$2a$10$rVJz8qKZJZJZJZJZJZJZJeJZJZJZJZJZJZJZJZJZJZJZJZJZJZJZa'
);
```

**Note:** The password hash above won't work. Use the script instead, or register through the UI.

## Default Test Account

**Email:** `test@paxipm.ai`  
**Password:** `Test123!`  
**Role:** `Project Manager`

## Troubleshooting

### "Database authentication error"
- Fix MariaDB authentication first (see `SOLUTION.md`)
- Then run the script again

### "Database does not exist"
- Create database: `CREATE DATABASE paxipm;`
- Import schema: `mysql -u root -p paxipm < backend/db/schema.sql`
- Then run the script again

### "User already exists"
- The test user is already created
- Use the credentials shown to login
- Or delete user first: `DELETE FROM users WHERE email = 'test@paxipm.ai';`


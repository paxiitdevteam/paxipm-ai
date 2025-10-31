# 🔴 FIX Database Authentication Error - Step by Step

## Current Error
"Database authentication error. Please check your MariaDB username and password in .env file."

## Quick Fix (5 minutes)

### Step 1: Test Connection

Run this to see the exact error:
```bash
cd backend
node test_connection.js
```

This will show you the specific problem.

### Step 2: Fix Based on Error

#### If you see "Access denied" or "Authentication error":

**Option A: MariaDB has NO password**
1. Keep `.env` as: `DB_PASSWORD=`
2. Run in MariaDB:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
```

**Option B: MariaDB HAS a password**
1. Open `.env` file
2. Find `DB_PASSWORD=` line
3. Change to: `DB_PASSWORD=your_actual_password`
4. Run in MariaDB:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_actual_password';
FLUSH PRIVILEGES;
```

#### If you see "Connection refused":

**MariaDB service is not running**
- Start MariaDB service on Windows
- Check if MariaDB is running in services

#### If you see "Unknown database":

**Database doesn't exist**
```sql
CREATE DATABASE paxipm;
```
Then import schema:
```bash
mysql -u root -p paxipm < backend/db/schema.sql
```

### Step 3: Verify .env File

Make sure `.env` file (in project root) has:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=paxipm
DB_USER=root
DB_PASSWORD=your_password_or_empty
JWT_SECRET=paxipm_secret_key_2024_change_in_production
```

### Step 4: Restart Backend

```bash
cd backend
npm run dev
```

**Look for:** `✅ Database connected successfully`

### Step 5: Test Login

After restart, try login again. Error should be gone! ✅

## Alternative: Create New MariaDB User

If root user has issues, create a new user:

```sql
CREATE USER 'paxipm_user'@'localhost' IDENTIFIED BY 'paxipm_password';
GRANT ALL PRIVILEGES ON paxipm.* TO 'paxipm_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update `.env`:
```env
DB_USER=paxipm_user
DB_PASSWORD=paxipm_password
```

## Still Not Working?

Run `node backend/test_connection.js` and share the error message - it will tell us exactly what's wrong!


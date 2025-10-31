# 🔴 FIX DATABASE AUTHENTICATION ERROR - URGENT

## Current Error
"Database authentication error. Please check your MariaDB username and password in .env file."

## ✅ IMMEDIATE FIX (Do This Now)

### Step 1: Fix MariaDB Authentication Plugin

**This is the MAIN fix** - MariaDB needs to use the correct authentication plugin.

#### Using Command Line:
```bash
mysql -u root -p
```
(Enter your MariaDB password, or press Enter if no password)

#### Using MariaDB GUI (HeidiSQL, phpMyAdmin, MySQL Workbench):
Connect to your MariaDB server, then run the SQL commands below.

### Step 2: Run This SQL Command

**If MariaDB has NO password:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EXIT;
```

**If MariaDB HAS a password:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_actual_password';
FLUSH PRIVILEGES;
EXIT;
```
(Replace `your_actual_password` with your real MariaDB root password)

### Step 3: Verify .env File

Make sure `.env` file (in project root) has:

**If MariaDB has NO password:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=paxipm
DB_USER=root
DB_PASSWORD=
```

**If MariaDB HAS a password:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=paxipm
DB_USER=root
DB_PASSWORD=your_actual_password
```

### Step 4: Create Database (if needed)

```sql
CREATE DATABASE IF NOT EXISTS paxipm;
```

### Step 5: Import Schema

```bash
mysql -u root -p paxipm < backend/db/schema.sql
```

Or in MariaDB GUI, import the file `backend/db/schema.sql`

### Step 6: Restart Backend

**STOP** backend server (Ctrl+C), then:

```bash
cd backend
npm run dev
```

**You should see:**
```
✅ Database connected successfully
```

### Step 7: Test Login

After restart, try login again. **Error should be GONE!** ✅

---

## Why This Error Happens

MariaDB uses authentication plugins. The default plugin (`caching_sha2_password` or others) doesn't work well with Node.js clients. Switching to `mysql_native_password` fixes this.

---

## Alternative: Create New User (if root doesn't work)

If you can't fix the root user, create a new user:

```sql
CREATE USER 'paxipm_user'@'localhost' IDENTIFIED BY 'paxipm123';
GRANT ALL PRIVILEGES ON paxipm.* TO 'paxipm_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update `.env`:
```env
DB_USER=paxipm_user
DB_PASSWORD=paxipm123
```

Then restart backend.

---

## Quick Test

Run this to see the exact error:
```bash
cd backend
node create_test_user.js
```

This will show you exactly what's wrong and how to fix it.

---

## ⚠️ MOST IMPORTANT STEP

**Run the ALTER USER command in MariaDB first!** This fixes the authentication plugin issue.

Everything else won't work until you do this step.


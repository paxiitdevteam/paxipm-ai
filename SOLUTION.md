# ✅ SOLUTION: Fix Database Authentication Error

## The Problem
**Error:** "Database authentication error. Please check your MariaDB username and password in .env file."

**Cause:** MariaDB is using an authentication plugin that the Node.js client doesn't support.

## ✅ FIX (Do This Now)

### Step 1: Fix MariaDB Authentication Plugin

**Open MariaDB** (HeidiSQL, phpMyAdmin, MySQL Workbench, or command line):

**If using command line:**
```bash
mysql -u root -p
```
(Enter your MariaDB password, or press Enter if no password)

**Run this SQL command:**

**For NO password:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EXIT;
```

**For WITH password:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
EXIT;
```
(Replace `your_password` with your actual MariaDB password)

### Step 2: Update .env File

Your `.env` file should have:
```env
DB_USER=root
DB_PASSWORD=
```

**If MariaDB has a password**, change to:
```env
DB_PASSWORD=your_actual_password
```

### Step 3: Create Database (if needed)

```sql
CREATE DATABASE IF NOT EXISTS paxipm;
```

Then import schema:
```bash
mysql -u root -p paxipm < backend/db/schema.sql
```

### Step 4: Restart Backend

**STOP** backend (Ctrl+C), then:
```bash
cd backend
npm run dev
```

**Look for:** `✅ Database connected successfully`

### Step 5: Test Login

After restart, try login. **Error should be GONE!** ✅

---

## Why This Happens

MariaDB uses different authentication plugins. The default plugin (`caching_sha2_password` or `unix_socket`) doesn't work well with Node.js clients. Switching to `mysql_native_password` fixes it.

## Alternative: Create New User

If you can't fix root user, create a new one:

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

Restart backend and test again.

---

**The most important step is Step 1 - run the ALTER USER command!**


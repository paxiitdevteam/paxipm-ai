# 🔴 IMMEDIATE FIX - Database Authentication Error

## The Problem
You're seeing: "Database authentication error. Please check your MariaDB username and password in .env file."

## Root Cause
MariaDB is using an authentication plugin that the client doesn't support. This is a common issue.

## ✅ FIX IT NOW (2 Steps)

### Step 1: Fix MariaDB Authentication Plugin

**Open MariaDB** (using HeidiSQL, phpMyAdmin, MySQL Workbench, or command line):

If using command line:
```bash
mysql -u root -p
```
(Enter your password, or just press Enter if no password)

**Then run this SQL command:**

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

Replace `your_actual_password` with your real MariaDB root password.

### Step 2: Update .env File (if needed)

Open `.env` file in project root and check:

**If MariaDB has NO password:**
```env
DB_PASSWORD=
```
(Leave empty - already correct)

**If MariaDB HAS a password:**
```env
DB_PASSWORD=your_actual_password
```
(Add your password here)

### Step 3: Create Database (if not exists)

```sql
CREATE DATABASE IF NOT EXISTS paxipm;
```

Then import schema:
```bash
mysql -u root -p paxipm < backend/db/schema.sql
```

Or if you're using a GUI tool, import `backend/db/schema.sql` file.

### Step 4: Restart Backend

**STOP** backend server (Ctrl+C), then:

```bash
cd backend
npm run dev
```

**You should see:**
```
✅ Database connected successfully
```

### Step 5: Test Login

After restart, try login again. **Error should be GONE!** ✅

---

## Quick Test

To see the exact error, run:
```bash
node backend/test_connection.js
```

This will show you exactly what's wrong.

## Alternative: If You Can't Access MariaDB

If you can't run SQL commands, you can:

1. **Use a GUI tool** like HeidiSQL, phpMyAdmin, or MySQL Workbench
2. **Create a new user** instead of fixing root:

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

**The most important step is Step 1 - fixing the authentication plugin. Do that first!**


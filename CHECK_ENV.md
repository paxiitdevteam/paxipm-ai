# Check Your .env File Configuration

## Quick Check

Your `.env` file exists, but let's verify it has the correct settings.

## Required Variables in .env

Make sure your `.env` file (in project root) has these:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=paxipm_secret_key_2024_change_in_production

DB_HOST=localhost
DB_PORT=3306
DB_NAME=paxipm
DB_USER=root
DB_PASSWORD=your_actual_password_here

AI_ENGINE_URL=http://localhost:8000
```

## What to Check

1. **DB_PASSWORD** - Must match your MariaDB root password exactly
   - If MariaDB has NO password: `DB_PASSWORD=` (empty)
   - If MariaDB has password: `DB_PASSWORD=actual_password`

2. **DB_USER** - Usually `root` for MariaDB

3. **DB_PORT** - Should be `3306` (not 5432)

4. **DB_NAME** - Should be `paxipm` (database must exist)

## Fix Authentication Error

If you're still getting "Database authentication error", run this in MariaDB:

### Option 1: Using MariaDB Command Line (if in PATH)
```bash
mysql -u root -p
```

### Option 2: Using MariaDB GUI (HeidiSQL, phpMyAdmin, etc.)
Connect to MariaDB, then run:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
```

**If you have a password:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

## After Fixing

1. Save `.env` file
2. **RESTART backend server** (Ctrl+C, then `npm run dev`)
3. Look for: `✅ Database connected successfully`
4. Try login again

## Test Connection

After fixing `.env`, test it:

```bash
cd backend
node ../test_db_connection.js
```

This will show if connection works or what's wrong.


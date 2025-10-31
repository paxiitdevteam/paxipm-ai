# Quick Fix for Login Error

## The Problem
Login shows "Internal server error" because:
1. Database is not configured in `.env` file
2. OR PostgreSQL is not running
3. OR JWT_SECRET is missing

## Quick Solution

### Step 1: Create/Update `.env` file

In your **project root** (same folder as `backend/` and `frontend/`), create or update `.env` file:

```env
# Database Configuration - CHANGE THESE VALUES
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paxipm
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# JWT Secret - REQUIRED for login/register to work
JWT_SECRET=paxipm_secret_key_2024_change_in_production

# Backend Port
PORT=5000

# AI Engine URL
AI_ENGINE_URL=http://localhost:8000
```

**Important:** Replace `your_postgres_password_here` with your actual PostgreSQL password.

### Step 2: Create Database (if not exists)

Open PostgreSQL command line or pgAdmin:

```sql
CREATE DATABASE paxipm;
```

### Step 3: Run Database Schema

```bash
psql -U postgres -d paxipm -f backend/db/schema.sql
```

Or if your PostgreSQL user is different:
```bash
psql -U your_username -d paxipm -f backend/db/schema.sql
```

### Step 4: Restart Backend Server

**STOP** the current backend server (Ctrl+C), then restart:

```bash
cd backend
npm run dev
```

You should see:
- ✅ `Database connected successfully` - GOOD
- ❌ `Database connection error: ...` - Check .env file

### Step 5: Test Login

After restart, try login again. You should now see:
- If database works: Login succeeds or shows "Invalid credentials"
- If database fails: More specific error like "Database connection failed"

## If You Don't Have PostgreSQL

If PostgreSQL is not installed:

1. **Install PostgreSQL**: https://www.postgresql.org/download/
2. **Create database**: `CREATE DATABASE paxipm;`
3. **Run schema**: `psql -U postgres -d paxipm -f backend/db/schema.sql`
4. **Update .env**: Set `DB_USER` and `DB_PASSWORD` to your PostgreSQL credentials

## Verify Configuration

After restarting backend, check the console logs:
- ✅ `Database connected successfully` = Working
- ❌ Any error message = Check that specific error


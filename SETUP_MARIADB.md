# MariaDB Setup Guide for PaxiPM AI

## Database Configuration

The backend has been converted from PostgreSQL to MariaDB/MySQL.

## Setup Steps

### 1. Create Database

Connect to MariaDB and create the database:

```sql
CREATE DATABASE paxipm;
```

Or using command line:
```bash
mysql -u root -p
```

Then:
```sql
CREATE DATABASE paxipm;
EXIT;
```

### 2. Run Database Schema

```bash
mysql -u root -p paxipm < backend/db/schema.sql
```

Or connect to MariaDB and run:
```sql
USE paxipm;
SOURCE backend/db/schema.sql;
```

### 3. Configure .env File

In your **project root** `.env` file, add:

```env
# Backend Configuration
PORT=5000
NODE_ENV=development

# JWT Secret - REQUIRED for authentication
JWT_SECRET=paxipm_secret_key_2024_change_in_production

# Database Configuration - MariaDB/MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=paxipm
DB_USER=root
DB_PASSWORD=your_mariadb_password_here

# AI Engine URL
AI_ENGINE_URL=http://localhost:8000
```

**Important:** 
- Replace `your_mariadb_password_here` with your actual MariaDB root password
- MariaDB default port is `3306` (not 5432 like PostgreSQL)
- Default user is usually `root`

### 4. Restart Backend Server

**STOP** the current backend server (Ctrl+C), then restart:

```bash
cd backend
npm run dev
```

You should see:
- ✅ `Database connected successfully` - GOOD
- ❌ `Database connection error: ...` - Check .env file

### 5. Verify Connection

After restarting backend, check the console logs:
- ✅ `Database connected successfully` = Working
- ❌ Any error message = Check that specific error

## Key Changes from PostgreSQL

1. **Package**: Changed from `pg` to `mysql2`
2. **Port**: Changed from `5432` to `3306`
3. **SQL Parameters**: Changed from `$1, $2` to `?`
4. **Result Handling**: Changed from `.rows` to direct array
5. **INSERT**: Changed from `RETURNING *` to `SELECT LAST_INSERT_ID()`

## Troubleshooting

### Error: "Database connection failed"
- **Check**: MariaDB service is running
- **Check**: Database exists (`CREATE DATABASE paxipm;`)
- **Check**: `.env` file has correct credentials
- **Check**: Port is `3306` (not 5432)

### Error: "Access denied"
- **Check**: Username and password in `.env` are correct
- **Check**: User has permissions on database

### Error: "Table doesn't exist"
- **Check**: Schema was run successfully
- **Solution**: Run `mysql -u root -p paxipm < backend/db/schema.sql` again


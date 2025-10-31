# MariaDB Setup for PaxiPM AI

## ✅ Conversion Complete

The backend has been converted from PostgreSQL to MariaDB/MySQL:

### Changes Made:
1. ✅ Replaced `pg` package with `mysql2`
2. ✅ Updated database connection to use `mysql2/promise`
3. ✅ Converted all SQL queries from PostgreSQL (`$1, $2`) to MySQL (`?`)
4. ✅ Updated result handling from `.rows` to direct array
5. ✅ Changed `RETURNING *` to `SELECT LAST_INSERT_ID()` pattern
6. ✅ Updated schema from PostgreSQL to MySQL/MariaDB syntax
7. ✅ Updated port from `5432` (PostgreSQL) to `3306` (MariaDB)

## Setup Steps

### 1. Create `.env` File

In your **project root** (same folder as `backend/` and `frontend/`), create `.env`:

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

**Important:** Replace `your_mariadb_password_here` with your actual MariaDB root password.

### 2. Create Database

Connect to MariaDB:
```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE paxipm;
EXIT;
```

### 3. Run Database Schema

```bash
mysql -u root -p paxipm < backend/db/schema.sql
```

Or if you're already in MariaDB:
```sql
USE paxipm;
SOURCE backend/db/schema.sql;
```

### 4. Restart Backend Server

**STOP** the current backend (Ctrl+C), then restart:

```bash
cd backend
npm run dev
```

You should see:
- ✅ `Database connected successfully` - GOOD
- ❌ `Database connection error: ...` - Check .env file

### 5. Test Login

After restart, try login. It should:
- Work if database is configured correctly
- Show specific error messages if something is wrong

## Key Differences from PostgreSQL

| Feature | PostgreSQL | MariaDB/MySQL |
|---------|-----------|---------------|
| Port | 5432 | 3306 |
| Parameters | `$1, $2` | `?` |
| Result | `.rows` array | Direct array |
| INSERT | `RETURNING *` | `insertId` then `SELECT` |
| AUTO_INCREMENT | `SERIAL` | `AUTO_INCREMENT` |

## Troubleshooting

### Error: "Database connection failed"
- **Check**: MariaDB service is running
- **Check**: Port is `3306` (not 5432)
- **Check**: `.env` file has correct credentials

### Error: "Access denied"
- **Check**: Username and password are correct
- **Check**: User has permissions on database

### Error: "Table doesn't exist"
- **Check**: Schema was run (`mysql -u root -p paxipm < backend/db/schema.sql`)
- **Check**: Database name matches `.env` file


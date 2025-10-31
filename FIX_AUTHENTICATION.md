# Fix Database Authentication Error

## Current Error
"Database authentication error. Please check your MariaDB username and password in .env file."

## Quick Fix Steps

### Step 1: Create/Update `.env` File

In your **project root** (same folder as `backend/` and `frontend/`), create or update `.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=paxipm_secret_key_2024_change_in_production

DB_HOST=localhost
DB_PORT=3306
DB_NAME=paxipm
DB_USER=root
DB_PASSWORD=YOUR_ACTUAL_MARIADB_PASSWORD

AI_ENGINE_URL=http://localhost:8000
```

**⚠️ IMPORTANT:** Replace `YOUR_ACTUAL_MARIADB_PASSWORD` with your real MariaDB root password!

### Step 2: Fix MariaDB Authentication Plugin

The error means MariaDB user needs proper authentication. Connect to MariaDB:

```bash
mysql -u root -p
```

Then run (replace `your_password` with your actual password):
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Verify Database Exists

```bash
mysql -u root -p
```

```sql
SHOW DATABASES;
-- Should see 'paxipm' in the list
```

If `paxipm` doesn't exist:
```sql
CREATE DATABASE paxipm;
EXIT;
```

Then run schema:
```bash
mysql -u root -p paxipm < backend/db/schema.sql
```

### Step 4: Restart Backend

**STOP** the backend server (Ctrl+C), then:

```bash
cd backend
npm run dev
```

You should see:
- ✅ `Database connected successfully` = WORKING
- ❌ Any error message = Check Step 1-3

### Step 5: Test Login

After restart, try login again with:
- Any email (will need to register first if database is empty)
- Any password (if user doesn't exist, try registering first)

## Alternative: Use Different MariaDB User

If `root` user has issues, create a new user:

```sql
CREATE USER 'paxipm_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON paxipm.* TO 'paxipm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Then update `.env`:
```env
DB_USER=paxipm_user
DB_PASSWORD=your_password
```

## Troubleshooting

### Still Getting "Database authentication error"?
1. ✅ Check `.env` file has correct `DB_USER` and `DB_PASSWORD`
2. ✅ Run the `ALTER USER` command above
3. ✅ Verify MariaDB service is running
4. ✅ Check port is `3306` (not 5432)

### "Database connection failed"?
- MariaDB service might not be running
- Wrong host/port in `.env`
- Firewall blocking connection

### "JWT configuration error"?
- Make sure `JWT_SECRET` is set in `.env` file


# 🔴 URGENT: Create .env File to Fix Authentication Error

## The Problem
You're seeing "Database authentication error" because **the `.env` file is missing** from your project root.

## Solution - Do This Now

### Step 1: Create `.env` File

**Location:** `C:\Users\PC-PAXIIT\Desktop\PaxiPM_AI\paxipm-ai\.env`

**In Cursor:**
1. In the file explorer (left sidebar), click on the project root folder: `paxipm-ai`
2. Right-click → "New File"
3. Name it exactly: `.env` (with dot at the beginning, NO extension)
4. Paste this content:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=paxipm_secret_key_2024_change_in_production

DB_HOST=localhost
DB_PORT=3306
DB_NAME=paxipm
DB_USER=root
DB_PASSWORD=PUT_YOUR_MARIADB_PASSWORD_HERE

AI_ENGINE_URL=http://localhost:8000
```

### Step 2: Replace Password

**⚠️ CRITICAL:** Replace `PUT_YOUR_MARIADB_PASSWORD_HERE` with your **actual** MariaDB root password (the one you use when running `mysql -u root -p`).

If you don't know your password, try:
- Empty password: `DB_PASSWORD=`
- Or check if MariaDB is using a different user/password

### Step 3: Save the File

Press `Ctrl+S` to save the `.env` file.

### Step 4: Fix MariaDB Authentication

Open command prompt/terminal and run:

```bash
mysql -u root -p
```

(Enter your MariaDB password when prompted)

Then run this SQL (replace `your_password` with your actual password):

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
EXIT;
```

### Step 5: Create Database (if needed)

```bash
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS paxipm;
EXIT;
```

Then run schema:
```bash
mysql -u root -p paxipm < backend/db/schema.sql
```

### Step 6: Restart Backend

**STOP** backend server (Ctrl+C), then:

```bash
cd backend
npm run dev
```

**Look for this message:**
- ✅ `Database connected successfully` = **WORKING!**
- ❌ Any error = Check .env file again

### Step 7: Test Login

After restart, try login again. The error should be **GONE**!

## Quick Checklist

- [ ] `.env` file created in project root
- [ ] `DB_PASSWORD` updated with actual MariaDB password
- [ ] `ALTER USER` command run in MariaDB
- [ ] Database `paxipm` created
- [ ] Schema run (`mysql -u root -p paxipm < backend/db/schema.sql`)
- [ ] Backend restarted
- [ ] See "Database connected successfully" message

## Still Not Working?

If you still see "Database authentication error":
1. ✅ Double-check `.env` file exists (should be `paxipm-ai\.env`)
2. ✅ Check `DB_PASSWORD` matches your MariaDB password exactly
3. ✅ Run the `ALTER USER` command above
4. ✅ Restart backend after making changes


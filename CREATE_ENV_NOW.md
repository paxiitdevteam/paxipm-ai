# 🔴 CREATE .env FILE NOW - Step by Step

## You're seeing "Database authentication error" because `.env` file is missing!

## Quick Fix (2 minutes)

### Step 1: Create `.env` File

**In Cursor:**
1. Look at left sidebar → File Explorer
2. Find folder: `paxipm-ai` (project root)
3. Right-click on `paxipm-ai` folder
4. Select **"New File"**
5. Type exactly: `.env` (with the dot `.` at the beginning)
6. Press Enter

### Step 2: Paste This Content

Copy and paste this **entire block** into the `.env` file:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=paxipm_secret_key_2024_change_in_production

DB_HOST=localhost
DB_PORT=3306
DB_NAME=paxipm
DB_USER=root
DB_PASSWORD=
AI_ENGINE_URL=http://localhost:8000
```

**Note:** I put `DB_PASSWORD=` empty. If your MariaDB has a password, add it here.

### Step 3: Add Your MariaDB Password

**If MariaDB root has a password:**
- Replace `DB_PASSWORD=` with `DB_PASSWORD=your_password_here`
- Use the **exact same password** you use for `mysql -u root -p`

**If MariaDB root has NO password:**
- Leave it as `DB_PASSWORD=` (empty)

### Step 4: Save File

Press **`Ctrl+S`** (or Cmd+S on Mac) to save.

### Step 5: Fix MariaDB Authentication

Open **Command Prompt** or **Terminal** and run:

```bash
mysql -u root -p
```

(Enter your password if prompted, or just press Enter if no password)

Then run this SQL (replace `your_password` with your actual password, or leave empty if no password):

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EXIT;
```

**If MariaDB has a password:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
EXIT;
```

### Step 6: Create Database

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

### Step 7: Restart Backend

**STOP** backend server (Ctrl+C), then restart:

```bash
cd backend
npm run dev
```

**Look for this message:**
```
✅ Database connected successfully
```

### Step 8: Test Login

After restart, try login again. Error should be **GONE**!

---

## Test Your Connection

After creating `.env`, test it:

```bash
cd backend
node ../test_db_connection.js
```

This will tell you if connection works or what's wrong.

## Still Getting Error?

1. ✅ Verify `.env` file exists (should be `paxipm-ai\.env`)
2. ✅ Check password matches MariaDB password exactly
3. ✅ Run `ALTER USER` command above
4. ✅ Restart backend after creating `.env`


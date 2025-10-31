# Create .env File - Step by Step

## 🔴 CRITICAL: You MUST create `.env` file in project root

The `.env` file is **missing** or **incorrectly configured**, causing the authentication error.

## Location
**Project Root:** `C:\Users\PC-PAXIIT\Desktop\PaxiPM_AI\paxipm-ai\.env`

(Same folder where `backend/` and `frontend/` folders are)

## Step 1: Create the File

**Option A: Using Cursor/VS Code**
1. In Cursor, right-click in project root folder
2. Select "New File"
3. Name it exactly: `.env` (with the dot at the beginning)
4. Paste the content below

**Option B: Using Command Line**
```bash
cd C:\Users\PC-PAXIIT\Desktop\PaxiPM_AI\paxipm-ai
notepad .env
```
(Then paste content and save)

## Step 2: Paste This Content

```env
# Backend Configuration
PORT=5000
NODE_ENV=development

# JWT Secret - REQUIRED for authentication
JWT_SECRET=paxipm_secret_key_2024_change_in_production

# Database Configuration - MariaDB/MySQL
# ⚠️ REPLACE THESE WITH YOUR ACTUAL VALUES ⚠️
DB_HOST=localhost
DB_PORT=3306
DB_NAME=paxipm
DB_USER=root
DB_PASSWORD=YOUR_MARIADB_ROOT_PASSWORD_HERE

# AI Engine URL
AI_ENGINE_URL=http://localhost:8000
```

## Step 3: Update DB_PASSWORD

**⚠️ CRITICAL:** Replace `YOUR_MARIADB_ROOT_PASSWORD_HERE` with your **actual** MariaDB root password.

**How to find your MariaDB password:**
- It's the password you use when running `mysql -u root -p`
- If you don't know it, try:
  - Empty password: `DB_PASSWORD=`
  - Or try resetting MariaDB password

## Step 4: Fix MariaDB Authentication

The error "auth_gssapi_client" means MariaDB needs authentication plugin fix:

```bash
mysql -u root -p
```

Then run (replace `your_password` with your actual password):
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
EXIT;
```

## Step 5: Create Database (if not exists)

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

## Step 6: Restart Backend

**STOP** backend server (Ctrl+C), then:

```bash
cd backend
npm run dev
```

Look for:
- ✅ `Database connected successfully` = SUCCESS
- ❌ `Database connection error: ...` = Check .env file

## Step 7: Test Again

After restart, try login again. The error should be gone!

## Troubleshooting

### Still seeing "Database authentication error"?
1. ✅ Verify `.env` file exists in project root
2. ✅ Check `DB_PASSWORD` matches your MariaDB password
3. ✅ Run the `ALTER USER` command above
4. ✅ Restart backend after creating/updating .env

### Can't find MariaDB password?
- Try empty password: `DB_PASSWORD=`
- Or create a new MariaDB user (see FIX_AUTHENTICATION.md)

### File not saving?
- Make sure filename is exactly `.env` (with dot)
- No extension (not `.env.txt`)
- In project root folder (same as `backend/` and `frontend/`)


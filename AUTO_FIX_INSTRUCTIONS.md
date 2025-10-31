# ✅ Automatic Database Authentication Fix

## The Problem
You're seeing: "Database authentication error" or "auth_gssapi_client plugin"

## ✅ ONE-STEP SOLUTION

I've created an automatic fix script. Just run:

```bash
cd backend
node fix_database_auth.js
```

This script will:
1. ✅ Check your database connection
2. ✅ Try to automatically fix the authentication plugin
3. ✅ Generate a fix script if automatic fix doesn't work
4. ✅ Provide clear instructions

## What It Does

### If mysql command is available:
- Automatically runs the SQL to fix authentication plugin
- You just need to restart backend after

### If mysql command is not available:
- Generates a SQL fix script (`backend/fix_auth.sql`)
- Shows you exactly what to do
- You can run the SQL in your MariaDB GUI tool

## After Running the Script

1. **If automatic fix worked:**
   - Just restart backend: `cd backend && npm run dev`
   - You should see: `✅ Database connected successfully`

2. **If manual fix needed:**
   - Follow the instructions shown by the script
   - Or open `backend/fix_auth.sql` in your MariaDB GUI tool
   - Run the SQL commands
   - Then restart backend

## Quick Fix SQL (Manual Option)

If you prefer to do it manually, open MariaDB and run:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
```

(Add password in BY '' if MariaDB has password)

Then restart backend.

---

**Run the fix script first - it will handle everything automatically if possible!**


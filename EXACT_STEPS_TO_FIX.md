# 🔴 EXACT STEPS TO FIX - Do This Now

## Current Error
"Database authentication error. Please check your MariaDB username and password in .env file."

## ✅ FIX (Follow These Exact Steps)

### Step 1: Open MariaDB

**You MUST run SQL commands in MariaDB to fix this.**

#### Option A: Using HeidiSQL (or similar GUI tool)
1. Open HeidiSQL
2. Connect to your MariaDB server
3. Click on the SQL tab

#### Option B: Using Command Line
```bash
mysql -u root -p
```
(Enter password if prompted, or just press Enter if no password)

### Step 2: Copy and Run This SQL

**Copy this EXACT command:**

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
```

**Paste it in MariaDB and execute it.**

### Step 3: Verify It Worked

Run this to check:
```sql
SELECT user, host, plugin FROM mysql.user WHERE user='root' AND host='localhost';
```

You should see `plugin = 'mysql_native_password'`

### Step 4: RESTART Backend

**STOP** backend completely (Ctrl+C), then:

```bash
cd backend
npm run dev
```

**CRITICAL:** You MUST restart backend after running the SQL!

### Step 5: Check Backend Output

You should see:
```
✅ Database connected successfully
```

If you still see an error, copy the exact error message.

### Step 6: Test Login

After backend shows "Database connected successfully", try login again.

---

## ⚠️ IMPORTANT

- The SQL command MUST be run in MariaDB
- Backend MUST be restarted after running SQL
- This is a ONE-TIME fix

## If It Still Doesn't Work

1. Make sure you restarted backend
2. Check backend console for exact error message
3. Share the exact error from backend console

---

**The SQL fix is MANDATORY - there's no way around it. Once you run it, it will work!**


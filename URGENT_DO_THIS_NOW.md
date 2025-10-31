# 🔴 URGENT: Fix Database Authentication - DO THIS NOW

## The Error You're Seeing
"Database authentication error. Please check your MariaDB username and password in .env file."

## ✅ THE FIX (3 Steps - 2 Minutes)

### Step 1: Open MariaDB

**Option A: Command Line**
```bash
mysql -u root -p
```
(Press Enter if no password, or enter your password)

**Option B: GUI Tool**
- Open HeidiSQL, phpMyAdmin, MySQL Workbench, or any MariaDB client
- Connect to localhost with user `root`

### Step 2: Run This SQL Command

**Since your `.env` shows `DB_PASSWORD=` (empty), MariaDB has NO password:**

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EXIT;
```

**If MariaDB HAS a password:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
EXIT;
```
(Replace `your_password` with your actual password)

### Step 3: Restart Backend

**STOP** backend (Ctrl+C), then:

```bash
cd backend
npm run dev
```

**You should see:**
```
✅ Database connected successfully
```

### Step 4: Test

Try login again. **Error should be GONE!** ✅

---

## Why This Works

MariaDB uses authentication plugins. The default plugin doesn't work with Node.js. Switching to `mysql_native_password` fixes it.

---

## If You Can't Access MariaDB Command Line

**Use a GUI tool like HeidiSQL or phpMyAdmin:**

1. Connect to MariaDB
2. Open SQL query window
3. Paste this:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
```
4. Execute (F9 or Run button)

---

## Still Not Working?

Make sure:
1. ✅ MariaDB service is running
2. ✅ Database `paxipm` exists: `CREATE DATABASE paxipm;`
3. ✅ Schema imported: `mysql -u root -p paxipm < backend/db/schema.sql`
4. ✅ Backend restarted after running ALTER USER command

**The ALTER USER command is the most important step!** Do that first.


# 🚀 Quick Test Setup - No Manual Config Needed

## ⚠️ One-Time Fix Required (2 Minutes)

To test the app, you need to fix MariaDB authentication **ONCE**. After that, you can test freely.

### ✅ EASIEST WAY (Using MariaDB GUI Tool):

1. **Open your MariaDB GUI tool** (HeidiSQL, phpMyAdmin, MySQL Workbench, etc.)
2. **Open the file:** `backend/fix_auth.sql`
3. **Copy all SQL commands** from the file
4. **Paste and execute** in your MariaDB tool (press F9 or Run)
5. **Done!** ✅

That's it! You only need to do this once.

### Alternative: Quick SQL Command

If you prefer, just run this ONE command in MariaDB:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
```

## ✅ After Fix - You Can Test Freely!

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

Look for: `✅ Database connected successfully`

### Step 2: Create Test Account
```bash
cd backend
node create_test_user.js
```

This creates:
- **Email:** `test@paxipm.ai`
- **Password:** `Test123!`

### Step 3: Login and Test

Use the test account to login and test all features!

## 🎯 Summary

1. ✅ Fix MariaDB auth (one-time, 2 minutes)
2. ✅ Start backend
3. ✅ Create test account
4. ✅ Login and test!

**You only need to fix MariaDB authentication ONCE. After that, everything works!**

---

**Want me to create a test account right now? Run: `cd backend && node create_test_user.js`**


# ✅ Test App Now - Simple Steps

## Quick Answer: YES, But One Fix First

You can test the app with **any username/password**, but you need to fix MariaDB authentication **ONE TIME** first.

## ⚡ Fastest Path (3 Steps, 2 Minutes)

### Step 1: Fix MariaDB Auth (One-Time Only)

**Open your MariaDB GUI tool** (HeidiSQL, phpMyAdmin, etc.) and run:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
```

**OR** open `backend/fix_auth.sql` and run all SQL commands in your MariaDB tool.

### Step 2: Start Backend

```bash
cd backend
npm run dev
```

Wait for: `✅ Database connected successfully`

### Step 3: Create Test Account

```bash
node create_test_user.js
```

**Test Credentials Created:**
- Email: `test@paxipm.ai`
- Password: `Test123!`

### Step 4: Login and Test!

Use those credentials to login and test everything!

---

## Alternative: Use Register Page

If you prefer, you can:
1. Fix MariaDB auth (Step 1 above)
2. Go to: `http://localhost:3000/register`
3. Create any account you want
4. Login and test!

---

## Summary

- ✅ **MariaDB fix:** One-time only (2 minutes)
- ✅ **After fix:** You can test freely with any account
- ✅ **Test account:** Auto-created with `create_test_user.js`
- ✅ **No other setup needed:** Just login and test!

**The fix is ONE TIME. After that, you can test as much as you want!**


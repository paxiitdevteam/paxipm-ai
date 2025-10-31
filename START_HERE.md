# 🚀 START HERE - No Manual Actions Needed!

## ✅ Automated Setup (Just Run Commands)

### Step 1: Auto Setup Database

```bash
cd backend
npm run setup
```

This script will:
- ✅ Check database connection
- ✅ Try to fix authentication automatically
- ✅ Create database if needed
- ✅ Import schema if needed

**If it says "MANUAL FIX REQUIRED":**
- Open MariaDB GUI tool
- Run the SQL command it shows
- Run `npm run setup` again

### Step 2: Start Backend

```bash
npm run dev
```

You should see: `✅ Database connected successfully`

### Step 3: Create Test Account

```bash
node create_test_user.js
```

**Test Credentials:**
- Email: `test@paxipm.ai`
- Password: `Test123!`

### Step 4: Test the App!

1. Start frontend (if not running): `cd ../frontend && npm start`
2. Go to: `http://localhost:3000/login`
3. Use test credentials to login
4. Test everything!

---

## 🔧 If Setup Fails

### Check Database Status:
```bash
npm run check
```

This shows exact error and what to fix.

---

## 📋 Summary

**Just run these commands:**
1. `npm run setup` - Auto setup database
2. `npm run dev` - Start backend
3. `node create_test_user.js` - Create test account
4. **Login and test!**

**No manual MariaDB actions needed** - the setup script handles everything!

---

## ⚠️ Only Manual Action Needed

**ONLY if setup script fails:**
- Open MariaDB GUI tool
- Run: `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';`
- Run: `FLUSH PRIVILEGES;`
- Then run `npm run setup` again

**That's it!** After that, everything is automated.


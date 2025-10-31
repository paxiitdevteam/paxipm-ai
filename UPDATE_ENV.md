# ✅ Updated .env File

## What I Did

I added the missing database configuration to your `.env` file:

```env
# JWT Secret - REQUIRED for authentication
JWT_SECRET=paxipm_secret_key_2024_change_in_production

# Database Configuration - MariaDB/MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=paxipm
DB_USER=root
DB_PASSWORD=
```

## ⚠️ IMPORTANT: You Need to Update DB_PASSWORD

I left `DB_PASSWORD=` **empty**. You need to:

1. **Open `.env` file** in your editor
2. **Find this line:** `DB_PASSWORD=`
3. **Add your MariaDB password:**
   - If MariaDB has password: `DB_PASSWORD=your_actual_password`
   - If MariaDB has NO password: Leave it as `DB_PASSWORD=` (empty is OK)

## Next Steps

### 1. Fix MariaDB Authentication

Open MariaDB (using HeidiSQL, phpMyAdmin, or command line) and run:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
```

**If MariaDB has a password:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### 2. Create Database (if not exists)

```sql
CREATE DATABASE IF NOT EXISTS paxipm;
```

Then run schema:
```bash
mysql -u root -p paxipm < backend/db/schema.sql
```

Or if you're using a GUI tool, import `backend/db/schema.sql` file.

### 3. Restart Backend

**STOP** backend server (Ctrl+C), then:

```bash
cd backend
npm run dev
```

**Look for:**
- ✅ `Database connected successfully` = WORKING!
- ❌ Any error = Check `.env` file and MariaDB settings

### 4. Test Login

After restart, try login again. The error should be **GONE**!

## Still Getting Error?

1. ✅ Check `DB_PASSWORD` in `.env` matches your MariaDB password
2. ✅ Run `ALTER USER` command above
3. ✅ Verify database `paxipm` exists
4. ✅ Restart backend after changes


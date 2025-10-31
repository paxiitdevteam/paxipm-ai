# Quick Start Guide - PaxiPM AI Backend

## Fix Authentication Error

If you see "auth_gssapi_client" or authentication plugin error:

### 1. Create `.env` File (Project Root)

In your **project root** (same folder as `backend/` and `frontend/`), create `.env`:

```env
PORT=5000
JWT_SECRET=paxipm_secret_key_2024_change_this
DB_HOST=localhost
DB_PORT=3306
DB_NAME=paxipm
DB_USER=root
DB_PASSWORD=your_mariadb_root_password_here
AI_ENGINE_URL=http://localhost:8000
```

**Replace `your_mariadb_root_password_here` with your actual MariaDB root password.**

### 2. Create Database

Connect to MariaDB:
```bash
mysql -u root -p
```

Then:
```sql
CREATE DATABASE paxipm;
EXIT;
```

### 3. Run Schema

```bash
mysql -u root -p paxipm < backend/db/schema.sql
```

### 4. Fix MariaDB Authentication (if needed)

If you still get authentication plugin errors, fix the MariaDB user:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

Replace `your_password` with your actual password.

### 5. Restart Backend

Stop backend (Ctrl+C), then:
```bash
cd backend
npm run dev
```

You should see: `✅ Database connected successfully`

### 6. Test Login

After restart, try login again. It should work!

## Troubleshooting

- **"auth_gssapi_client" error**: Run the `ALTER USER` command above to fix authentication
- **"Database connection failed"**: Check `.env` file has correct credentials
- **"JWT configuration error"**: Make sure `JWT_SECRET` is set in `.env`


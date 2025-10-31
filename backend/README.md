# PaxiPM AI Backend

Express.js API backend for PaxiPM AI Project Management SaaS.

## Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MariaDB/MySQL (using mysql2)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file in **project root** (same folder as `backend/` and `frontend/`):

```env
# Backend Configuration
PORT=5000
NODE_ENV=development

# JWT Secret - REQUIRED for authentication
JWT_SECRET=paxipm_secret_key_2024_change_in_production

# Database Configuration - MariaDB/MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=paxipm
DB_USER=root
DB_PASSWORD=your_mariadb_password_here

# AI Engine URL
AI_ENGINE_URL=http://localhost:8000
```

**Important:** Replace `your_mariadb_password_here` with your actual MariaDB root password.

### 3. Create Database

Connect to MariaDB:
```bash
mysql -u root -p
```

Then create the database:
```sql
CREATE DATABASE paxipm;
EXIT;
```

### 4. Run Database Schema

```bash
mysql -u root -p paxipm < backend/db/schema.sql
```

Or if already connected:
```sql
USE paxipm;
SOURCE backend/db/schema.sql;
```

### 5. Start Server

```bash
npm run dev
```

You should see:
- ✅ `Database connected successfully` - GOOD
- ❌ Any error message - Check configuration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Projects
- `GET /api/projects` - List all projects (requires auth)
- `POST /api/projects` - Create new project (requires auth)
- `GET /api/projects/:id` - Get single project (requires auth)

### Reports
- `GET /api/reports` - Get all reports (requires auth)
- `GET /api/reports/project/:projectId` - Get project reports (requires auth)

### AI
- `POST /api/ai/charter` - Generate project charter (no auth for testing)
- `POST /api/ai/risk` - Calculate risk score (requires auth)
- `POST /api/ai/risk-analysis` - Generate charter + WBS + risks (requires auth)
- `POST /api/ai/project-setup` - Full project setup (requires auth)
- `POST /api/ai/reporting` - Progress reporting (requires auth)
- `POST /api/ai/pmo-report` - PMO status report (requires auth)

## Troubleshooting

### Error: "auth_gssapi_client" or authentication plugin error
- **Solution**: Make sure `.env` has correct `DB_USER` and `DB_PASSWORD`
- **Check**: MariaDB user has correct authentication method

### Error: "Database connection failed"
- **Check**: MariaDB service is running
- **Check**: Port is `3306` (not 5432)
- **Check**: Database exists (`CREATE DATABASE paxipm;`)

### Error: "JWT configuration error"
- **Check**: `JWT_SECRET` is set in `.env` file
- **Solution**: Add `JWT_SECRET=some_random_secret_key` to `.env`

## Database Schema

See `backend/db/schema.sql` for complete database schema.

Tables:
- `users` - User accounts
- `projects` - Projects
- `tasks` - Project tasks
- `reports` - Generated reports


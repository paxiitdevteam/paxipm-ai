# 🐳 Docker Setup Guide for PaxiPM AI

## Overview

Complete Docker configuration for deploying PaxiPM AI on Synology NAS or any Docker-compatible system.

---

## 📋 Prerequisites

1. Docker installed on your system
2. Docker Compose installed
3. OpenAI API key (optional, for full AI features)
4. Environment variables configured

---

## 🚀 Quick Start

### 1. Environment Configuration

Create `.env` file in project root:

```env
# Backend Configuration
PORT=5000
NODE_ENV=production
JWT_SECRET=your_strong_jwt_secret_here_change_in_production

# Database Configuration
DB_HOST=database
DB_PORT=3306
DB_NAME=paxipm
DB_USER=paxipm_user
DB_PASSWORD=your_secure_password_here
USE_SQLITE=false

# AI Engine Configuration
OPENAI_API_KEY=your_openai_api_key_here
AI_ENGINE_URL=http://ai-engine:8000

# API URL (for Swagger docs)
API_URL=http://localhost:5000
```

### 2. Build and Start Services

```bash
# Build all Docker images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (database data)
docker-compose down -v
```

---

## 🏗️ Services Overview

### 1. Database (MariaDB)
- **Container:** `paxipm-db`
- **Port:** `3306`
- **Volume:** `db_data` (persistent storage)
- **Schema:** Auto-imported from `backend/db/schema.sql`

### 2. Backend API
- **Container:** `paxipm-backend`
- **Port:** `5000`
- **Health Check:** `GET http://localhost:5000/`
- **API Docs:** `http://localhost:5000/api-docs`

### 3. AI Engine (FastAPI)
- **Container:** `paxipm-ai-engine`
- **Port:** `8000`
- **Health Check:** `GET http://localhost:8000/`

### 4. Frontend (React + Nginx)
- **Container:** `paxipm-frontend`
- **Port:** `80` (HTTP)
- **Access:** `http://localhost`

---

## 📂 Dockerfile Structure

### Backend Dockerfile
- Base: `node:18-alpine`
- Production dependencies only
- Health check included
- Exposes port 5000

### AI Engine Dockerfile
- Base: `python:3.11-slim`
- Installs Python dependencies
- Health check included
- Exposes port 8000

### Frontend Dockerfile
- Multi-stage build:
  - Stage 1: Build React app
  - Stage 2: Serve with Nginx
- Nginx configuration for SPA routing
- Static asset caching
- Exposes port 80

---

## 🔧 Configuration Details

### Database Setup

The database schema is automatically imported on first startup via:
```
volumes:
  - ./backend/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql:ro
```

### Network Configuration

All services are on the `paxipm-network` bridge network:
- Services communicate via service names (e.g., `database`, `backend`)
- Frontend accessible from host on port 80

### Health Checks

All services include health checks:
- **Database:** MariaDB health check script
- **Backend:** HTTP GET to root endpoint
- **AI Engine:** Python requests check
- **Frontend:** Nginx health check

---

## 🔍 Verification Steps

### 1. Check All Services Running

```bash
docker-compose ps
```

All services should show `Up` status.

### 2. Test Backend

```bash
curl http://localhost:5000/
# Should return: {"message":"PaxiPM AI Backend Running"}
```

### 3. Test AI Engine

```bash
curl http://localhost:8000/
# Should return: {"message":"PaxiPM AI Engine Running", "openai_configured": true/false}
```

### 4. Access API Documentation

Open browser: `http://localhost:5000/api-docs`

### 5. Access Frontend

Open browser: `http://localhost`

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check database logs
docker-compose logs database

# Restart database
docker-compose restart database

# Reset database (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d database
```

### Backend Not Starting

```bash
# Check backend logs
docker-compose logs backend

# Verify environment variables
docker-compose exec backend env | grep DB_

# Restart backend
docker-compose restart backend
```

### AI Engine Not Responding

```bash
# Check AI Engine logs
docker-compose logs ai-engine

# Verify OpenAI API key
docker-compose exec ai-engine env | grep OPENAI

# Test AI Engine directly
docker-compose exec ai-engine python -c "import openai; print('OK')"
```

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs frontend

# Verify nginx config
docker-compose exec frontend nginx -t

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

---

## 📊 Monitoring

### View All Logs

```bash
docker-compose logs -f
```

### View Specific Service Logs

```bash
docker-compose logs -f backend
docker-compose logs -f ai-engine
docker-compose logs -f database
docker-compose logs -f frontend
```

### Check Resource Usage

```bash
docker stats
```

---

## 🔒 Security Considerations

### Production Deployment

1. **Change Default Passwords:**
   - Update `DB_PASSWORD` in `.env`
   - Use strong `JWT_SECRET`

2. **Environment Variables:**
   - Never commit `.env` file
   - Use Docker secrets for production
   - Rotate API keys regularly

3. **Network Security:**
   - Use reverse proxy (Nginx/Traefik)
   - Enable HTTPS (Let's Encrypt)
   - Restrict database port exposure

4. **Container Security:**
   - Run as non-root user
   - Use minimal base images
   - Regular security updates

---

## 📦 Synology NAS Deployment

### Via Docker GUI

1. Open Synology Docker Manager
2. Import `docker-compose.yml`
3. Configure environment variables
4. Start containers

### Via SSH

```bash
# SSH into Synology NAS
ssh admin@your-nas-ip

# Navigate to project directory
cd /volume1/docker/paxipm-ai

# Start services
docker-compose up -d
```

---

## 🎯 Next Steps

1. ✅ Complete Phase 1: Docker deployment ✅
2. Configure production environment variables
3. Set up HTTPS/SSL certificates
4. Configure backup strategy for database
5. Set up monitoring and logging

---

## 📝 Notes

- Database data persists in `db_data` volume
- Frontend build artifacts are in Docker image
- Backend and AI Engine mount source code for development
- For production, remove volume mounts and use built images only


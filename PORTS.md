# PaxiPM AI - Fixed Port Configuration

## **🚨 IMPORTANT: PORTS MUST NOT BE CHANGED**

All servers must run with these **FIXED** ports from the **ROOT** directory.

---

## Server Ports

| Server | Port | URL | Command from Root |
|--------|------|-----|-------------------|
| **Frontend** | **3000** | http://localhost:3000 | `cd frontend && npm start` |
| **Backend** | **5000** | http://localhost:5000 | `cd backend && node app.js` |
| **AI Engine** | **8000** | http://localhost:8000 | `cd ai_engine && python main.py` |

---

## ✅ Startup Scripts (Use These!)

### Git Bash / Linux / Mac:
```bash
./start-all.sh
```

### Stop All Servers:
```bash
./stop-all.sh
```

---

## ⚠️ Rules

1. **NEVER change these ports**
2. **ALWAYS start from root directory**
3. **Use the startup scripts provided**
4. **Ports must match configuration files**

---

## Configuration Files

### Frontend Config:
- **File:** `frontend/src/config.js`
- **Port:** 5000 (backend URL)

### Backend Config:
- **File:** `backend/app.js`
- **Port:** 5000 (default)

### AI Engine Config:
- **File:** `ai_engine/main.py`
- **Port:** 8000 (default)

---

## Verification

After starting servers, verify all are running:

```bash
# Check all ports
curl http://localhost:3000  # Frontend
curl http://localhost:5000  # Backend
curl http://localhost:8000  # AI Engine
```

All should return HTTP 200 or valid responses.

---

**Last Updated:** Phase 3 Complete

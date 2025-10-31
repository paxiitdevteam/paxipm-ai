# PaxiPM AI - Port Configuration

## Fixed Ports (DO NOT CHANGE)

### Backend Server
- **Port**: `5000`
- **URL**: `http://localhost:5000`
- **Configuration**: Set in `.env` as `PORT=5000`
- **Default**: If `PORT` not set in `.env`, defaults to `5000`

### Frontend Server
- **Port**: `3000`
- **URL**: `http://localhost:3000`
- **Configuration**: React default port (can be set via `PORT` environment variable)
- **Default**: `3000` (React default)

### AI Engine Server
- **Port**: `8000`
- **URL**: `http://localhost:8000`
- **Configuration**: Set in `ai_engine/main.py` and `.env` as `AI_ENGINE_URL`
- **Default**: `8000`

## Configuration Files

### Backend
- `.env` in project root: `PORT=5000`
- `backend/app.js`: Uses `process.env.PORT || 5000`

### Frontend
- `frontend/src/config.js`: Uses `process.env.REACT_APP_API_URL || "http://localhost:5000"`
- All frontend pages import and use `config.API_BASE_URL` instead of hardcoded URLs

### AI Engine
- `.env` in project root: `AI_ENGINE_URL=http://localhost:8000`
- `ai_engine/main.py`: Uses port `8000` by default

## Important Notes

1. **DO NOT** change port numbers in code - use environment variables
2. **DO NOT** hardcode URLs - always use `config.API_BASE_URL` in frontend
3. If ports need to change, update:
   - `.env` file for backend/AI engine
   - `frontend/src/config.js` for frontend (or use `REACT_APP_API_URL` env var)
4. All ports are fixed and stable - they will not change automatically


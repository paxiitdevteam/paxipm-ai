#!/bin/bash

# PaxiPM AI - Start All Servers from Root (Git Bash Compatible)
# Fixed Ports: Frontend (3000), Backend (5000), AI Engine (8000)

echo "🚀 Starting PaxiPM AI - All Servers"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill any existing processes on these ports (Git Bash compatible)
echo -e "${YELLOW}Checking for existing processes...${NC}"
# Try lsof first, if not available use netstat (Windows Git Bash)
if command -v lsof >/dev/null 2>&1; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    lsof -ti:5000 | xargs kill -9 2>/dev/null
    lsof -ti:8000 | xargs kill -9 2>/dev/null
else
    # Windows Git Bash: use netstat and taskkill
    for port in 3000 5000 8000; do
        netstat -ano | grep ":$port " | grep LISTENING | awk '{print $5}' | xargs kill -9 2>/dev/null || true
    done
fi
sleep 2

# Create logs directory if it doesn't exist (must be before redirects)
mkdir -p logs

# Start Backend (Port 5000)
echo -e "${GREEN}Starting Backend on port 5000...${NC}"
cd backend
node app.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "Backend PID: $BACKEND_PID"
sleep 3

# Start AI Engine (Port 8000)
echo -e "${GREEN}Starting AI Engine on port 8000...${NC}"
cd ai_engine
python main.py > ../logs/ai_engine.log 2>&1 &
AI_ENGINE_PID=$!
cd ..
echo "AI Engine PID: $AI_ENGINE_PID"
sleep 3

# Start Frontend (Port 3000)
echo -e "${GREEN}Starting Frontend on port 3000...${NC}"
cd frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "Frontend PID: $FRONTEND_PID"
sleep 5

# Save PIDs to file
echo "$BACKEND_PID" > logs/backend.pid
echo "$AI_ENGINE_PID" > logs/ai_engine.pid
echo "$FRONTEND_PID" > logs/frontend.pid

# Wait a bit and check if servers are running
sleep 5

echo ""
echo "===================================="
echo -e "${GREEN}Server Status:${NC}"
echo "===================================="

# Check Backend
if curl -s http://localhost:5000 > /dev/null; then
    echo -e "${GREEN}✅ Backend: http://localhost:5000${NC}"
else
    echo -e "${RED}❌ Backend: Not responding${NC}"
fi

# Check AI Engine
if curl -s http://localhost:8000 > /dev/null; then
    echo -e "${GREEN}✅ AI Engine: http://localhost:8000${NC}"
else
    echo -e "${RED}❌ AI Engine: Not responding${NC}"
fi

# Check Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend: http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend: Not responding${NC}"
fi

echo ""
echo "===================================="
echo -e "${YELLOW}Servers are running in background${NC}"
echo "Check logs in: logs/"
echo "Stop servers: ./stop-all.sh"
echo "===================================="


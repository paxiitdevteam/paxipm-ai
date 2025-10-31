#!/bin/bash

# PaxiPM AI - Stop All Servers

echo "🛑 Stopping PaxiPM AI - All Servers"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill processes by PID files
if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    kill $BACKEND_PID 2>/dev/null && echo -e "${GREEN}✅ Backend stopped (PID: $BACKEND_PID)${NC}" || echo -e "${YELLOW}⚠️  Backend PID not found${NC}"
    rm -f logs/backend.pid
fi

if [ -f logs/ai_engine.pid ]; then
    AI_ENGINE_PID=$(cat logs/ai_engine.pid)
    kill $AI_ENGINE_PID 2>/dev/null && echo -e "${GREEN}✅ AI Engine stopped (PID: $AI_ENGINE_PID)${NC}" || echo -e "${YELLOW}⚠️  AI Engine PID not found${NC}"
    rm -f logs/ai_engine.pid
fi

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    kill $FRONTEND_PID 2>/dev/null && echo -e "${GREEN}✅ Frontend stopped (PID: $FRONTEND_PID)${NC}" || echo -e "${YELLOW}⚠️  Frontend PID not found${NC}"
    rm -f logs/frontend.pid
fi

# Also kill by ports (backup)
echo ""
echo -e "${YELLOW}Killing processes on ports 3000, 5000, 8000...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null

echo ""
echo -e "${GREEN}All servers stopped!${NC}"


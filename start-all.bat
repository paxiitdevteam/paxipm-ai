@echo off
REM PaxiPM AI - Start All Servers from Root (Windows)
REM Fixed Ports: Frontend (3000), Backend (5000), AI Engine (8000)

echo.
echo ====================================
echo   Starting PaxiPM AI - All Servers
echo ====================================
echo.

REM Create logs directory
if not exist logs mkdir logs

REM Kill existing processes on ports
echo Checking for existing processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 >nul

REM Start Backend (Port 5000)
echo Starting Backend on port 5000...
cd backend
start "PaxiPM Backend" cmd /k "node app.js"
cd ..
timeout /t 3 >nul

REM Start AI Engine (Port 8000)
echo Starting AI Engine on port 8000...
cd ai_engine
start "PaxiPM AI Engine" cmd /k "python main.py"
cd ..
timeout /t 3 >nul

REM Start Frontend (Port 3000)
echo Starting Frontend on port 3000...
cd frontend
start "PaxiPM Frontend" cmd /k "npm start"
cd ..
timeout /t 5 >nul

echo.
echo ====================================
echo   Servers Started
echo ====================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:5000
echo AI Engine: http://localhost:8000
echo.
echo Check the opened windows for server status
echo.
echo To stop servers, close the command windows or run: stop-all.bat
echo.
pause


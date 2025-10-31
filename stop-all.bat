@echo off
REM PaxiPM AI - Stop All Servers (Windows)

echo.
echo ====================================
echo   Stopping PaxiPM AI - All Servers
echo ====================================
echo.

REM Kill processes on ports
echo Stopping processes on ports 3000, 5000, 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do taskkill /F /PID %%a >nul 2>&1

REM Kill by window titles
taskkill /F /FI "WINDOWTITLE eq PaxiPM Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq PaxiPM AI Engine*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq PaxiPM Frontend*" >nul 2>&1

echo.
echo All servers stopped!
echo.
timeout /t 2 >nul


@echo off
title Campus Shield Launcher
echo ========================================================
echo           Starting Campus Shield Safety System
echo ========================================================
echo.

:: 1. Check if PostgreSQL port 5433 is listening
netstat -ano | findstr :5433 >nul
if %errorlevel% neq 0 (
    echo [1/3] Starting PostgreSQL Database...
    start /b "" "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "C:\Users\DELL\campus_shield_pgdata" -p 5433 > "%TEMP%\campus_shield_pg.log" 2>&1
    timeout /t 2 >nul
) else (
    echo [1/3] PostgreSQL is already running.
)

:: 2. Check if Backend port 5000 is listening
netstat -ano | findstr :5000 >nul
if %errorlevel% neq 0 (
    echo [2/3] Starting Node.js Backend Server...
    cd /d "%~dp0backend"
    start /b "" node server.js > "%TEMP%\campus_shield_node.log" 2>&1
    timeout /t 2 >nul
) else (
    echo [2/3] Backend server is already running.
)

:: 3. Open in browser
echo [3/3] Opening Campus Shield in browser...
start http://localhost:5000

echo.
echo ========================================================
echo   Campus Shield is running at: http://localhost:5000
echo ========================================================
echo.
pause

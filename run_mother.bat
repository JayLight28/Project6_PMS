@echo off
TITLE Project6_PMS - Mother HQ Dashboard
COLOR 0A

:: ======================================================
:: MOTHER HQ STARTUP SCRIPT (BACKEND + FRONTEND)
:: ======================================================

echo.
echo  [1/2] Setting up Debug Environment...
SET DEBUG=express:*,better-sqlite3:*
SET NODE_ENV=development

echo  [2/2] Launching Mother HQ Modules...
echo.

:: Start Backend Server (Express + SQLite)
echo  [BACKEND] Starting API Server on http://localhost:3001...
start "Mother_Backend" cmd /c "cd mother && node server.js"

:: Start Frontend Server (Vite + React)
echo  [FRONTEND] Starting Vite Dev Server...
start "Mother_Frontend" cmd /c "cd mother && npm run dev -- --debug"

echo.
echo  ======================================================
echo  SUCCESS: Mother HQ is running in separate windows.
echo  - Backend: http://localhost:3001
echo  - Frontend: Check Vite output for port (usually 5173)
echo  ======================================================
echo.
pause

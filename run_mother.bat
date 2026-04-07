@echo off
TITLE Project6_PMS - Mother HQ Dashboard
COLOR 0A

cd /d "%~dp0mother" || (echo Error: Cannot find mother folder && pause && exit /b 1)

SET DEBUG=express:*,better-sqlite3:*
SET NODE_ENV=development

echo.
echo  [BACKEND] Starting API Server on http://localhost:3001...
start /b npm run server

echo  [FRONTEND] Starting Vite Dev Server on port 5173...
echo.
npm run dev

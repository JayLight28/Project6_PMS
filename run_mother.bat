@echo off
TITLE Project6_PMS - Mother HQ Dashboard
COLOR 0A

cd /d "%~dp0mother" || (echo Error: Cannot find mother folder && pause && exit /b 1)

SET DEBUG=express:*,better-sqlite3:*
SET NODE_ENV=development

echo.
npm run dev

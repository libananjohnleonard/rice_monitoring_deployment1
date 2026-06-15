@echo off
title Rice Plant Health Monitor

cd /d "%~dp0"

echo Starting Rice Plant Health Monitor...
echo.
echo Project folder:
echo %CD%
echo.
echo This window must stay open while you are using the system.
echo Close this window to stop the server.
echo.

echo Checking PostgreSQL database service...
powershell -NoProfile -Command "$svc = Get-Service postgresql-x64-18 -ErrorAction SilentlyContinue; if (-not $svc) { exit 2 }; if ($svc.Status -ne 'Running') { Start-Service postgresql-x64-18 -ErrorAction Stop; Start-Sleep -Seconds 2 }; $svc = Get-Service postgresql-x64-18; if ($svc.Status -eq 'Running') { exit 0 } else { exit 1 }"

if errorlevel 2 (
  echo.
  echo PostgreSQL service "postgresql-x64-18" was not found.
  echo Please install PostgreSQL or update server\.env to use the correct database.
  echo.
  pause
  exit /b 1
)

if errorlevel 1 (
  echo.
  echo Could not start PostgreSQL.
  echo Right-click this file and choose "Run as administrator", then try again.
  echo.
  echo The app cannot fetch data until PostgreSQL is running.
  echo.
  pause
  exit /b 1
)

echo PostgreSQL is running.
echo.

npm run dev

echo.
echo Rice Plant Health Monitor has stopped.
pause

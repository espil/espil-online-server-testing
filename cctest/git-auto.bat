@echo off
REM Git auto-pull loop (Windows batch, no PowerShell needed)
REM Run from cctest folder: git-auto.bat

echo Git auto-update started (every 10 seconds)
echo Press Ctrl+C to stop
echo.

:loop
git fetch origin local-testing --quiet
for /f %%i in ('git rev-parse HEAD') do set LOCAL=%%i
for /f %%i in ('git rev-parse origin/local-testing') do set REMOTE=%%i
if not "%LOCAL%"=="%REMOTE%" (
    echo [%time%] Update found! Pulling...
    git pull origin local-testing --quiet
    echo [%time%] Done!
)
timeout /t 10 /nobreak >nul
goto loop

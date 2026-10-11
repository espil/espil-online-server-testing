@echo off
setlocal
set SCRIPT_DIR=%~dp0

where py >nul 2>nul
if %errorlevel%==0 (
  py "%SCRIPT_DIR%pixel_lab.py" serve
  exit /b %errorlevel%
)

where python >nul 2>nul
if %errorlevel%==0 (
  python "%SCRIPT_DIR%pixel_lab.py" serve
  exit /b %errorlevel%
)

echo Python was not found.
echo Install Python 3.11+ and then run:
echo   py -m pip install -r "%SCRIPT_DIR%requirements.txt"
echo   "%SCRIPT_DIR%run_pixel_lab.bat"
exit /b 1

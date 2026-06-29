@echo off
setlocal
set SCRIPT_DIR=%~dp0
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%run-mobile.ps1" %*
pause
exit /b %ERRORLEVEL%

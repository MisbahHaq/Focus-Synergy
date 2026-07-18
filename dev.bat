@echo off
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
cd /d "%~dp0"
call npm run tauri dev

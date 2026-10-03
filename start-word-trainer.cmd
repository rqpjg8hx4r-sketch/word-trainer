@echo off
setlocal
cd /d "%~dp0"
set "WORD_TRAINER_PORT=8765"

where node >nul 2>nul
if not errorlevel 1 (
  set "WORD_TRAINER_NODE=node"
  goto launch
)
set "WORD_TRAINER_NODE=C:\Users\jaywu\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%WORD_TRAINER_NODE%" goto launch
echo Node.js was not found. Install Node.js, then run this file again.
pause
exit /b 1

:launch
"%WORD_TRAINER_NODE%" scripts\start-preview.js
if errorlevel 1 (
  pause
  exit /b 1
)
start "" "http://127.0.0.1:8765/index.html"
exit /b 0

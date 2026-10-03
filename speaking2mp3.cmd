@echo off
setlocal

if not "%~2"=="" goto usage

set "SPEAKING2MP3_ROOT=%~dp0"
set "SPEAKING2MP3_PROJECT=%SPEAKING2MP3_ROOT%"
if "%~1"=="" goto all_missing

set "SPEAKING_DAY=%~1"
echo(%SPEAKING_DAY%| %SystemRoot%\System32\findstr.exe /r /x "[0-9][0-9][0-9]" >nul
if errorlevel 1 goto invalid_day

set "SPEAKING2MP3_INPUT=english\speaking\speaking%SPEAKING_DAY%.txt"

if not exist "%SPEAKING2MP3_PROJECT%\%SPEAKING2MP3_INPUT%" (
  echo Input file not found: %SPEAKING2MP3_PROJECT%\%SPEAKING2MP3_INPUT%
  exit /b 2
)

pushd "%SPEAKING2MP3_PROJECT%" >nul
if errorlevel 1 (
  echo Cannot open project directory: %SPEAKING2MP3_PROJECT%
  exit /b 4
)

call npm run audio:speaking -- "%SPEAKING2MP3_INPUT%"
set "SPEAKING2MP3_EXIT=%ERRORLEVEL%"
popd >nul
exit /b %SPEAKING2MP3_EXIT%

:all_missing
pushd "%SPEAKING2MP3_PROJECT%" >nul
if errorlevel 1 (
  echo Cannot open project directory: %SPEAKING2MP3_PROJECT%
  exit /b 4
)
call npm run audio:speaking-missing
set "SPEAKING2MP3_EXIT=%ERRORLEVEL%"
popd >nul
exit /b %SPEAKING2MP3_EXIT%

:invalid_day
echo Invalid Day: %SPEAKING_DAY%. Use exactly three digits, for example: speaking2mp3 014
exit /b 1

:usage
echo Usage: speaking2mp3 [014]
echo Without a day, generates every missing or stale speaking MP3.
exit /b 1

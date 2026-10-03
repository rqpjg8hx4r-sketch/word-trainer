@echo off
setlocal

if not "%~2"=="" goto usage

set "WRITING2MP3_ROOT=%~dp0"
set "WRITING2MP3_PROJECT=%WRITING2MP3_ROOT%"
if "%~1"=="" goto all_missing

set "WRITING_DAY=%~1"
echo(%WRITING_DAY%| %SystemRoot%\System32\findstr.exe /r /x "[0-9][0-9][0-9]" >nul
if errorlevel 1 goto invalid_day

set "WRITING2MP3_INPUT=english\writing\writing%WRITING_DAY%.txt"

if not exist "%WRITING2MP3_PROJECT%\%WRITING2MP3_INPUT%" (
  echo Input file not found: %WRITING2MP3_PROJECT%\%WRITING2MP3_INPUT%
  exit /b 2
)

pushd "%WRITING2MP3_PROJECT%" >nul
if errorlevel 1 (
  echo Cannot open project directory: %WRITING2MP3_PROJECT%
  exit /b 4
)

call npm run audio:writing -- "%WRITING2MP3_INPUT%"
set "WRITING2MP3_EXIT=%ERRORLEVEL%"
popd >nul
exit /b %WRITING2MP3_EXIT%

:all_missing
pushd "%WRITING2MP3_PROJECT%" >nul
if errorlevel 1 (
  echo Cannot open project directory: %WRITING2MP3_PROJECT%
  exit /b 4
)
call npm run audio:writing-missing
set "WRITING2MP3_EXIT=%ERRORLEVEL%"
popd >nul
exit /b %WRITING2MP3_EXIT%

:invalid_day
echo Invalid Day: %WRITING_DAY%. Use exactly three digits, for example: writing2mp3 014
exit /b 1

:usage
echo Usage: writing2mp3 [014]
echo Without a day, generates every missing or stale writing MP3.
exit /b 1

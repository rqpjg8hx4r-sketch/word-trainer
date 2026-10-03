@echo off
setlocal

if not "%~2"=="" goto usage

set "PARAPHRASE2MP3_ROOT=%~dp0"
set "PARAPHRASE2MP3_PROJECT=%PARAPHRASE2MP3_ROOT%"
if "%~1"=="" goto all_missing

set "PARAPHRASE_DAY=%~1"
echo(%PARAPHRASE_DAY%| %SystemRoot%\System32\findstr.exe /r /x "[0-9][0-9][0-9]" >nul
if errorlevel 1 goto invalid_day

set "PARAPHRASE2MP3_INPUT=english\word\paraphrase%PARAPHRASE_DAY%.txt"
if not exist "%PARAPHRASE2MP3_PROJECT%\%PARAPHRASE2MP3_INPUT%" (
  echo Input file not found: %PARAPHRASE2MP3_PROJECT%\%PARAPHRASE2MP3_INPUT%
  exit /b 2
)

pushd "%PARAPHRASE2MP3_PROJECT%" >nul
if errorlevel 1 (
  echo Cannot open project directory: %PARAPHRASE2MP3_PROJECT%
  exit /b 4
)
call npm run audio:paraphrase -- "%PARAPHRASE2MP3_INPUT%"
set "PARAPHRASE2MP3_EXIT=%ERRORLEVEL%"
popd >nul
exit /b %PARAPHRASE2MP3_EXIT%

:all_missing
pushd "%PARAPHRASE2MP3_PROJECT%" >nul
if errorlevel 1 (
  echo Cannot open project directory: %PARAPHRASE2MP3_PROJECT%
  exit /b 4
)
call npm run audio:paraphrase-missing
set "PARAPHRASE2MP3_EXIT=%ERRORLEVEL%"
popd >nul
exit /b %PARAPHRASE2MP3_EXIT%

:invalid_day
echo Invalid Day: %PARAPHRASE_DAY%. Use exactly three digits, for example: paraphrase2mp3 014
exit /b 1

:usage
echo Usage: paraphrase2mp3 [014]
echo Without a day, generates every missing or stale paraphrase MP3.
exit /b 1

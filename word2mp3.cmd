@echo off
setlocal

if not "%~2"=="" goto usage

set "WORD2MP3_ROOT=%~dp0"
set "WORD2MP3_PROJECT=%WORD2MP3_ROOT%"
if "%~1"=="" goto all_missing

set "WORD_DAY=%~1"
echo(%WORD_DAY%| %SystemRoot%\System32\findstr.exe /r /x "[0-9][0-9][0-9]" >nul
if errorlevel 1 goto invalid_day

set "WORD2MP3_INPUT=english\word\word%WORD_DAY%.txt"

if not exist "%WORD2MP3_PROJECT%\%WORD2MP3_INPUT%" (
  echo Input file not found: %WORD2MP3_PROJECT%\%WORD2MP3_INPUT%
  exit /b 2
)

pushd "%WORD2MP3_PROJECT%" >nul
if errorlevel 1 (
  echo Cannot open project directory: %WORD2MP3_PROJECT%
  exit /b 4
)

call npm run audio:words -- "%WORD2MP3_INPUT%"
set "WORD2MP3_EXIT=%ERRORLEVEL%"
popd >nul
exit /b %WORD2MP3_EXIT%

:all_missing
pushd "%WORD2MP3_PROJECT%" >nul
if errorlevel 1 (
  echo Cannot open project directory: %WORD2MP3_PROJECT%
  exit /b 4
)
call npm run audio:missing
set "WORD2MP3_EXIT=%ERRORLEVEL%"
popd >nul
exit /b %WORD2MP3_EXIT%

:invalid_day
echo Invalid Day: %WORD_DAY%. Use exactly three digits, for example: word2mp3 010
exit /b 1

:usage
echo Usage: word2mp3 [010]
echo Without a day, generates every missing word MP3.
exit /b 1

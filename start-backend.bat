@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   UniGrade - University Examination System Backend
echo ===================================================
echo Make sure MySQL is running on localhost:3306.
echo.

set "PHP_BIN="

REM 1. Check system PATH
where php >nul 2>nul
if %errorlevel% equ 0 (
    set "PHP_BIN=php"
    goto :start_server
)

REM 2. Check standard locations
if exist "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" (
    set "PHP_BIN=C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
    goto :start_server
)
if exist "C:\xampp\php\php.exe" (
    set "PHP_BIN=C:\xampp\php\php.exe"
    goto :start_server
)
if exist "D:\xampp\php\php.exe" (
    set "PHP_BIN=D:\xampp\php\php.exe"
    goto :start_server
)
if exist "C:\php\php.exe" (
    set "PHP_BIN=C:\php\php.exe"
    goto :start_server
)
if exist "D:\php\php.exe" (
    set "PHP_BIN=D:\php\php.exe"
    goto :start_server
)

:prompt_user
echo [!] PHP was not detected automatically.
echo.
echo To run the backend, PHP 8+ is required.
echo If you installed PHP or XAMPP in a custom folder, enter the path to php.exe:
echo Example: C:\xampp\php\php.exe  or  C:\php\php.exe
echo.
set /p PHP_BIN="Path to php.exe: "

if "%PHP_BIN%"=="" (
    echo [ERROR] No path provided.
    echo Please install PHP or XAMPP and run this script again.
    pause
    exit /b 1
)

:start_server
if not exist "%PHP_BIN%" (
    where %PHP_BIN% >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Cannot find: %PHP_BIN%
        pause
        exit /b 1
    )
)

echo Starting PHP development server on http://localhost:8000 ...
echo Directory: %~dp0backend
echo Using php.ini: %~dp0php.ini
echo Press CTRL+C to stop the server.
echo.

"%PHP_BIN%" -c "%~dp0php.ini" -S localhost:8000 -t "%~dp0backend" "%~dp0backend\index.php"
pause

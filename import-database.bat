@echo off
setlocal enabledelayedexpansion
echo =======================================================
echo   UniGrade — Fresh Database Setup (Clean Install)
echo =======================================================
echo.

set "MYSQL_PATH="

REM Check PATH first
where mysql >nul 2>nul
if %errorlevel% equ 0 (
    for /f "delims=" %%I in ('where mysql') do (
        if not defined MYSQL_PATH set "MYSQL_PATH=%%I"
    )
)

REM Check typical installation paths
if not defined MYSQL_PATH if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set "MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not defined MYSQL_PATH if exist "D:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set "MYSQL_PATH=D:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not defined MYSQL_PATH if exist "C:\xampp\mysql\bin\mysql.exe" set "MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe"
if not defined MYSQL_PATH if exist "D:\xampp\mysql\bin\mysql.exe" set "MYSQL_PATH=D:\xampp\mysql\bin\mysql.exe"

if not defined MYSQL_PATH (
    echo [!] mysql.exe was not detected automatically.
    echo Please enter the full path to mysql.exe:
    set /p MYSQL_PATH="Path: "
)

if not exist "!MYSQL_PATH!" (
    echo [ERROR] mysql.exe not found at: "!MYSQL_PATH!"
    echo Please verify your MySQL or XAMPP installation.
    pause
    exit /b 1
)

echo Found MySQL at: "!MYSQL_PATH!"
echo.
set /p MYSQL_USER=Enter MySQL username [default: root]: 
if "%MYSQL_USER%"=="" set "MYSQL_USER=root"

echo.
echo Please enter your MySQL password (leave blank and press Enter if none):
echo.

"!MYSQL_PATH!" -u %MYSQL_USER% -p < "%~dp0database\fresh_install.sql"

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo   [SUCCESS] unigrade_db was created and configured!
    echo   Clean tables are ready for your live demonstration.
    echo   Initial Admin Account:
    echo     Email:    admin@unigrade.edu
    echo     Password: Admin@123
    echo =======================================================
) else (
    echo.
    echo [ERROR] Failed to import database. Check your password and try again.
)

echo.
pause

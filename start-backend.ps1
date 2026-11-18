# UniGrade - Start Backend Server (PowerShell)
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  UniGrade - University Examination Backend Server" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Make sure MySQL is running on localhost:3306.`n"

$phpPath = $null

# 1. Check system PATH
if (Get-Command php -ErrorAction SilentlyContinue) {
    $phpPath = "php"
}
# 2. Check Winget location
elseif (Test-Path "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe") {
    $phpPath = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
}
# 3. Check common paths
elseif (Test-Path "C:\xampp\php\php.exe") {
    $phpPath = "C:\xampp\php\php.exe"
}
elseif (Test-Path "D:\xampp\php\php.exe") {
    $phpPath = "D:\xampp\php\php.exe"
}
elseif (Test-Path "C:\php\php.exe") {
    $phpPath = "C:\php\php.exe"
}
elseif (Test-Path "D:\php\php.exe") {
    $phpPath = "D:\php\php.exe"
}
else {
    Write-Host "[!] PHP was not detected automatically." -ForegroundColor Yellow
    Write-Host "To run the backend, PHP 8+ is required."
    $userInput = Read-Host "Path to php.exe (e.g. C:\xampp\php\php.exe)"
    if ($userInput -and (Test-Path $userInput)) {
        $phpPath = $userInput
    } else {
        Write-Host "[ERROR] Valid php.exe not found." -ForegroundColor Red
        exit 1
    }
}

$iniPath = Join-Path $PSScriptRoot "php.ini"
$backendDir = Join-Path $PSScriptRoot "backend"

Write-Host "Starting PHP server on http://localhost:8000 using $phpPath..." -ForegroundColor Green
Write-Host "Config: $iniPath" -ForegroundColor DarkGray
Write-Host "Press Ctrl+C to stop.`n"

$routerScript = Join-Path $backendDir "index.php"
& $phpPath -c $iniPath -S localhost:8000 -t $backendDir $routerScript

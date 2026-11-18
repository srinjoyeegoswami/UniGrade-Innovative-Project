# Setup php.ini for PHP 8.3
$phpDir = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe"
$iniFile = Join-Path $phpDir "php.ini"
$devFile = Join-Path $phpDir "php.ini-development"

if (-not (Test-Path $iniFile)) {
    Write-Host "Creating php.ini from php.ini-development..."
    Copy-Item $devFile $iniFile
}

Write-Host "Enabling extensions in php.ini..."
$content = Get-Content $iniFile -Raw

# Set extension_dir to absolute ext path
$extDir = Join-Path $phpDir "ext"
$content = $content -replace ';extension_dir = "ext"', "extension_dir = `"$extDir`""
$content = $content -replace ';extension_dir = "ext"', "extension_dir = `"$extDir`""
$content = $content -replace ';?extension=pdo_mysql', "extension=pdo_mysql"
$content = $content -replace ';?extension=mysqli', "extension=mysqli"
$content = $content -replace ';?extension=openssl', "extension=openssl"
$content = $content -replace ';?extension=mbstring', "extension=mbstring"
$content = $content -replace ';?extension=curl', "extension=curl"

Set-Content $iniFile $content -NoNewline
Write-Host "php.ini configured successfully!"


@echo off
echo ===================================================
echo   UniGrade — University Examination System Frontend
echo ===================================================
cd /d "%~dp0frontend"
if not exist node_modules (
    echo Installing node dependencies...
    call npm install
)
echo Starting Vite development server on http://localhost:5173 ...
call npm run dev
pause


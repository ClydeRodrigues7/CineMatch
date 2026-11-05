@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   CineMatch - Movie Discovery and DSA Lab
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is required. Install Node.js 20.19+ or 22.12+, then run this file again.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

node -e "const [major,minor]=process.versions.node.split('.').map(Number); process.exit((major===20 && minor>=19) || (major>=22 && (major>22 || minor>=12)) ? 0 : 1)"
if errorlevel 1 (
    echo ERROR: This project needs Node.js 20.19+ or 22.12+.
    echo Install a supported version from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm was not found. Reinstall Node.js with npm enabled and try again.
    pause
    exit /b 1
)

where gcc >nul 2>nul
if errorlevel 1 (
    echo ERROR: GCC is required to compile the C data-structure backend.
    echo Install MinGW-w64 or MSYS2 UCRT64 GCC and add its bin folder to PATH.
    echo Then open a new terminal and run this file again.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing CineMatch dependencies. This may take a few minutes...
    call npm install
    if errorlevel 1 (
        echo ERROR: Dependency installation failed.
        pause
        exit /b 1
    )
)

echo Starting the C backend and web application in separate windows...
start "CineMatch C Backend" /D "%~dp0" cmd /k "npm run dev:backend"
timeout /t 2 /nobreak >nul
start "CineMatch Frontend" /D "%~dp0" cmd /k "npm run dev -- --host 127.0.0.1"

echo Waiting for the development servers to start...
timeout /t 5 /nobreak >nul
start "" "http://127.0.0.1:5173"

echo.
echo CineMatch should open at http://127.0.0.1:5173
echo Keep both CineMatch terminal windows open while using the app.
echo Close those windows to stop the frontend and C backend.
echo.
pause

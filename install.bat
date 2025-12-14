@echo off
chcp 65001 >nul
cls

echo.
echo   ███╗   ███╗██╗███████╗███████╗██╗   ██╗
echo   ████╗ ████║██║██╔════╝╚══███╔╝██║   ██║
echo   ██╔████╔██║██║███████╗  ███╔╝ ██║   ██║
echo   ██║╚██╔╝██║██║╚════██║ ███╔╝  ██║   ██║
echo   ██║ ╚═╝ ██║██║███████║███████╗╚██████╔╝
echo   ╚═╝     ╚═╝╚═╝╚══════╝╚══════╝ ╚═════╝
echo.
echo   [96m🚀 AUTOMATISCHE INSTALLATION[0m
echo   [93m📦 Installiert Dependencies und startet Server[0m
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [91m❌ Node.js nicht gefunden![0m
    echo [93mBitte installiere Node.js von https://nodejs.org/[0m
    pause
    exit /b 1
)

:: Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [91m❌ npm nicht gefunden![0m
    pause
    exit /b 1
)

echo [96m📋 Node.js Version:[0m
node --version
echo.
echo [96m📋 npm Version:[0m
npm --version
echo.

:: Install dependencies
echo [96m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m
echo [92m📦 Installiere Dependencies...[0m
echo [96m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m
echo.

npm install

if %errorlevel% neq 0 (
    echo.
    echo [91m❌ Installation fehlgeschlagen![0m
    pause
    exit /b 1
)

echo.
echo [92m✅ Dependencies erfolgreich installiert![0m
echo.

:: Create .env.local if not exists
if not exist ".env.local" (
    echo [96m⚙️  Erstelle .env.local...[0m
    (
        echo # MISZU Workflow - Local Environment
        echo NEXT_PUBLIC_APP_NAME=MISZU Workflow
        echo NEXT_PUBLIC_APP_URL=http://localhost:3000
        echo.
        echo # Feature Flags
        echo NEXT_PUBLIC_ENABLE_VOICE=true
        echo NEXT_PUBLIC_ENABLE_LOCAL_STORAGE=true
        echo NEXT_PUBLIC_ENABLE_CLOUD_SYNC=false
        echo NEXT_PUBLIC_ENABLE_PREMIUM_NODES=false
        echo.
        echo # Development
        echo NODE_ENV=development
        echo NEXT_TELEMETRY_DISABLED=1
    ) > .env.local
    echo [92m✅ .env.local erstellt![0m
    echo.
)

:: Show network info
echo [96m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m
echo [93m📡 Netzwerk-Informationen:[0m
echo [96m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m
echo.
echo [96mLokal:[0m    http://localhost:3000
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    set "ip=%%a"
    setlocal enabledelayedexpansion
    set "ip=!ip: =!"
    echo [96mLAN:[0m      http://!ip!:3000
    endlocal
)
echo.

:: Start dev server
echo [96m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m
echo [92m🚀 Starte Development Server...[0m
echo [96m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m
echo.
echo [93m💡 Server stoppt mit Strg+C[0m
echo [93m💡 Browser öffnet automatisch...[0m
echo.

:: Wait 3 seconds then open browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

:: Start dev server
npm run dev

pause

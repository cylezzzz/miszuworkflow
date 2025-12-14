@echo off
:: MISZU Workflow - Quick Start
:: Doppelklick zum Starten!

cd /d "%~dp0"
cls

echo.
echo   [96m================================[0m
echo   [92m  MISZU Workflow - Quick Start[0m
echo   [96m================================[0m
echo.
echo   [93mStarte Development Server...[0m
echo.

:: Check if node_modules exists
if not exist "node_modules\" (
    echo   [91mnode_modules nicht gefunden![0m
    echo   [93mInstalliere Dependencies...[0m
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo   [91mInstallation fehlgeschlagen![0m
        pause
        exit /b 1
    )
    echo.
)

:: Start server
echo   [92m🚀 Server startet...[0m
echo   [93m💡 Browser öffnet in 3 Sekunden...[0m
echo   [93m💡 Zum Beenden: Strg+C drücken[0m
echo.

timeout /t 3 /nobreak >nul
start http://localhost:3000

npm run dev

pause

@echo off
chcp 65001 >nul
cls

echo.
echo   [96m================================[0m
echo   [92m  MISZU Workflow - UI UPDATE[0m
echo   [96m================================[0m
echo.

set "DOWNLOADS=C:\Users\cylez\Downloads"
set "PROJECT=%~dp0"

echo   [93m📂 Downloads: %DOWNLOADS%[0m
echo   [93m📂 Projekt:   %PROJECT%[0m
echo.

:: Backup old globals.css
if exist "%PROJECT%src\app\globals.css" (
    echo   [96m💾 Sichere alte globals.css...[0m
    copy "%PROJECT%src\app\globals.css" "%PROJECT%src\app\globals.css.backup" >nul 2>&1
    echo   [92m   ✓ Backup erstellt: globals.css.backup[0m
)

:: Update globals.css
echo.
echo   [96m📝 Aktualisiere globals.css...[0m
if exist "%DOWNLOADS%\globals-UPDATED.css" (
    copy "%DOWNLOADS%\globals-UPDATED.css" "%PROJECT%src\app\globals.css" /Y >nul 2>&1
    if errorlevel 1 (
        echo   [91m   ✗ Fehler beim Kopieren![0m
    ) else (
        echo   [92m   ✓ globals.css aktualisiert[0m
    )
) else (
    echo   [91m   ✗ globals-UPDATED.css nicht in Downloads gefunden![0m
)

:: Create layout folder if not exists
if not exist "%PROJECT%src\components\layout\" (
    echo.
    echo   [96m📁 Erstelle layout Ordner...[0m
    mkdir "%PROJECT%src\components\layout" >nul 2>&1
    echo   [92m   ✓ Ordner erstellt[0m
)

:: Update components
echo.
echo   [96m⚛️  Aktualisiere Components...[0m

if exist "%DOWNLOADS%\node-registry.tsx" (
    copy "%DOWNLOADS%\node-registry.tsx" "%PROJECT%src\components\dashboard\" /Y >nul 2>&1
    echo   [92m   ✓ node-registry.tsx[0m
) else (
    echo   [91m   ✗ node-registry.tsx nicht gefunden[0m
)

if exist "%DOWNLOADS%\inspector.tsx" (
    copy "%DOWNLOADS%\inspector.tsx" "%PROJECT%src\components\dashboard\" /Y >nul 2>&1
    echo   [92m   ✓ inspector.tsx[0m
) else (
    echo   [91m   ✗ inspector.tsx nicht gefunden[0m
)

if exist "%DOWNLOADS%\header.tsx" (
    copy "%DOWNLOADS%\header.tsx" "%PROJECT%src\components\layout\" /Y >nul 2>&1
    echo   [92m   ✓ header.tsx[0m
) else (
    echo   [91m   ✗ header.tsx nicht gefunden[0m
)

:: Copy scripts
echo.
echo   [96m📜 Aktualisiere Scripts...[0m

if exist "%DOWNLOADS%\install.bat" (
    copy "%DOWNLOADS%\install.bat" "%PROJECT%" /Y >nul 2>&1
    echo   [92m   ✓ install.bat[0m
)

if exist "%DOWNLOADS%\START.bat" (
    copy "%DOWNLOADS%\START.bat" "%PROJECT%" /Y >nul 2>&1
    echo   [92m   ✓ START.bat[0m
)

:: Summary
echo.
echo   [96m================================[0m
echo   [92m  ✅ UPDATE ABGESCHLOSSEN![0m
echo   [96m================================[0m
echo.
echo   [93m📋 Nächste Schritte:[0m
echo.
echo   [96m1. Server neu starten:[0m
echo      npm run dev
echo.
echo   [96m2. Browser neu laden:[0m
echo      Strg + Shift + R
echo.
echo   [93m💡 Du solltest jetzt eine ultra-scharfe UI sehen![0m
echo.

pause

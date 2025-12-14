@echo off
chcp 65001 >nul
cls

echo.
echo   [96m================================[0m
echo   [92m  PostCSS Plugin Fix[0m
echo   [96m================================[0m
echo.
echo   [93mInstalliere @tailwindcss/postcss...[0m
echo.

:: Install the PostCSS plugin
npm install -D @tailwindcss/postcss

if errorlevel 1 (
    echo.
    echo   [91m❌ Installation fehlgeschlagen![0m
    pause
    exit /b 1
)

echo.
echo   [92m✅ Plugin installiert![0m
echo.
echo   [96mAktualisiere postcss.config...[0m
echo.

:: Create/Update postcss.config.mjs
(
echo /** @type {import('postcss-load-config'^).Config} */
echo const config = {
echo   plugins: {
echo     '@tailwindcss/postcss': {},
echo   },
echo };
echo.
echo export default config;
) > postcss.config.mjs

echo   [92m✅ Config aktualisiert![0m
echo.
echo   [96m================================[0m
echo   [92m  FIX ABGESCHLOSSEN![0m
echo   [96m================================[0m
echo.
echo   [93mStarte Server neu:[0m
echo   npm run dev
echo.

pause

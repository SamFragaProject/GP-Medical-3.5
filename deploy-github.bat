@echo off
echo ==========================================
echo   🚀 Deploy a Vercel via GitHub
echo ==========================================
echo.

cd "%~dp0"

echo 📤 Subiendo cambios a GitHub...
git add -A
git commit -m "Deploy: Production ready build"
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error al subir a GitHub
    echo ℹ️  Verifica que tengas configurado el remote de GitHub
    pause
    exit /b 1
)

echo.
echo ✅ Cambios subidos a GitHub
echo 🌐 Vercel debería hacer deploy automático en unos segundos
echo.
echo ℹ️  Ve a tu dashboard de Vercel para ver el progreso:
echo    https://vercel.com/dashboard
echo.
pause

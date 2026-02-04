@echo off
chcp 65001 >nul
title 🚀 GPMedical - Despliegue Vercel

echo ==========================================
echo   🏥 GPMedical - Despliegue a Vercel
echo ==========================================
echo.

:: Verificar si estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: No se encontró package.json
    echo ℹ️  Asegúrate de ejecutar este script desde erp-medico-frontend
    pause
    exit /b 1
)

echo 📁 Directorio: %CD%
echo.

:: Verificar si Vercel CLI está instalado
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Vercel CLI no encontrado. Instalando...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Error instalando Vercel CLI
        echo ℹ️  Intenta ejecutar manualmente: npm install -g vercel
        pause
        exit /b 1
    )
    echo ✅ Vercel CLI instalado
) else (
    echo ✅ Vercel CLI encontrado
)

echo.
echo ==========================================
echo   🚀 Iniciando despliegue a Vercel...
echo ==========================================
echo.
echo ℹ️  Si es la primera vez, se te pedirá:
echo    1. Login con tu cuenta de Vercel
echo    2. Vincular el proyecto
echo    3. Confirmar el despliegue
echo.
pause

echo.
echo 🚀 Ejecutando: vercel --prod
echo.
vercel --prod

if %errorlevel% neq 0 (
    echo.
    echo ❌ Despliegue fallido
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   ✅ ¡DESPLIEGUE COMPLETADO!
echo ==========================================
echo.
echo 🌐 Tu aplicación debería estar disponible en:
echo    https://gpmedical.vercel.app
echo.
echo ℹ️  Recuerda configurar las variables de entorno en:
echo    Dashboard de Vercel ^> Settings ^> Environment Variables
echo.
pause

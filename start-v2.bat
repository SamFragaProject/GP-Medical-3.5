@echo off
chcp 65001 >nul
cls

echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║           🚀 GPMEDICAL V2 - DESPLIEGUE LOCAL             ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Verificar que existe .env.local
if not exist ".env.local" (
    echo ⚠️  Archivo .env.local no encontrado
    echo 📋 Creando desde template...
    copy .env.local.example .env.local
    echo ⚠️  Por favor edita .env.local con tus credenciales de Supabase
    pause
    exit /b 1
)

echo 📦 Verificando dependencias...

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo 📥 Instalando dependencias por primera vez...
    call pnpm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
)

echo.
echo 🔍 Verificando React Query...
pnpm list @tanstack/react-query >nul 2>&1
if %errorlevel% neq 0 (
    echo 📥 Instalando React Query...
    call pnpm add @tanstack/react-query
    if %errorlevel% neq 0 (
        echo ❌ Error instalando React Query
        pause
        exit /b 1
    )
)

echo.
echo 🔍 Verificando React Query Devtools...
pnpm list @tanstack/react-query-devtools >nul 2>&1
if %errorlevel% neq 0 (
    echo 📥 Instalando React Query Devtools...
    call pnpm add -D @tanstack/react-query-devtools
    if %errorlevel% neq 0 (
        echo ❌ Error instalando Devtools
        pause
        exit /b 1
    )
)

echo.
echo ✅ Dependencias verificadas
echo.
echo 🎛️ Módulos V2 activos:
echo    • Auth V2: ✅ Refresh token + persistencia
echo    • Pacientes V2: ✅ Conexión real a Supabase
echo    • Agenda V2: ✅ Validaciones + realtime
echo    • Inventario V2: ✅ Alertas de stock
echo    • Facturación V2: ✅ CFDI + timbrado
echo    • Chatbot V2: ✅ OpenAI + inteligente
echo    • Reportes V2: ✅ Dashboard + gráficas
echo.
echo 🌐 Iniciando servidor de desarrollo...
echo    URL: http://localhost:5173
echo.
echo 📋 Comandos útiles:
echo    - Presiona Ctrl+C para detener
echo    - Abre http://localhost:5173 en tu navegador
echo    - React Query Devtools: Presiona F12 ^ Console
echo.

REM Iniciar Vite
pnpm dev

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error iniciando el servidor
    echo 🔧 Intenta ejecutar manualmente: pnpm dev
    pause
    exit /b 1
)

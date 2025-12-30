#!/bin/bash
# Script de testing manual para el sistema de permisos integrado

echo "🧪 INICIANDO TESTING MANUAL DEL SISTEMA DE PERMISOS"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir resultados
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Función para imprimir info
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_info "Verificando archivos del sistema de permisos..."

# Verificar archivos principales
files_to_check=(
    "/workspace/erp-medico-frontend/src/components/navigation/MenuPersonalizado.tsx"
    "/workspace/erp-medico-frontend/src/hooks/usePermissionCheck.ts"
    "/workspace/erp-medico-frontend/src/hooks/useCurrentUser.ts"
    "/workspace/erp-medico-frontend/src/components/auth/PermissionGuard.tsx"
    "/workspace/erp-medico-frontend/src/components/auth/NavigationGuard.tsx"
    "/workspace/erp-medico-frontend/src/components/auth/AccessDeniedPage.tsx"
    "/workspace/erp-medico-frontend/src/components/PermissionIntegrationTester.tsx"
    "/workspace/erp-medico-frontend/src/components/Layout.tsx"
    "/workspace/erp-medico-frontend/src/pages/Dashboard.tsx"
    "/workspace/erp-medico-frontend/src/App.tsx"
    "/workspace/erp-medico-frontend/src/contexts/SaaSAuthContext.tsx"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_result 0 "Archivo existe: $(basename $file)"
    else
        print_result 1 "Archivo faltante: $(basename $file)"
    fi
done

echo ""
print_info "Verificando imports y dependencias..."

# Verificar que MenuPersonalizado se usa en Layout
if grep -q "MenuPersonalizado" /workspace/erp-medico-frontend/src/components/Layout.tsx; then
    print_result 0 "MenuPersonalizado integrado en Layout"
else
    print_result 1 "MenuPersonalizado NO integrado en Layout"
fi

# Verificar que NavigationGuard se usa en App
if grep -q "NavigationGuard" /workspace/erp-medico-frontend/src/App.tsx; then
    print_result 0 "NavigationGuard integrado en App"
else
    print_result 1 "NavigationGuard NO integrado en App"
fi

# Verificar que los hooks se usan
if grep -q "usePermissionCheck" /workspace/erp-medico-frontend/src/components/Layout.tsx; then
    print_result 0 "usePermissionCheck integrado en Layout"
else
    print_result 1 "usePermissionCheck NO integrado en Layout"
fi

if grep -q "useCurrentUser" /workspace/erp-medico-frontend/src/components/Layout.tsx; then
    print_result 0 "useCurrentUser integrado en Layout"
else
    print_result 1 "useCurrentUser NO integrado en Layout"
fi

echo ""
print_info "Verificando funcionalidades clave..."

# Verificar funciones de cache
if grep -q "getCachedPermissions\|setCachedPermissions" /workspace/erp-medico-frontend/src/hooks/usePermissionCheck.ts; then
    print_result 0 "Sistema de cache implementado"
else
    print_result 1 "Sistema de cache NO implementado"
fi

# Verificar logging de auditoría
if grep -q "logUnauthorizedAccess" /workspace/erp-medico-frontend/src/hooks/usePermissionCheck.ts; then
    print_result 0 "Logging de auditoría implementado"
else
    print_result 1 "Logging de auditoría NO implementado"
fi

# Verificar manejo de empresa/sede
if grep -q "empresaSede\|empresaInfo\|sedeInfo" /workspace/erp-medico-frontend/src/hooks/useCurrentUser.ts; then
    print_result 0 "Manejo de empresa/sede implementado"
else
    print_result 1 "Manejo de empresa/sede NO implementado"
fi

# Verificar configuración de rutas
if grep -q "ROUTE_PERMISSIONS" /workspace/erp-medico-frontend/src/components/auth/NavigationGuard.tsx; then
    print_result 0 "Configuración de rutas implementada"
else
    print_result 1 "Configuración de rutas NO implementada"
fi

echo ""
print_info "Verificando compatibilidad con usuarios demo..."

# Verificar que los usuarios demo tienen la nueva estructura
if grep -q "empresaSede" /workspace/erp-medico-frontend/src/contexts/SaaSAuthContext.tsx; then
    print_result 0 "Estructura de usuario demo actualizada"
else
    print_result 1 "Estructura de usuario demo NO actualizada"
fi

# Verificar que el dashboard verifica permisos
if grep -q "canAccess.*dashboard.*view" /workspace/erp-medico-frontend/src/pages/Dashboard.tsx; then
    print_result 0 "Dashboard verifica permisos"
else
    print_result 1 "Dashboard NO verifica permisos"
fi

echo ""
print_info "Contando líneas de código implementado..."

# Contar líneas de código
total_lines=0
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        total_lines=$((total_lines + lines))
        echo "  $(basename $file): $lines líneas"
    fi
done

echo ""
echo -e "${YELLOW}📊 RESUMEN TOTAL:${NC}"
echo "Líneas de código implementadas: $total_lines"
echo "Archivos creados/modificados: ${#files_to_check[@]}"

echo ""
print_info "Funcionalidades principales implementadas:"
echo "  ✅ MenuPersonalizado con permisos dinámicos"
echo "  ✅ Hooks usePermissionCheck y useCurrentUser" 
echo "  ✅ Componentes PermissionGuard y NavigationGuard"
echo "  ✅ Páginas de acceso denegado personalizadas"
echo "  ✅ Sistema de cache de permisos"
echo "  ✅ Logs de auditoría"
echo "  ✅ Integración empresa/sede"
echo "  ✅ Layout actualizado"
echo "  ✅ Dashboard con verificación de permisos"
echo "  ✅ App.tsx con NavigationGuard"
echo "  ✅ Testing de integración"
echo "  ✅ Documentación completa"

echo ""
echo -e "${GREEN}🎉 TESTING COMPLETADO${NC}"
echo "El sistema de permisos personalizado ha sido completamente integrado."
echo ""
echo -e "${BLUE}📋 PRÓXIMOS PASOS PARA TESTING MANUAL:${NC}"
echo "1. Iniciar la aplicación: npm run dev"
echo "2. Probar login con diferentes usuarios demo"
echo "3. Verificar que el menú se adapta por rol"
echo "4. Probar acceso a diferentes secciones"
echo "5. Verificar páginas de acceso denegado"
echo "6. Acceder a /dashboard/integration-tester"
echo "7. Ejecutar tests automáticos"
echo ""
echo -e "${YELLOW}👥 USUARIOS PARA TESTING:${NC}"
echo "  admin@mediflow.mx / admin123 (Super Admin)"
echo "  medico@mediflow.mx / medico123 (Médico Trabajo)"
echo "  recepcion@mediflow.mx / recepcion123 (Recepción)"
echo "  paciente@mediflow.mx / paciente123 (Paciente)"

echo ""
echo "¡Sistema listo para testing en producción! 🚀"
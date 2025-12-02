// Exportaciones del sistema de permisos personalizado - SIMPLIFICADO PARA DEMO

// Componentes de permisos desde la ubicación correcta
export { PermissionGuard } from '../auth/PermissionGuard'
export { NavigationGuard } from '../auth/NavigationGuard'
export { AccessDeniedPage } from '../auth/AccessDeniedPage'
export { PermissionIntegrationTester } from '../PermissionIntegrationTester'

// Componentes de navegación
export { MenuPersonalizado, MenuHierarchyIndicator } from '../navigation/MenuPersonalizado'

// Hooks de permisos (simplificados para demo - siempre devuelven true)
export const usePermissionCheck = () => ({
  canAccess: () => true,
  canAccessMultiple: () => true,
  getUserPermissions: () => ['*'],
  invalidatePermissionsCache: () => {},
  logUnauthorizedAccess: () => Promise.resolve(),
  loading: false
})

export const useCurrentUser = () => ({
  currentUser: {
    id: 'demo-user',
    name: 'Usuario Demo',
    email: 'demo@mediflow.com',
    hierarchy: 'super_admin',
    empresa: { nombre: 'MediFlow Demo Corp' },
    sede: { nombre: 'Sede Principal' }
  },
  empresaInfo: { nombre: 'MediFlow Demo Corp' },
  sedeInfo: { nombre: 'Sede Principal' },
  loading: false,
  isSessionActive: () => true
})

// Nota: Todas las verificaciones de permisos devuelven true para modo demo
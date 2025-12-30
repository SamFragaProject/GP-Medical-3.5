// Hook para verificar permisos específicos del sistema personalizado
import { useState, useEffect, useCallback } from 'react'
// Mock user data - Sin autenticación
// Removed: useAuditLog - not needed in mock mode

interface PermissionOptions {
  hierarchy?: string[]
  enterpriseId?: string
  sedeId?: string
  context?: 'read' | 'write' | 'admin' | 'manage'
}

interface CachedPermissions {
  permissions: string[]
  timestamp: number
  enterpriseId: string
  sedeId?: string
}

const PERMISSION_CACHE_KEY = 'mediflow_permissions_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function usePermissionCheck() {
  // Mock user - Simular usuario autenticado
  const mockUser = {
    id: '1',
    email: 'demo@mediflow.mx',
    name: 'Usuario Demo',
    hierarchy: 'admin',
    enterpriseId: '1',
    sede: '1',
    permissions: ['*'],
    status: 'active'
  }

  // Mock hierarchy functions
  const mockGetUserHierarchy = () => 'admin'
  const mockHasRole = (role: string) => {
    if (role === 'super_admin') return false
    if (role === 'admin') return true
    if (role === 'admin_empresa') return true
    return false
  }
  const mockHasHierarchyRole = (roles: string[]) => {
    return roles.some(role => mockHasRole(role))
  }
  const mockHasPermission = (resource: string, action: string) => {
    if (mockUser.permissions.includes('*')) return true
    return mockUser.permissions.includes(`${resource}_${action}`)
  }

  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState<string[]>(['*'])

  // Mock functions replacing complex logic
  const getCachedPermissions = useCallback((): any => {
    // En modo demo, retornar datos mock
    return {
      permissions: ['*'],
      timestamp: Date.now(),
      enterpriseId: mockUser.enterpriseId,
      sedeId: mockUser.sede
    }
  }, [])

  const setCachedPermissions = useCallback((permissions: string[]) => {
    // En modo demo, solo log
    console.log('Mock: Guardando permisos en cache')
  }, [])

  // Mock hierarchy based permissions
  const getHierarchyBasedPermissions = useCallback((): string[] => {
    // Retornar permisos mock basados en jerarquía
    return ['*'] // Admin tiene todos los permisos
  }, [])

  // Mock function replacing complex database operations
  const loadPermissionsFromDB = useCallback(async (): Promise<string[]> => {
    // En modo demo, retornar permisos mock inmediatamente
    return getHierarchyBasedPermissions()
  }, [getHierarchyBasedPermissions])

  // Mock initialization
  useEffect(() => {
    // En modo demo, usar permisos mock directamente
    setPermissions(['*'])
  }, [])

  // Mock function replacing complex access logic
  const canAccess = useCallback((
    resource: string, 
    action: string, 
    options: PermissionOptions = {}
  ): boolean => {
    // En modo demo, siempre permitir acceso para admin
    // Super admin tiene acceso a todo
    if (mockUser.permissions.includes('*') || mockHasRole('super_admin')) {
      return true
    }

    // Mock: Permitir acceso para admin
    if (mockUser.hierarchy === 'admin' || mockUser.hierarchy === 'admin_empresa') {
      return true
    }

    // Verificar permisos específicos
    const requiredPermission = `${resource}_${action}`
    const managementPermission = `${resource}_manage`
    const viewPermission = `${resource}_view`
    const allPermission = `${resource}_*`

    return permissions.includes(requiredPermission) ||
           permissions.includes(managementPermission) ||
           permissions.includes(viewPermission) ||
           permissions.includes(allPermission) ||
           mockHasPermission(resource as any, action as any)
  }, [mockUser, permissions])

  // Mock multiple access check
  const canAccessMultiple = useCallback((
    checks: Array<{ resource: string; action: string; options?: PermissionOptions }>,
    requireAll = false
  ): boolean => {
    if (checks.length === 0) return true

    const results = checks.map(check => canAccess(check.resource, check.action, check.options))

    return requireAll ? results.every(Boolean) : results.some(Boolean)
  }, [canAccess])

  // Mock hierarchy access check
  const canAccessHierarchy = useCallback((hierarchies: string[]): boolean => {
    return hierarchies.some(hierarchy => mockHasRole(hierarchy) || mockHasHierarchyRole([hierarchy]))
  }, [mockHasRole, mockHasHierarchyRole])

  // Mock enterprise access check
  const canAccessEnterprise = useCallback((
    enterpriseId: string, 
    sedeId?: string
  ): boolean => {
    // En modo demo, admin puede acceder a cualquier empresa
    if (mockHasRole('super_admin') || mockHasRole('admin_empresa')) {
      return true
    }

    // Mock: permitir acceso
    return true
  }, [mockHasRole])

  // Mock cache invalidation
  const invalidatePermissionsCache = useCallback(() => {
    console.log('Mock: Cache de permisos invalidado')
  }, [])

  // Mock get user permissions
  const getUserPermissions = useCallback((): string[] => {
    return [...permissions]
  }, [permissions])

  // Mock logging (removed audit log dependency)
  const logUnauthorizedAccessAttempt = useCallback(async (
    resource: string,
    action: string,
    options?: PermissionOptions
  ) => {
    console.log(`Mock: Intento de acceso no autorizado - Recurso: ${resource}, Acción: ${action}`)
  }, [])

  return {
    // Estado
    loading,
    permissions,
    
    // Funciones principales
    canAccess,
    canAccessMultiple,
    canAccessHierarchy,
    canAccessEnterprise,
    
    // Utilidades
    getUserPermissions,
    invalidatePermissionsCache,
    logUnauthorizedAccess: logUnauthorizedAccessAttempt,
    
    // Aliases para compatibilidad
    hasPermission: canAccess,
    hasRole: mockHasRole,
    hasHierarchyRole: mockHasHierarchyRole
  }
}
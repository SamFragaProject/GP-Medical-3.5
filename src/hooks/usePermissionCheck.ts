// Hook para verificar permisos específicos usando el contexto de autenticación real
import { useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function usePermissionCheck() {
  const { user, checkPermission, canAccess: authCanAccess } = useAuth()

  const canAccess = useCallback((
    resource: string,
    action: string,
    _options: any = {}
  ): boolean => {
    if (!user) return false
    if (user.rol === 'super_admin') return true

    // Normalizar acción
    let normalizedAction: 'create' | 'read' | 'update' | 'delete' | 'manage' = 'read'
    if (['create', 'insert', 'add'].includes(action)) normalizedAction = 'create'
    else if (['update', 'edit', 'modify', 'write'].includes(action)) normalizedAction = 'update'
    else if (['delete', 'remove'].includes(action)) normalizedAction = 'delete'
    else if (['manage', 'admin', '*'].includes(action)) normalizedAction = 'manage'

    return checkPermission(resource, normalizedAction)
  }, [user, checkPermission])

  const hasRole = useCallback((role: string): boolean => {
    return user?.rol === role
  }, [user])

  return {
    loading: false,
    permissions: [], // Podríamos mapear permisos si fuera necesario
    canAccess,
    hasPermission: canAccess,
    hasRole,
    canAccessHierarchy: (hierarchies: string[]) => hierarchies.includes(user?.rol || ''),
    canAccessEnterprise: (empresaId: string) => user?.rol === 'super_admin' || user?.empresa_id === empresaId,
    getUserPermissions: () => [],
    invalidatePermissionsCache: () => { },
    logUnauthorizedAccess: (r: string, a: string) => console.warn(`Acceso no autorizado: ${r}:${a}`)
  }
}

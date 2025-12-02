// Componente HOC para proteger rutas por rol (Sistema SaaS)
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSaaSAuth, useSaaSPermissions } from '@/contexts/SaaSAuthContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Lock } from 'lucide-react'
import { HIERARCHY_CONSTANTS, UserHierarchy } from '@/types/saas'
import { mapComplexPermissionToSimple } from '@/utils/permissionMapping'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  requiredPermissions?: string[]
  requireAll?: boolean // Si true, requiere TODOS los permisos/roles especificados
  fallback?: React.ReactNode
  showAccessDenied?: boolean
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  requireAll = false,
  fallback,
  showAccessDenied = true 
}: ProtectedRouteProps) {
  const { user, loading } = useSaaSAuth()
  const { hasPermission, hasRole } = useSaaSPermissions()

  // Función auxiliar para verificar jerarquía usando el contexto SaaS
  const hasHierarchyRole = (hierarchies: string[]): boolean => {
    return user?.hierarchy ? hierarchies.includes(user.hierarchy) : false
  }

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Redirigir a login si no está autenticado
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Super admin y admin_empresa tienen acceso a todo automáticamente
  if (user.hierarchy === 'super_admin' || user.hierarchy === 'admin_empresa') {
    return <>{children}</>
  }

  // Mapear roles legacy a jerarquías SaaS
  const mapLegacyRolesToHierarchy = (role: string): UserHierarchy[] => {
    const roleMapping: { [key: string]: UserHierarchy[] } = {
      'superadmin': [HIERARCHY_CONSTANTS.SUPER_ADMIN],
      'admin_empresa': [HIERARCHY_CONSTANTS.ADMIN_EMPRESA],
      'medico_trabajo': [HIERARCHY_CONSTANTS.MEDICO_TRABAJO],
      'medico_industrial': [HIERARCHY_CONSTANTS.MEDICO_ESPECIALISTA],
      'enfermera': [HIERARCHY_CONSTANTS.ENFERMERA],
      'audiometrista': [HIERARCHY_CONSTANTS.AUDIOMETRISTA],
      'recepcion': [HIERARCHY_CONSTANTS.RECEPCION],
      'paciente': [HIERARCHY_CONSTANTS.PACIENTE]
    }
    return roleMapping[role] || []
  }

  // Verificar roles requeridos
  let hasRequiredRoles = true
  if (requiredRoles.length > 0) {
    const saasRoles = requiredRoles.flatMap(role => mapLegacyRolesToHierarchy(role))
    if (requireAll) {
      hasRequiredRoles = saasRoles.every(role => hasHierarchyRole([role]))
    } else {
      hasRequiredRoles = saasRoles.length === 0 || hasHierarchyRole(saasRoles)
    }
  }

  // Verificar permisos específicos usando el sistema SaaS
  let hasRequiredPermissions = true
  if (requiredPermissions.length > 0) {
    if (requireAll) {
      hasRequiredPermissions = requiredPermissions.every(perm => {
        const simplePerm = mapComplexPermissionToSimple(perm)
        return hasPermission(simplePerm)
      })
    } else {
      hasRequiredPermissions = requiredPermissions.some(perm => {
        const simplePerm = mapComplexPermissionToSimple(perm)
        return hasPermission(simplePerm)
      })
    }
  }

  // Si no tiene los permisos/roles necesarios
  if (!hasRequiredRoles || !hasRequiredPermissions) {
    if (showAccessDenied) {
      return fallback || (
        <div className="min-h-screen bg-gradient-to-br from-white to-green-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <Alert className="mb-6">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <strong>Acceso Denegado</strong><br />
                No tienes permisos suficientes para acceder a esta sección.
                <br /><br />
                <span className="text-sm text-gray-600">
                  Rol actual: <strong>{user.hierarchy}</strong>
                </span>
              </AlertDescription>
            </Alert>
            <button
              onClick={() => window.history.back()}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      )
    }
    return null
  }

  return <>{children}</>
}

// Hook para verificar permisos antes de renderizar (Sistema SaaS)
export function useRequirePermission(
  permission: string, 
  fallback: React.ReactNode = null
) {
  const { hasPermission: checkSaaSPermission } = useSaaSPermissions()
  
  const hasPermission = React.useCallback(() => {
    const simplePerm = mapComplexPermissionToSimple(permission)
    return simplePerm ? checkSaaSPermission(simplePerm) : false
  }, [permission, checkSaaSPermission])
  
  return hasPermission()
}
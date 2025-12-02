// Componente PermissionGuard para verificar permisos específicos
import React, { useEffect, useState } from 'react'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useNavigate } from 'react-router-dom'
import { Lock, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PermissionGuardProps {
  children: React.ReactNode
  resource: string
  action: string
  hierarchy?: string[]
  enterpriseId?: string
  sedeId?: string
  requireAll?: boolean
  fallback?: React.ReactNode
  showAccessDenied?: boolean
  redirectOnDenied?: boolean
  redirectPath?: string
  loadingComponent?: React.ReactNode
  onAccessDenied?: (resource: string, action: string) => void
  onAccessGranted?: (resource: string, action: string) => void
}

export function PermissionGuard({
  children,
  resource,
  action,
  hierarchy,
  enterpriseId,
  sedeId,
  requireAll = false,
  fallback,
  showAccessDenied = true,
  redirectOnDenied = false,
  redirectPath = '/dashboard',
  loadingComponent,
  onAccessDenied,
  onAccessGranted
}: PermissionGuardProps) {
  const navigate = useNavigate()
  const { canAccess, canAccessMultiple, loading: permissionsLoading, logUnauthorizedAccess } = usePermissionCheck()
  const { currentUser, loading: userLoading, isSessionActive } = useCurrentUser()
  const [accessDenied, setAccessDenied] = useState(false)
  const [checking, setChecking] = useState(true)

  const loading = userLoading || permissionsLoading

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser || !isSessionActive()) {
        setAccessDenied(true)
        setChecking(false)
        return
      }

      try {
        let hasAccess: boolean

        if (requireAll && hierarchy) {
          // Verificar múltiples jerarquías (AND logic)
          hasAccess = hierarchy.every(h => canAccess(resource, action, { hierarchy: [h] }))
        } else if (hierarchy) {
          // Verificar múltiples jerarquías (OR logic)
          hasAccess = canAccess(resource, action, { hierarchy, enterpriseId, sedeId })
        } else {
          // Verificación simple
          hasAccess = canAccess(resource, action, { enterpriseId, sedeId })
        }

        if (!hasAccess) {
          setAccessDenied(true)
          
          // Log del intento no autorizado
          await logUnauthorizedAccess(resource, action, { hierarchy, enterpriseId, sedeId })
          
          // Callback personalizado
          if (onAccessDenied) {
            onAccessDenied(resource, action)
          }
        } else {
          setAccessDenied(false)
          
          // Callback de acceso concedido
          if (onAccessGranted) {
            onAccessGranted(resource, action)
          }
        }
      } catch (error) {
        console.error('Error verificando permisos:', error)
        setAccessDenied(true)
      } finally {
        setChecking(false)
      }
    }

    checkAccess()
  }, [currentUser, isSessionActive, canAccess, canAccessMultiple, resource, action, hierarchy, enterpriseId, sedeId, requireAll, onAccessDenied, onAccessGranted, logUnauthorizedAccess])

  useEffect(() => {
    if (accessDenied && redirectOnDenied) {
      navigate(redirectPath)
    }
  }, [accessDenied, redirectOnDenied, redirectPath, navigate])

  // Componente de carga
  if (loading || checking) {
    return loadingComponent || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Sesión no activa
  if (!currentUser || !isSessionActive()) {
    if (showAccessDenied) {
      return fallback || (
        <Alert className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Sesión expirada</strong><br />
            Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
            <div className="mt-2">
              <Button onClick={() => navigate('/login')} size="sm">
                Regresar al Login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }
    return null
  }

  // Acceso denegado
  if (accessDenied) {
    if (showAccessDenied) {
      return fallback || (
        <Alert className="m-4 border-red-200 bg-red-50">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Acceso Denegado</strong><br />
            No tienes permisos suficientes para acceder a <code className="bg-red-100 px-1 rounded">{resource}:{action}</code>.
            <br /><br />
            <span className="text-sm">
              <strong>Rol actual:</strong> {currentUser.hierarchy}
              {currentUser.sedeName && (
                <><br /><strong>Sede:</strong> {currentUser.sedeName}</>
              )}
            </span>
            <div className="mt-3 flex gap-2">
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="outline" 
                size="sm"
              >
                Ir al Dashboard
              </Button>
              <Button 
                onClick={() => navigate(-1)} 
                variant="ghost" 
                size="sm"
              >
                Regresar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }
    return null
  }

  // Acceso concedido - renderizar contenido
  return <>{children}</>
}

// Hook para usar PermissionGuard de forma programática
export function usePermissionGuard(
  resource: string,
  action: string,
  options: {
    hierarchy?: string[]
    enterpriseId?: string
    sedeId?: string
    requireAll?: boolean
  } = {}
) {
  const { canAccess, canAccessMultiple } = usePermissionCheck()
  const { currentUser, isSessionActive } = useCurrentUser()

  const hasAccess = React.useCallback(() => {
    if (!currentUser || !isSessionActive()) return false

    const { hierarchy, enterpriseId, sedeId, requireAll } = options

    if (requireAll && hierarchy) {
      return hierarchy.every(h => canAccess(resource, action, { hierarchy: [h] }))
    } else if (hierarchy) {
      return canAccess(resource, action, { hierarchy, enterpriseId, sedeId })
    } else {
      return canAccess(resource, action, { enterpriseId, sedeId })
    }
  }, [currentUser, isSessionActive, canAccess, canAccessMultiple, resource, action, options])

  return {
    hasAccess: hasAccess(),
    canAccess: canAccess(resource, action, options),
    user: currentUser,
    sessionActive: isSessionActive()
  }
}

// Componente para verificar múltiples permisos
interface MultiPermissionGuardProps extends PermissionGuardProps {
  permissions: Array<{
    resource: string
    action: string
    hierarchy?: string[]
  }>
  logic?: 'and' | 'or'
}

export function MultiPermissionGuard({
  children,
  permissions,
  logic = 'or',
  ...guardProps
}: MultiPermissionGuardProps) {
  const { canAccessMultiple, loading, logUnauthorizedAccess } = usePermissionCheck()
  const { currentUser, isSessionActive } = useCurrentUser()
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    const checkMultiAccess = async () => {
      if (!currentUser || !isSessionActive()) {
        setAccessDenied(true)
        return
      }

      const hasAccess = logic === 'and' 
        ? permissions.every(perm => canAccessMultiple([perm], true))
        : permissions.some(perm => canAccessMultiple([perm], false))

      if (!hasAccess) {
        setAccessDenied(true)
        
        // Log intentos no autorizados
        permissions.forEach(perm => {
          logUnauthorizedAccess(perm.resource, perm.action, { hierarchy: perm.hierarchy })
        })
      }
    }

    checkMultiAccess()
  }, [currentUser, isSessionActive, permissions, logic, canAccessMultiple, logUnauthorizedAccess])

  if (loading) {
    return guardProps.loadingComponent || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">Verificando permisos múltiples...</p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return guardProps.fallback || (
      <Alert className="m-4 border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Acceso Denegado</strong><br />
          No tienes los permisos suficientes para acceder a este contenido.
          <br /><br />
          <span className="text-sm">
            Permisos requeridos: {permissions.map(p => `${p.resource}:${p.action}`).join(', ')}
          </span>
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}
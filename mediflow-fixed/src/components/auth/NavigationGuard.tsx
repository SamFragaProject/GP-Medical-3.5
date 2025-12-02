// Componente NavigationGuard para proteger rutas por permisos
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { PermissionGuard } from './PermissionGuard'
import { AlertTriangle, Lock, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RoutePermission {
  path: string
  resource: string
  action: string
  hierarchy?: string[]
  requireAll?: boolean
  redirectPath?: string
}

interface NavigationGuardProps {
  children: React.ReactNode
  routePermissions?: RoutePermission[]
  defaultRedirect?: string
  showAccessDenied?: boolean
  enableAutoRedirect?: boolean
  customAccessDeniedPage?: React.ComponentType<{ 
    resource?: string
    action?: string
    user?: any
    onBack?: () => void
    onHome?: () => void
  }>
}

export function NavigationGuard({
  children,
  routePermissions = [],
  defaultRedirect = '/dashboard',
  showAccessDenied = true,
  enableAutoRedirect = true,
  customAccessDeniedPage: CustomAccessDeniedPage
}: NavigationGuardProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { canAccess, canAccessMultiple, logUnauthorizedAccess } = usePermissionCheck()
  const { currentUser, isSessionActive } = useCurrentUser()
  const [accessDenied, setAccessDenied] = useState(false)
  const [deniedPermission, setDeniedPermission] = useState<RoutePermission | null>(null)

  // Verificar permisos de la ruta actual
  useEffect(() => {
    const checkRouteAccess = async () => {
      if (!currentUser || !isSessionActive()) {
        setAccessDenied(true)
        return
      }

      // Encontrar configuración de permisos para la ruta actual
      const currentPath = location.pathname
      const matchingRoute = routePermissions.find(route => {
        if (route.path === currentPath) return true
        
        // Soporte para rutas con parámetros
        const routePattern = route.path.replace(/\/:\w+/g, '/[^/]+')
        const regex = new RegExp(`^${routePattern}$`)
        return regex.test(currentPath)
      })

      if (!matchingRoute) {
        // Si no hay configuración específica, permitir acceso
        setAccessDenied(false)
        setDeniedPermission(null)
        return
      }

      try {
        let hasAccess: boolean

        if (matchingRoute.requireAll && matchingRoute.hierarchy) {
          // Verificar múltiples jerarquías (AND logic)
          hasAccess = matchingRoute.hierarchy.every(hierarchy => 
            canAccess(matchingRoute.resource, matchingRoute.action, { hierarchy: [hierarchy] })
          )
        } else if (matchingRoute.hierarchy) {
          // Verificar múltiples jerarquías (OR logic)
          hasAccess = canAccess(matchingRoute.resource, matchingRoute.action, {
            hierarchy: matchingRoute.hierarchy
          })
        } else {
          // Verificación simple
          hasAccess = canAccess(matchingRoute.resource, matchingRoute.action)
        }

        if (!hasAccess) {
          setAccessDenied(true)
          setDeniedPermission(matchingRoute)
          
          // Log del intento no autorizado
          await logUnauthorizedAccess(matchingRoute.resource, matchingRoute.action, {
            hierarchy: matchingRoute.hierarchy,
          })

          // Redirección automática si está habilitada
          if (enableAutoRedirect) {
            const redirectTo = matchingRoute.redirectPath || defaultRedirect
            setTimeout(() => {
              navigate(redirectTo)
            }, 3000) // 3 segundos antes de redireccionar
          }
        } else {
          setAccessDenied(false)
          setDeniedPermission(null)
        }
      } catch (error) {
        console.error('Error verificando permisos de ruta:', error)
        setAccessDenied(true)
        setDeniedPermission(matchingRoute)
      }
    }

    checkRouteAccess()
  }, [location.pathname, routePermissions, currentUser, isSessionActive, canAccess, canAccessMultiple, logUnauthorizedAccess, defaultRedirect, enableAutoRedirect, navigate])

  // Componente personalizado de acceso denegado
  if (accessDenied && deniedPermission && showAccessDenied) {
    if (CustomAccessDeniedPage) {
      return (
        <CustomAccessDeniedPage
          resource={deniedPermission.resource}
          action={deniedPermission.action}
          user={currentUser}
          onBack={() => navigate(-1)}
          onHome={() => navigate(defaultRedirect)}
        />
      )
    }

    // Página de acceso denegado por defecto
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50">
            <Lock className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
                  <p className="text-sm">
                    No tienes permisos suficientes para acceder a <code className="bg-red-100 px-2 py-1 rounded text-xs">
                      {location.pathname}
                    </code>
                  </p>
                </div>

                {deniedPermission && (
                  <div className="bg-red-100 p-3 rounded-lg">
                    <p className="text-xs font-medium text-red-800 mb-1">Permisos requeridos:</p>
                    <p className="text-sm text-red-700">
                      <strong>Recurso:</strong> {deniedPermission.resource}
                      <br />
                      <strong>Acción:</strong> {deniedPermission.action}
                      {deniedPermission.hierarchy && (
                        <><br /><strong>Jerarquía:</strong> {deniedPermission.hierarchy.join(', ')}</>
                      )}
                    </p>
                  </div>
                )}

                {currentUser && (
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-800 mb-1">Tu información:</p>
                    <p className="text-sm text-gray-700">
                      <strong>Usuario:</strong> {currentUser.name}
                      <br />
                      <strong>Rol:</strong> {currentUser.hierarchy}
                      {currentUser.sedeName && (
                        <><br /><strong>Sede:</strong> {currentUser.sedeName}</>
                      )}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Regresar
                  </Button>
                  <Button
                    onClick={() => navigate(defaultRedirect)}
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    Dashboard
                  </Button>
                </div>

                {enableAutoRedirect && (
                  <p className="text-xs text-gray-600 text-center">
                    Serás redirigido automáticamente en unos segundos...
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (accessDenied && !showAccessDenied) {
    return null
  }

  return <>{children}</>
}

// Hook para usar NavigationGuard programáticamente
export function useNavigationGuard() {
  const location = useLocation()
  const navigate = useNavigate()
  const { canAccess, canAccessMultiple } = usePermissionCheck()
  const { currentUser, isSessionActive } = useCurrentUser()

  const canAccessRoute = React.useCallback((
    path: string,
    resource: string,
    action: string,
    hierarchy?: string[],
    requireAll = false
  ) => {
    if (!currentUser || !isSessionActive()) return false

    if (requireAll && hierarchy) {
      return hierarchy.every(h => canAccess(resource, action, { hierarchy: [h] }))
    } else if (hierarchy) {
      return canAccess(resource, action, { hierarchy })
    } else {
      return canAccess(resource, action)
    }
  }, [currentUser, isSessionActive, canAccess, canAccessMultiple])

  const redirectIfNoAccess = React.useCallback((
    path: string,
    resource: string,
    action: string,
    redirectPath = '/dashboard',
    hierarchy?: string[]
  ) => {
    if (!canAccessRoute(path, resource, action, hierarchy)) {
      navigate(redirectPath)
      return false
    }
    return true
  }, [canAccessRoute, navigate])

  return {
    canAccessRoute,
    redirectIfNoAccess,
    currentPath: location.pathname,
    navigate
  }
}

// Configuración predefinida de rutas y permisos
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Dashboard
  { path: '/dashboard', resource: 'dashboard', action: 'view' },
  
  // Pacientes
  { path: '/pacientes', resource: 'patients', action: 'view', hierarchy: ['admin_empresa', 'medico_trabajo', 'medico_especialista', 'medico_industrial', 'recepcion'] },
  { path: '/agenda', resource: 'agenda', action: 'view', hierarchy: ['admin_empresa', 'medico_trabajo', 'medico_especialista', 'medico_industrial', 'recepcion'] },
  { path: '/agenda/nueva', resource: 'agenda', action: 'create', hierarchy: ['admin_empresa', 'medico_trabajo', 'medico_especialista', 'medico_industrial', 'recepcion'] },
  
  // Exámenes y medicina
  { path: '/examenes', resource: 'exams', action: 'view', hierarchy: ['admin_empresa', 'medico_trabajo', 'medico_especialista', 'medico_industrial'] },
  { path: '/rayos-x', resource: 'medical_history', action: 'view', hierarchy: ['admin_empresa', 'medico_trabajo', 'medico_especialista', 'medico_industrial'] },
  { path: '/evaluaciones', resource: 'risk_assessments', action: 'view', hierarchy: ['admin_empresa', 'medico_trabajo', 'medico_especialista', 'medico_industrial'] },
  { path: '/certificaciones', resource: 'certifications', action: 'view', hierarchy: ['admin_empresa', 'medico_trabajo', 'medico_especialista', 'medico_industrial'] },
  
  // IA y alertas
  { path: '/ia', resource: 'ai', action: 'view', hierarchy: ['admin_empresa', 'medico_trabajo', 'medico_especialista', 'medico_industrial'] },
  { path: '/alertas', resource: 'alerts', action: 'view', hierarchy: ['admin_empresa', 'medico_trabajo', 'medico_especialista', 'medico_industrial'] },
  
  // Tienda
  { path: '/tienda', resource: 'store', action: 'view' },
  
  // Administración
  { path: '/facturacion', resource: 'billing', action: 'view', hierarchy: ['admin_empresa', 'medico_trabajo', 'recepcion'] },
  { path: '/reportes', resource: 'reports', action: 'view', hierarchy: ['admin_empresa', 'medico_trabajo', 'medico_especialista', 'medico_industrial'] },
  { path: '/inventario', resource: 'inventory', action: 'view', hierarchy: ['admin_empresa'] },
  
  // Configuración (solo super admin y admin empresa)
  { path: '/configuracion', resource: 'system', action: 'admin', hierarchy: ['super_admin', 'admin_empresa'] },
  { path: '/perfil', resource: 'profile', action: 'view' },
  
  // Acceso de pacientes
  { path: '/paciente', resource: 'patient_portal', action: 'view', hierarchy: ['paciente'] }
]
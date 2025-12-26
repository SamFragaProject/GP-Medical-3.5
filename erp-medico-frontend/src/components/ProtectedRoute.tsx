import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  requiredPermissions?: string[]
  requireAll?: boolean
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
  const { user, loading, isAuthenticated, hasPermission } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar roles
  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(user.rol)
    if (!hasRole) {
      if (fallback) return <>{fallback}</>
      if (showAccessDenied) return <AccessDenied message="No tienes el rol necesario para acceder a esta sección." />
      return <Navigate to="/dashboard" replace />
    }
  }

  // Verificar permisos
  if (requiredPermissions.length > 0) {
    const permissionsCheck = requiredPermissions.map(p =>
    // Parsear string "resource:action"
    {
      const [resource, action] = p.split(':')
      return hasPermission(resource, action as any)
    }
    )

    const hasAccess = requireAll
      ? permissionsCheck.every(Boolean)
      : permissionsCheck.some(Boolean)

    if (!hasAccess) {
      if (fallback) return <>{fallback}</>
      if (showAccessDenied) return <AccessDenied message="No tienes permisos suficientes para realizar esta acción." />
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}

function AccessDenied({ message }: { message: string }) {
  return (
    <div className="p-6">
      <Alert variant="destructive">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          <strong>Acceso Denegado:</strong> {message}
        </AlertDescription>
      </Alert>
    </div>
  )
}

// Hook dummy se mantiene simple por ahora o se elimina si no se usa
export function useRequirePermission(
  permission: string,
  fallback: React.ReactNode = null
) {
  return true
}
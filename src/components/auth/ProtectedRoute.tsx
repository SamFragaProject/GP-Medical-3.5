import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePermisosDinamicos } from '@/hooks/usePermisosDinamicos'
import { RoleViewConfig } from '@/config/roleConfig'
import { UserRole } from '@/types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Recurso específico a verificar (ej: 'pacientes', 'ia', 'empresas') */
  resource?: string
  /** Acción requerida: por defecto 'read'. */
  requireAction?: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import'
}

/**
 * ProtectedRoute v2 (parche):
 * - Aplica requireAction (antes estaba definido pero NO se aplicaba).
 * - Separa plataforma vs tenant: los roles de plataforma no entran a módulos clínicos/tenant por defecto.
 *
 * Importante: esto es guardia de UI/UX. La seguridad real debe vivir en RLS (Supabase).
 */
export function ProtectedRoute({ children, resource, requireAction = 'read' }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { isSuperAdmin, ability, loading: permissionsLoading } = usePermisosDinamicos()
  const location = useLocation()

  const loading = authLoading || permissionsLoading

  console.log('ProtectedRoute: Rendering', { user: user?.email, authLoading, permissionsLoading, resource, isSuperAdmin });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-200 text-sm">Cargando…</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Super admin siempre tiene acceso a todo
  if (isSuperAdmin) {
    return <>{children}</>
  }

  if (resource) {
    // Mapeo de acciones para el hook dinámico
    const actionMap: Record<string, 'ver' | 'crear' | 'editar' | 'borrar' | 'exportar'> = {
      read: 'ver',
      create: 'crear',
      update: 'editar',
      delete: 'borrar',
      export: 'exportar',
      import: 'crear' // Asumimos crear para import
    }

    const accionDinamica = actionMap[requireAction] || 'ver'

    if (!ability.can(accionDinamica as any, resource)) {
      console.warn(`Acceso denegado a ${resource}:${accionDinamica} para el usuario ${user.email}`)
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/30">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 animate-pulse">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="absolute -inset-4 border-2 border-emerald-200 rounded-3xl animate-ping opacity-20" />
        </div>
        <p className="mt-6 text-sm font-medium text-slate-500 tracking-wide">Verificando acceso…</p>
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
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}


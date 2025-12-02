import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import { RoleViewConfig } from '@/config/roleConfig'

interface ProtectedRouteProps {
    children: React.ReactNode
    resource?: string // Recurso específico a verificar (ej: 'pacientes', 'ia')
    requireAction?: 'create' | 'read' | 'update' | 'delete' // Acción requerida (opcional)
}

export function ProtectedRoute({ children, resource, requireAction = 'read' }: ProtectedRouteProps) {
    const { user, loading } = useAuth()
    const { can, canAction, config } = useRolePermissions()
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    // 1. Verificar autenticación
    if (!user) {
        // Redirigir al login guardando la ubicación intentada
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // 2. Verificar acceso al recurso (si se especifica)
    if (resource) {
        // Mapeo de recursos de navegación a módulos de permisos
        // Algunos recursos de navegación coinciden con módulos, otros no
        const moduleMap: Record<string, keyof RoleViewConfig['modules']> = {
            'pacientes': 'pacientes',
            'citas': 'citas',
            'agenda': 'citas', // Agenda usa permisos de citas
            'examenes': 'examenes',
            'recetas': 'recetas',
            'historial': 'historial',
            'facturacion': 'facturacion',
            'inventario': 'inventario',
            'reportes': 'reportes',
            'ia': 'ia',
            'tienda': 'tienda',
            'rayos_x': 'rayos_x',
            'alertas': 'alertas'
        }

        const moduleKey = moduleMap[resource]

        if (moduleKey) {
            // Verificar si el módulo tiene permisos específicos
            // Por defecto verificamos 'canView' o 'canViewAll' o 'canAccess'
            const hasAccess =
                (config.modules[moduleKey] as any).canView ||
                (config.modules[moduleKey] as any).canViewAll ||
                (config.modules[moduleKey] as any).canAccess

            if (!hasAccess) {
                return <Navigate to="/dashboard" replace />
            }
        } else {
            // Si no es un módulo específico, verificar si está en la navegación permitida
            const navItem = config.navigation.find(item => item.resource === resource)
            if (navItem && !navItem.visible) {
                return <Navigate to="/dashboard" replace />
            }
        }
    }

    return <>{children}</>
}

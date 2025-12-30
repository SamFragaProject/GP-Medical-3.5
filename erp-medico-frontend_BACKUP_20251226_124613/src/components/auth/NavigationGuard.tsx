// Componente NavigationGuard para proteger rutas por permisos - SIMPLIFICADO PARA DEMO
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
  // ACCESO DIRECTO - Sin verificaciones de permisos para demo
  return <>{children}</>
}

// Hook para usar NavigationGuard programáticamente - SIMPLIFICADO PARA DEMO
export function useNavigationGuard() {
  return {
    canAccessRoute: () => true,
    redirectIfNoAccess: () => true,
    currentPath: '/',
    navigate: () => {}
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
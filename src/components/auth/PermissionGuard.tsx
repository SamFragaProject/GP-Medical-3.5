// Componente PermissionGuard para verificar permisos específicos - SIMPLIFICADO PARA DEMO
import React, { useEffect, useState } from 'react'
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
  const [checking, setChecking] = useState(false)

  // ACCESO DIRECTO - Sin verificaciones para demo
  useEffect(() => {
    // Simular verificación rápida
    setChecking(true)
    const timer = setTimeout(() => {
      setChecking(false)
      if (onAccessGranted) {
        onAccessGranted(resource, action)
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [resource, action, onAccessGranted])

  useEffect(() => {
    if (redirectOnDenied) {
      navigate(redirectPath)
    }
  }, [redirectOnDenied, redirectPath, navigate])

  // Componente de carga
  if (checking) {
    return loadingComponent || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // ACCESO DIRECTO - Siempre permitir acceso en demo
  return <>{children}</>
}

// Hook para usar PermissionGuard de forma programática - SIMPLIFICADO PARA DEMO
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
  return {
    hasAccess: true,
    canAccess: () => true,
    user: {
      name: 'Usuario Demo',
      hierarchy: 'super_admin'
    },
    sessionActive: true
  }
}

// Componente para verificar múltiples permisos - SIMPLIFICADO PARA DEMO
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
  // ACCESO DIRECTO - Sin verificaciones para demo
  return <>{children}</>
}

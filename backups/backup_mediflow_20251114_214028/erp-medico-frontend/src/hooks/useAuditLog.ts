// Hook para registro de auditoría y logs de seguridad
import { useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCurrentUser } from './useCurrentUserDemo'
import { AuditLogEntry } from '@/types/saas'

interface AuditLogOptions {
  action: AuditLogEntry['action']
  resourceType?: string
  resourceId?: string
  actionType?: string
  details?: Record<string, any>
  success?: boolean
  errorMessage?: string
}

export function useAuditLog() {
  const { currentUser, empresaInfo } = useCurrentUser()
  const sedeInfo = null // Mock sedeInfo

  const logAction = useCallback(async (options: AuditLogOptions) => {
    if (!currentUser) {
      console.warn('⚠️ No se puede registrar log de auditoría: usuario no autenticado')
      return
    }

    try {
      const logEntry: Omit<AuditLogEntry, 'id'> = {
        userId: currentUser.id,
        enterpriseId: currentUser.enterpriseId,
        sedeId: currentUser.sede || undefined,
        action: options.action,
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        actionType: options.actionType,
        details: {
          ...options.details,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer
        },
        ipAddress: undefined, // Se puede obtener del servidor
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        success: options.success !== false,
        errorMessage: options.errorMessage
      }

      // MODO DEMO: Guardar en localStorage en lugar de base de datos
      try {
        const logs = JSON.parse(localStorage.getItem('demo_audit_logs') || '[]')
        logs.push({ id: `log-${Date.now()}`, ...logEntry })
        
        // Mantener solo los últimos 100 logs
        if (logs.length > 100) {
          logs.splice(0, logs.length - 100)
        }
        
        localStorage.setItem('demo_audit_logs', JSON.stringify(logs))
        console.log('✅ Log de auditoría registrado (modo demo):', options.action)
      } catch (localError) {
        console.error('Error guardando log de auditoría en localStorage:', localError)
      }
    } catch (error) {
      console.error('Error en log de auditoría:', error)
    }
  }, [currentUser])

  const logLogin = useCallback((success = true, errorMessage?: string) => {
    logAction({
      action: 'LOGIN',
      success,
      errorMessage,
      details: {
        loginMethod: 'email_password',
        enterprise: empresaInfo?.nombre,
        sede: sedeInfo?.nombre
      }
    })
  }, [logAction, empresaInfo, sedeInfo])

  const logLogout = useCallback(() => {
    logAction({
      action: 'LOGOUT',
      details: {
        sessionDuration: Date.now() - Date.now() // Se calcula en el backend
      }
    })
  }, [logAction])

  const logUnauthorizedAccess = useCallback((
    resourceType: string,
    actionType: string,
    details?: Record<string, any>
  ) => {
    logAction({
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resourceType,
      actionType,
      success: false,
      details: {
        ...details,
        blockedAt: new Date().toISOString(),
        reason: 'Insufficient permissions'
      }
    })
  }, [logAction])

  const logRouteAccess = useCallback((
    path: string,
    resourceType: string,
    actionType: string,
    success = true
  ) => {
    logAction({
      action: 'ROUTE_ACCESS',
      resourceType,
      actionType,
      success,
      details: {
        path,
        method: 'GET',
        queryParams: Object.fromEntries(new URLSearchParams(window.location.search))
      }
    })
  }, [logAction])

  const logResourceAccess = useCallback((
    resourceType: string,
    resourceId: string,
    actionType: string,
    success = true,
    details?: Record<string, any>
  ) => {
    logAction({
      action: 'RESOURCE_ACCESS',
      resourceType,
      resourceId,
      actionType,
      success,
      details
    })
  }, [logAction])

  return {
    logAction,
    logLogin,
    logLogout,
    logUnauthorizedAccess,
    logRouteAccess,
    logResourceAccess
  }
}

// Hook para obtener logs de auditoría (solo para administradores)
export function useAuditLogs(filters?: {
  userId?: string
  enterpriseId?: string
  action?: AuditLogEntry['action']
  startDate?: Date
  endDate?: Date
  limit?: number
}) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // MODO DEMO: Leer desde localStorage
      await new Promise(resolve => setTimeout(resolve, 200)) // Simular delay de red
      
      const logsData = JSON.parse(localStorage.getItem('demo_audit_logs') || '[]') as AuditLogEntry[]
      let resultado = logsData

      // Aplicar filtros
      if (filters?.userId) {
        resultado = resultado.filter(log => log.userId === filters.userId)
      }

      if (filters?.enterpriseId) {
        resultado = resultado.filter(log => log.enterpriseId === filters.enterpriseId)
      }

      if (filters?.action) {
        resultado = resultado.filter(log => log.action === filters.action)
      }

      if (filters?.startDate) {
        resultado = resultado.filter(log => new Date(log.timestamp) >= filters.startDate!)
      }

      if (filters?.endDate) {
        resultado = resultado.filter(log => new Date(log.timestamp) <= filters.endDate!)
      }

      // Ordenar por timestamp descendente
      resultado.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      // Aplicar límite
      if (filters?.limit) {
        resultado = resultado.slice(0, filters.limit)
      }

      setLogs(resultado)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando logs')
    } finally {
      setLoading(false)
    }
  }, [filters])

  return {
    logs,
    loading,
    error,
    fetchLogs,
    refetch: fetchLogs
  }
}

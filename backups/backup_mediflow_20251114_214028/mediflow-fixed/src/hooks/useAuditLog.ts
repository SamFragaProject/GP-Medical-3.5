// Hook para registro de auditoría y logs de seguridad
// DESHABILITADO - Solo modo demo - Sin Supabase
import { useCallback, useState } from 'react'
// import { supabase } from '@/lib/supabase' // Deshabilitado
import { useCurrentUser } from './useCurrentUser'
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

      // Insertar en la base de datos (SIMULADO - no hay Supabase)
      console.log('✅ Log de auditoría registrado (modo demo):', options.action, logEntry)
      
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
// DESHABILITADO - Solo modo demo - Sin Supabase
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

      // Simular logs de auditoría demo
      const demoLogs: AuditLogEntry[] = [
        {
          id: '1',
          userId: 'demo_user',
          enterpriseId: 'demo_enterprise',
          sedeId: 'demo_sede',
          action: 'LOGIN',
          resourceType: 'auth',
          actionType: 'login',
          details: { loginMethod: 'email_password' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          timestamp: new Date(),
          success: true
        }
      ]

      // Simular filtros
      let filteredLogs = demoLogs
      if (filters?.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
      }
      if (filters?.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action)
      }

      setLogs(filteredLogs)
      console.log('✅ Logs de auditoría cargados (modo demo):', filteredLogs.length)
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
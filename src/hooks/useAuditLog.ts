// Hook para registro de auditoría y logs de seguridad conectado a Supabase
import { useCallback, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface AuditLogOptions {
  action: string
  resourceType: string
  resourceId?: string
  actionType?: string
  details?: Record<string, any>
  success?: boolean
  errorMessage?: string
  datosAnteriores?: any
  datosNuevos?: any
}

export function useAuditLog() {
  const { user } = useAuth()

  const logAction = useCallback(async (options: AuditLogOptions) => {
    if (!user) {
      console.warn('⚠️ No se puede registrar log de auditoría: usuario no autenticado')
      return
    }

    try {
      const { error } = await supabase
        .from('auditoria')
        .insert({
          empresa_id: user.empresa_id,
          sede_id: (user as any).sede_id || null,
          user_id: user.id,
          tabla_afectada: options.resourceType,
          registro_id: options.resourceId,
          accion: options.action,
          datos_anteriores: options.datosAnteriores,
          datos_nuevos: options.datosNuevos,
          user_agent: navigator.userAgent,
          timestamp_evento: new Date().toISOString()
        })

      if (error) {
        console.error('Error insertando log de auditoría en Supabase:', error)
      }
    } catch (error) {
      console.error('Error en log de auditoría:', error)
    }
  }, [user])

  const logLogin = useCallback((success = true, errorMessage?: string) => {
    logAction({
      action: 'LOGIN',
      resourceType: 'auth',
      success,
      errorMessage,
      details: {
        loginMethod: 'email_password'
      }
    })
  }, [logAction])

  const logLogout = useCallback(() => {
    logAction({
      action: 'LOGOUT',
      resourceType: 'auth'
    })
  }, [logAction])

  return {
    logAction,
    logLogin,
    logLogout
  }
}

export function useAuditLogs(filters?: {
  userId?: string
  empresaId?: string
  action?: string
  limit?: number
}) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('auditoria')
        .select(`
          *,
          usuario:profiles(nombre, apellido_paterno)
        `)
        .order('timestamp_evento', { ascending: false })
        .limit(filters?.limit || 50)

      if (filters?.userId) query = query.eq('user_id', filters.userId)
      if (filters?.empresaId) query = query.eq('empresa_id', filters.empresaId)
      if (filters?.action) query = query.eq('accion', filters.action)

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setLogs(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando logs')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return {
    logs,
    loading,
    error,
    fetchLogs,
    refetch: fetchLogs
  }
}

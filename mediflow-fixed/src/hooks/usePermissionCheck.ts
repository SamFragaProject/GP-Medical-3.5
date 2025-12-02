// Hook para verificar permisos específicos del sistema personalizado
// DESHABILITADO - Solo modo demo - Sin Supabase
import { useState, useEffect, useCallback } from 'react'
import { useSaaSAuth, useSaaSPermissions } from '@/contexts/SaaSAuthContext'
// import { supabase } from '@/lib/supabase' // Deshabilitado
import { useAuditLog } from './useAuditLog'
import { mapComplexPermissionToSimple } from '@/utils/permissionMapping'
import toast from 'react-hot-toast'

interface PermissionOptions {
  hierarchy?: string[]
  enterpriseId?: string
  sedeId?: string
  context?: 'read' | 'write' | 'admin' | 'manage'
}

interface CachedPermissions {
  permissions: string[]
  timestamp: number
  enterpriseId: string
  sedeId?: string
}

const PERMISSION_CACHE_KEY = 'mediflow_permissions_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function usePermissionCheck() {
  const { user, hasPermission, hasRole } = useSaaSAuth()
  const { hasHierarchyRole, getUserHierarchy } = useSaaSPermissions()
  const { logUnauthorizedAccess } = useAuditLog()
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState<string[]>([])

  // Cache de permisos en localStorage
  const getCachedPermissions = useCallback((): CachedPermissions | null => {
    try {
      const cached = localStorage.getItem(PERMISSION_CACHE_KEY)
      if (!cached) return null

      const parsed: CachedPermissions = JSON.parse(cached)
      const now = Date.now()

      // Verificar si el cache está expirado
      if (now - parsed.timestamp > CACHE_DURATION) {
        localStorage.removeItem(PERMISSION_CACHE_KEY)
        return null
      }

      // Verificar si la empresa/sede coincide
      if (parsed.enterpriseId !== user?.enterpriseId || 
          parsed.sedeId !== user?.sede) {
        localStorage.removeItem(PERMISSION_CACHE_KEY)
        return null
      }

      return parsed
    } catch (error) {
      console.error('Error leyendo cache de permisos:', error)
      return null
    }
  }, [user?.enterpriseId, user?.sede])

  // Guardar permisos en cache
  const setCachedPermissions = useCallback((permissions: string[]) => {
    try {
      const cacheData: CachedPermissions = {
        permissions,
        timestamp: Date.now(),
        enterpriseId: user?.enterpriseId || '',
        sedeId: user?.sede
      }
      localStorage.setItem(PERMISSION_CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error guardando cache de permisos:', error)
    }
  }, [user?.enterpriseId, user?.sede])

  // Cargar permisos desde la base de datos (SIMULADO - no hay Supabase)
  const loadPermissionsFromDB = useCallback(async (): Promise<string[]> => {
    if (!user?.id || !user?.enterpriseId) {
      return []
    }

    try {
      setLoading(true)
      
      // Simular carga de permisos desde la base de datos
      console.log('✅ Cargando permisos desde base de datos (modo demo)...')
      
      // Usar solo permisos basados en jerarquía como no hay Supabase
      const hierarchyPermissions = getHierarchyBasedPermissions()
      
      console.log('✅ Permisos cargados (modo demo):', hierarchyPermissions.length)
      return hierarchyPermissions
    } catch (error) {
      console.error('Error en loadPermissionsFromDB:', error)
      return getHierarchyBasedPermissions()
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.enterpriseId, user?.sede])

  // Fallback: permisos basados en jerarquía del usuario
  const getHierarchyBasedPermissions = useCallback((): string[] => {
    const hierarchy = getUserHierarchy()
    
    const hierarchyPermissions: Record<string, string[]> = {
      'super_admin': ['*'],
      'admin_empresa': [
        'dashboard_view', 'patients_view', 'patients_manage',
        'medical_view', 'medical_manage', 'exams_view', 'exams_manage',
        'billing_view', 'billing_manage', 'reports_view', 'reports_manage',
        'inventory_view', 'inventory_manage', 'agenda_view', 'agenda_manage',
        'store_view', 'store_manage', 'system_admin', 'users_manage',
        'security_manage', 'audit_view', 'certifications_view', 'certifications_manage',
        'ai_view', 'alerts_view'
      ],
      'medico_trabajo': [
        'dashboard_view', 'patients_view', 'patients_manage',
        'medical_view', 'medical_manage', 'exams_view', 'exams_manage',
        'agenda_view', 'agenda_manage', 'certifications_view', 'certifications_manage',
        'reports_view', 'ai_view', 'alerts_view', 'store_view'
      ],
      'medico_especialista': [
        'dashboard_view', 'patients_view', 'patients_manage',
        'medical_view', 'exams_view', 'exams_manage',
        'reports_view', 'certifications_view', 'ai_view', 'store_view'
      ],
      'medico_industrial': [
        'dashboard_view', 'patients_view', 'patients_manage',
        'medical_view', 'exams_view', 'exams_manage',
        'reports_view', 'certifications_view', 'ai_view', 'store_view'
      ],
      'recepcion': [
        'dashboard_view', 'patients_view', 'patients_manage',
        'agenda_view', 'agenda_manage', 'billing_view', 'billing_manage'
      ],
      'paciente': [
        'dashboard_view', 'medical_view', 'agenda_view',
        'reports_view'
      ],
      'bot': [
        'dashboard_view', 'ai_view'
      ]
    }

    return hierarchyPermissions[hierarchy] || []
  }, [getUserHierarchy])

  // Inicializar permisos al montar el componente
  useEffect(() => {
    if (!user) {
      setPermissions([])
      return
    }

    const initPermissions = async () => {
      // Intentar usar cache primero
      const cached = getCachedPermissions()
      if (cached) {
        setPermissions(cached.permissions)
        return
      }

      // Cargar desde la base de datos (modo demo)
      const dbPermissions = await loadPermissionsFromDB()
      setPermissions(dbPermissions)
      setCachedPermissions(dbPermissions)
      console.log('✅ Permisos inicializados (modo demo):', dbPermissions.length)
    }

    initPermissions()
  }, [user, getCachedPermissions, loadPermissionsFromDB, setCachedPermissions])

  // Función principal para verificar acceso
  const canAccess = useCallback((
    resource: string, 
    action: string, 
    options: PermissionOptions = {}
  ): boolean => {
    if (!user) return false

    // Super admin tiene acceso a todo
    if (user.permissions.includes('*') || hasRole('super_admin')) {
      return true
    }

    // Verificar jerarquía específica
    if (options.hierarchy && options.hierarchy.length > 0) {
      const hasRequiredHierarchy = options.hierarchy.some(hierarchy => 
        hasRole(hierarchy) || hasHierarchyRole([hierarchy])
      )
      if (!hasRequiredHierarchy) {
        return false
      }
    }

    // Verificar empresa
    if (options.enterpriseId && options.enterpriseId !== user.enterpriseId) {
      return false
    }

    // Verificar sede
    if (options.sedeId && options.sedeId !== user.sede) {
      return false
    }

    // Verificar permisos específicos (desde cache o contexto)
    const requiredPermission = `${resource}_${action}`
    const managementPermission = `${resource}_manage`
    const viewPermission = `${resource}_view`
    const allPermission = `${resource}_*`

    return permissions.includes(requiredPermission) ||
           permissions.includes(managementPermission) ||
           permissions.includes(viewPermission) ||
           permissions.includes(allPermission) ||
           hasPermission(mapComplexPermissionToSimple(`${resource}_${action}`))
  }, [user, permissions, hasPermission, hasRole, hasHierarchyRole])

  // Verificar múltiples permisos (AND/OR logic)
  const canAccessMultiple = useCallback((
    checks: Array<{ resource: string; action: string; options?: PermissionOptions }>,
    requireAll = false
  ): boolean => {
    if (checks.length === 0) return true

    const results = checks.map(check => canAccess(check.resource, check.action, check.options))

    return requireAll ? results.every(Boolean) : results.some(Boolean)
  }, [canAccess])

  // Verificar permisos de jerarquía
  const canAccessHierarchy = useCallback((hierarchies: string[]): boolean => {
    return hierarchies.some(hierarchy => hasRole(hierarchy) || hasHierarchyRole([hierarchy]))
  }, [hasRole, hasHierarchyRole])

  // Verificar permisos de empresa/sede
  const canAccessEnterprise = useCallback((
    enterpriseId: string, 
    sedeId?: string
  ): boolean => {
    if (!user) return false
    
    // Super admin y admin_empresa pueden acceder a cualquier empresa
    if (hasRole('super_admin') || hasRole('admin_empresa')) {
      return true
    }

    // Verificar empresa específica
    if (user.enterpriseId !== enterpriseId) {
      return false
    }

    // Verificar sede si se especifica
    if (sedeId && user.sede !== sedeId) {
      return false
    }

    return true
  }, [user, hasRole])

  // Invalidar cache de permisos
  const invalidatePermissionsCache = useCallback(() => {
    localStorage.removeItem(PERMISSION_CACHE_KEY)
    // Recargar permisos
    if (user) {
      loadPermissionsFromDB().then(setPermissions)
    }
  }, [user, loadPermissionsFromDB])

  // Obtener permisos del usuario
  const getUserPermissions = useCallback((): string[] => {
    return [...permissions]
  }, [permissions])

  // Logging de auditoría para intentos no autorizados
  const logUnauthorizedAccessAttempt = useCallback(async (
    resource: string,
    action: string,
    options?: PermissionOptions
  ) => {
    try {
      logUnauthorizedAccess(resource, action, {
        attempted_resource: resource,
        attempted_action: action,
        user_hierarchy: user?.hierarchy,
        options
      })
    } catch (error) {
      console.error('Error registrando intento de acceso no autorizado:', error)
    }
  }, [user, logUnauthorizedAccess])

  return {
    // Estado
    loading,
    permissions,
    
    // Funciones principales
    canAccess,
    canAccessMultiple,
    canAccessHierarchy,
    canAccessEnterprise,
    
    // Utilidades
    getUserPermissions,
    invalidatePermissionsCache,
    logUnauthorizedAccess: logUnauthorizedAccessAttempt,
    
    // Aliases para compatibilidad
    hasPermission: canAccess,
    hasRole,
    hasHierarchyRole
  }
}
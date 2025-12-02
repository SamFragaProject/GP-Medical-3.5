// Hook para obtener permisos de menús personalizados - VERSIÓN DEMO SIN SUPABASE
import { useState, useEffect, useCallback } from 'react'
import { useSaaSPermissions } from '@/contexts/SaaSAuthContext'
import { MenuPermissionRecord, NavigationItem, ResourceType, PermissionAction, PermissionLevel } from '@/types/saas'

interface MenuPermissionHookReturn {
  permissions: MenuPermissionRecord[]
  loading: boolean
  error: string | null
  hasMenuPermission: (menuItemId: string, permissionType?: 'full' | 'read' | 'none') => boolean
  getUserMenuItems: () => Promise<NavigationItem[]>
  refreshPermissions: () => Promise<void>
  invalidateCache: () => void
}

// Cache para permisos (se invalida cuando cambian)
const menuPermissionsCache = new Map<string, { data: MenuPermissionRecord[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Datos demo de permisos de menú por jerarquía
const DEMO_PERMISSIONS: Record<string, MenuPermissionRecord[]> = {
  'super_admin': [
    {
      id: 'perm-001',
      user_id: 'admin-001',
      menu_item_id: 'dashboard',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-002',
      user_id: 'admin-001',
      menu_item_id: 'patients',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-003',
      user_id: 'admin-001',
      menu_item_id: 'billing',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-004',
      user_id: 'admin-001',
      menu_item_id: 'reports',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-005',
      user_id: 'admin-001',
      menu_item_id: 'agenda',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-006',
      user_id: 'admin-001',
      menu_item_id: 'inventory',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-007',
      user_id: 'admin-001',
      menu_item_id: 'configuration',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    }
  ],
  'admin_empresa': [
    {
      id: 'perm-101',
      user_id: 'admin-empresa-001',
      menu_item_id: 'dashboard',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-102',
      user_id: 'admin-empresa-001',
      menu_item_id: 'patients',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-103',
      user_id: 'admin-empresa-001',
      menu_item_id: 'billing',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-104',
      user_id: 'admin-empresa-001',
      menu_item_id: 'reports',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-105',
      user_id: 'admin-empresa-001',
      menu_item_id: 'agenda',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-106',
      user_id: 'admin-empresa-001',
      menu_item_id: 'inventory',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    }
  ],
  'medico_trabajo': [
    {
      id: 'perm-201',
      user_id: 'medico-001',
      menu_item_id: 'dashboard',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-202',
      user_id: 'medico-001',
      menu_item_id: 'patients',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-203',
      user_id: 'medico-001',
      menu_item_id: 'agenda',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-204',
      user_id: 'medico-001',
      menu_item_id: 'exams',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-205',
      user_id: 'medico-001',
      menu_item_id: 'reports',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-206',
      user_id: 'medico-001',
      menu_item_id: 'billing',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    }
  ],
  'medico_especialista': [
    {
      id: 'perm-301',
      user_id: 'especialista-001',
      menu_item_id: 'dashboard',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-302',
      user_id: 'especialista-001',
      menu_item_id: 'patients',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-303',
      user_id: 'especialista-001',
      menu_item_id: 'agenda',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-304',
      user_id: 'especialista-001',
      menu_item_id: 'exams',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    }
  ],
  'medico_laboratorista': [
    {
      id: 'perm-401',
      user_id: 'laboratorio-001',
      menu_item_id: 'dashboard',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-402',
      user_id: 'laboratorio-001',
      menu_item_id: 'exams',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-403',
      user_id: 'laboratorio-001',
      menu_item_id: 'inventory',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    }
  ],
  'recepcion': [
    {
      id: 'perm-501',
      user_id: 'recepcion-001',
      menu_item_id: 'dashboard',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-502',
      user_id: 'recepcion-001',
      menu_item_id: 'patients',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-503',
      user_id: 'recepcion-001',
      menu_item_id: 'agenda',
      permission_type: 'full',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-504',
      user_id: 'recepcion-001',
      menu_item_id: 'billing',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    }
  ],
  'paciente': [
    {
      id: 'perm-601',
      user_id: 'paciente-001',
      menu_item_id: 'dashboard',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-602',
      user_id: 'paciente-001',
      menu_item_id: 'appointments',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    },
    {
      id: 'perm-603',
      user_id: 'paciente-001',
      menu_item_id: 'medical_history',
      permission_type: 'read',
      granted_by: 'system',
      granted_at: new Date(),
      is_active: true,
      conditions: {}
    }
  ]
}

// Datos demo de items de menú
const DEMO_MENU_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    order: 1,
    meta: {
      description: 'Panel principal del sistema',
      category: 'principal'
    }
  },
  {
    id: 'patients',
    name: 'Pacientes',
    href: '/pacientes',
    icon: 'Users',
    order: 2,
    meta: {
      description: 'Gestión de pacientes',
      category: 'medico'
    }
  },
  {
    id: 'agenda',
    name: 'Agenda',
    href: '/agenda',
    icon: 'Calendar',
    order: 3,
    meta: {
      description: 'Agenda de citas',
      category: 'medico'
    }
  },
  {
    id: 'exams',
    name: 'Exámenes',
    href: '/examenes-ocupacionales',
    icon: 'FileText',
    order: 4,
    meta: {
      description: 'Exámenes ocupacionales',
      category: 'medico'
    }
  },
  {
    id: 'billing',
    name: 'Facturación',
    href: '/facturacion',
    icon: 'CreditCard',
    order: 5,
    meta: {
      description: 'Sistema de facturación',
      category: 'financiero'
    }
  },
  {
    id: 'inventory',
    name: 'Inventario',
    href: '/inventario',
    icon: 'Package',
    order: 6,
    meta: {
      description: 'Inventario y almacén',
      category: 'operativo'
    }
  },
  {
    id: 'reports',
    name: 'Reportes',
    href: '/reportes',
    icon: 'BarChart3',
    order: 7,
    meta: {
      description: 'Reportes y análisis',
      category: 'analisis'
    }
  },
  {
    id: 'configuration',
    name: 'Configuración',
    href: '/configuracion',
    icon: 'Settings',
    order: 8,
    meta: {
      description: 'Configuración del sistema',
      category: 'administracion'
    }
  },
  {
    id: 'appointments',
    name: 'Mis Citas',
    href: '/mis-citas',
    icon: 'Calendar',
    order: 2,
    meta: {
      description: 'Mis citas programadas',
      category: 'paciente'
    }
  },
  {
    id: 'medical_history',
    name: 'Mi Historial',
    href: '/mi-historial',
    icon: 'FileText',
    order: 3,
    meta: {
      description: 'Mi historial médico',
      category: 'paciente'
    }
  }
]

export function useMenuPermissions(): MenuPermissionHookReturn {
  const [permissions, setPermissions] = useState<MenuPermissionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSaaSPermissions()

  const getCacheKey = useCallback((userId: string) => `menu_permissions_${userId}`, [])

  const loadPermissionsFromCache = useCallback((userId: string): MenuPermissionRecord[] | null => {
    try {
      const cached = menuPermissionsCache.get(getCacheKey(userId))
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📦 Usando permisos de menú desde cache')
        return cached.data
      }
    } catch (error) {
      console.warn('⚠️ Error leyendo cache de permisos:', error)
    }
    return null
  }, [getCacheKey])

  const savePermissionsToCache = useCallback((userId: string, data: MenuPermissionRecord[]) => {
    try {
      menuPermissionsCache.set(getCacheKey(userId), {
        data,
        timestamp: Date.now()
      })
      
      // También guardar en localStorage como respaldo
      localStorage.setItem(getCacheKey(userId), JSON.stringify({
        data,
        timestamp: Date.now()
      }))
      console.log('💾 Permisos de menú guardados en cache')
    } catch (error) {
      console.warn('⚠️ Error guardando cache de permisos:', error)
    }
  }, [getCacheKey])

  const loadPermissionsFromLocalStorage = useCallback((userId: string): MenuPermissionRecord[] | null => {
    try {
      const cached = localStorage.getItem(getCacheKey(userId))
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          console.log('📦 Usando permisos de menú desde localStorage')
          return parsed.data
        }
      }
    } catch (error) {
      console.warn('⚠️ Error leyendo localStorage de permisos:', error)
    }
    return null
  }, [getCacheKey])

  const fetchPermissions = useCallback(async (userId: string) => {
    if (!userId || !user) {
      setPermissions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Intentar cargar desde cache primero
      const cachedPermissions = loadPermissionsFromCache(userId)
      if (cachedPermissions) {
        setPermissions(cachedPermissions)
        setLoading(false)
        return
      }

      // Fallback a localStorage
      const lsPermissions = loadPermissionsFromLocalStorage(userId)
      if (lsPermissions) {
        setPermissions(lsPermissions)
        setLoading(false)
        return
      }

      console.log('🔄 Cargando permisos de menú demo para jerarquía:', user.hierarchy)

      // Simular delay de base de datos
      await new Promise(resolve => setTimeout(resolve, 200))

      // Obtener permisos demo basados en la jerarquía del usuario
      const userPermissions = DEMO_PERMISSIONS[user.hierarchy] || []

      // Actualizar los IDs de usuario en los permisos
      const userSpecificPermissions = userPermissions.map(perm => ({
        ...perm,
        user_id: userId,
        id: `${perm.id}-${userId}`
      }))

      setPermissions(userSpecificPermissions)
      savePermissionsToCache(userId, userSpecificPermissions)
      console.log(`✅ ${userSpecificPermissions.length} permisos de menú demo cargados para usuario ${userId}`)

    } catch (error: any) {
      console.error('❌ Error cargando permisos de menú:', error)
      setError(error.message)
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }, [user, loadPermissionsFromCache, loadPermissionsFromLocalStorage, savePermissionsToCache])

  const refreshPermissions = useCallback(async () => {
    if (user?.id) {
      // Invalidar cache
      menuPermissionsCache.delete(getCacheKey(user.id))
      localStorage.removeItem(getCacheKey(user.id))
      
      // Recargar permisos demo
      await fetchPermissions(user.id)
    }
  }, [user, fetchPermissions, getCacheKey])

  const invalidateCache = useCallback(() => {
    if (user?.id) {
      menuPermissionsCache.delete(getCacheKey(user.id))
      localStorage.removeItem(getCacheKey(user.id))
      console.log('🗑️ Cache de permisos de menú invalidado')
    }
  }, [user, getCacheKey])

  const hasMenuPermission = useCallback((
    menuItemId: string, 
    permissionType: 'full' | 'read' | 'none' = 'read'
  ): boolean => {
    // Super admin tiene acceso a todo
    if (user?.permissions?.includes('*')) {
      return true
    }

    const permission = permissions.find(p => p.menu_item_id === menuItemId)
    
    if (!permission || !permission.is_active) {
      return false
    }

    // Verificar si el permiso ha expirado
    if (permission.expires_at && permission.expires_at < new Date()) {
      return false
    }

    // Verificar nivel de permiso
    const levelMap: Record<string, number> = {
      'none': 0,
      'read': 1,
      'full': 2
    }

    return levelMap[permission.permission_type] >= levelMap[permissionType]
  }, [permissions, user])

  const getUserMenuItems = useCallback(async (): Promise<NavigationItem[]> => {
    if (!user?.id) {
      return []
    }

    try {
      console.log('🔄 Cargando items de menú demo...')
      
      // Simular delay de base de datos
      await new Promise(resolve => setTimeout(resolve, 100))

      // Filtrar items basados en permisos del usuario
      const allowedItems = DEMO_MENU_ITEMS.filter(item => 
        hasMenuPermission(item.id, 'read')
      )

      console.log(`✅ ${allowedItems.length} items de menú demo cargados para usuario ${user.id}`)
      return allowedItems

    } catch (error: any) {
      console.error('❌ Error obteniendo items de menú:', error)
      setError(error.message)
      return []
    }
  }, [user, hasMenuPermission])

  // Cargar permisos cuando cambia el usuario
  useEffect(() => {
    if (user?.id) {
      fetchPermissions(user.id)
    } else {
      setPermissions([])
      setLoading(false)
    }
  }, [user?.id, fetchPermissions])

  // Limpiar cache cuando el usuario hace logout
  useEffect(() => {
    if (!user && permissions.length > 0) {
      setPermissions([])
      setLoading(false)
    }
  }, [user, permissions.length])

  return {
    permissions,
    loading,
    error,
    hasMenuPermission,
    getUserMenuItems,
    refreshPermissions,
    invalidateCache
  }
}

// Hook adicional para verificar permisos específicos de recursos
export function useResourcePermissions() {
  const { user } = useSaaSPermissions()
  const { hasMenuPermission } = useMenuPermissions()

  const checkResourcePermission = useCallback((
    resource: ResourceType,
    action: keyof PermissionAction,
    level: PermissionLevel = 'user'
  ): boolean => {
    if (!user?.permissions) {
      return false
    }

    // Super admin tiene todos los permisos
    if (user.permissions.includes('*')) {
      return true
    }

    // Verificar si el usuario tiene el permiso específico
    const permissionKey = `${resource}_${action}`
    const hasSpecificPermission = user.permissions.includes(permissionKey)
    
    // Verificar permisos de menú relacionados
    const menuItemId = `menu_${resource}_${action}`
    const hasMenuAccess = hasMenuPermission(menuItemId, 'read')

    return hasSpecificPermission || hasMenuAccess
  }, [user, hasMenuPermission])

  const checkMultiplePermissions = useCallback((
    permissions: Array<{ resource: ResourceType; action: keyof PermissionAction; level?: PermissionLevel }>
  ): boolean => {
    return permissions.every(perm => 
      checkResourcePermission(perm.resource, perm.action, perm.level)
    )
  }, [checkResourcePermission])

  return {
    checkResourcePermission,
    checkMultiplePermissions,
    hasMenuPermission
  }
}
// Hook para obtener permisos de menús personalizados MODO DEMO - Sin Supabase
import { useState, useEffect, useCallback } from 'react'
import { useSaaSPermissions } from '@/contexts/SaaSAuthContextDemo'
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

// Items de menú demo
const DEMO_MENU_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    order: 1,
    meta: {
      description: 'Panel principal del sistema',
      category: 'principal',
      external: false
    }
  },
  {
    id: 'patients',
    name: 'Pacientes',
    href: '/patients',
    icon: 'Users',
    order: 2,
    meta: {
      description: 'Gestión de pacientes',
      category: 'clinical',
      external: false
    }
  },
  {
    id: 'exams',
    name: 'Exámenes',
    href: '/exams',
    icon: 'FileText',
    order: 3,
    meta: {
      description: 'Exámenes ocupacionales',
      category: 'clinical',
      external: false
    }
  },
  {
    id: 'reports',
    name: 'Reportes',
    href: '/reports',
    icon: 'BarChart3',
    order: 4,
    meta: {
      description: 'Reportes y análisis',
      category: 'reports',
      external: false
    }
  },
  {
    id: 'users',
    name: 'Usuarios',
    href: '/users',
    icon: 'UserCheck',
    order: 5,
    meta: {
      description: 'Gestión de usuarios',
      category: 'admin',
      external: false
    }
  },
  {
    id: 'settings',
    name: 'Configuración',
    href: '/settings',
    icon: 'Settings',
    order: 6,
    meta: {
      description: 'Configuración del sistema',
      category: 'admin',
      external: false
    }
  }
]

export function useMenuPermissions(): MenuPermissionHookReturn {
  const [permissions, setPermissions] = useState<MenuPermissionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSaaSPermissions()

  const getCacheKey = useCallback((userId: string) => `menu_permissions_demo_${userId}`, [])

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

  // Generar permisos demo basados en la jerarquía del usuario
  const generateDemoPermissions = useCallback((userId: string, hierarchy: string): MenuPermissionRecord[] => {
    const demoPermissions: MenuPermissionRecord[] = []

    // Super admin tiene todos los permisos
    if (hierarchy === 'super_admin') {
      DEMO_MENU_ITEMS.forEach(item => {
        demoPermissions.push({
          id: `demo-perm-${item.id}`,
          user_id: userId,
          menu_item_id: item.id,
          permission_type: 'full',
          granted_by: 'system-demo',
          granted_at: new Date(),
          is_active: true,
          conditions: {}
        })
      })
      return demoPermissions
    }

    // Otros roles basados en jerarquía
    const rolePermissions: Record<string, string[]> = {
      'admin_empresa': ['dashboard', 'patients', 'exams', 'reports', 'users'],
      'medico_trabajo': ['dashboard', 'patients', 'exams', 'reports'],
      'enfermera_especializada': ['dashboard', 'patients', 'exams'],
      'coordinador_sede': ['dashboard', 'patients', 'exams', 'reports'],
      'tecnico_radiologia': ['dashboard', 'patients', 'exams'],
      'laboratorista_clinico': ['dashboard', 'patients', 'exams'],
      'responsable_rh': ['dashboard', 'patients', 'reports'],
      'gerente_general': ['dashboard', 'patients', 'exams', 'reports']
    }

    const allowedItems = rolePermissions[hierarchy] || ['dashboard']
    
    allowedItems.forEach(itemId => {
      const menuItem = DEMO_MENU_ITEMS.find(item => item.id === itemId)
      if (menuItem) {
        demoPermissions.push({
          id: `demo-perm-${menuItem.id}`,
          user_id: userId,
          menu_item_id: menuItem.id,
          permission_type: hierarchy === 'super_admin' ? 'full' : 'read',
          granted_by: 'system-demo',
          granted_at: new Date(),
          is_active: true,
          conditions: {}
        })
      }
    })

    return demoPermissions
  }, [])

  const fetchPermissions = useCallback(async (userId: string) => {
    if (!userId) {
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

      console.log('🔄 Generando permisos de menú en modo demo...')

      // Generar permisos demo basados en la jerarquía del usuario
      const userHierarchy = user?.hierarchy || 'dashboard'
      const permissionRecords = generateDemoPermissions(userId, userHierarchy)

      setPermissions(permissionRecords)
      savePermissionsToCache(userId, permissionRecords)
      console.log(`✅ ${permissionRecords.length} permisos de menú generados para usuario ${userId}`)

    } catch (error: any) {
      console.error('❌ Error generando permisos de menú:', error)
      setError(error.message)
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }, [user, loadPermissionsFromCache, generateDemoPermissions, savePermissionsToCache])

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
  }, [permissions])

  const getUserMenuItems = useCallback(async (): Promise<NavigationItem[]> => {
    if (!user?.id) {
      return []
    }

    try {
      // En modo demo, filtrar items basados en permisos del usuario
      const allowedItems = DEMO_MENU_ITEMS.filter(item => 
        hasMenuPermission(item.id, 'read')
      )

      console.log(`✅ ${allowedItems.length} items de menú cargados para usuario ${user.id}`)
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
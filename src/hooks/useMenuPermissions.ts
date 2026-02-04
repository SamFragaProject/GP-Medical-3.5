// Hook para obtener permisos de menús personalizados - Solo modo demo
import { useState, useEffect, useCallback } from 'react'
import { MenuPermissionRecord, NavigationItem } from '@/types/saas'
// Mock user data - Sin autenticación

interface MenuPermissionHookReturn {
  permissions: MenuPermissionRecord[]
  loading: boolean
  error: string | null
  hasMenuPermission: (menuItemId: string, permissionType?: 'full' | 'read' | 'none') => boolean
  getUserMenuItems: () => Promise<NavigationItem[]>
  refreshPermissions: () => Promise<void>
  invalidateCache: () => void
}

// Permisos demo estáticos por jerarquía
const DEMO_MENU_PERMISSIONS: Record<string, MenuPermissionRecord[]> = {
  'super_admin': [
    { id: '1', user_id: 'admin-001', menu_item_id: 'dashboard', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '2', user_id: 'admin-001', menu_item_id: 'patients', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '3', user_id: 'admin-001', menu_item_id: 'medical_exams', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '4', user_id: 'admin-001', menu_item_id: 'users', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '5', user_id: 'admin-001', menu_item_id: 'settings', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '6', user_id: 'admin-001', menu_item_id: 'reports', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '7', user_id: 'admin-001', menu_item_id: 'billing', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true }
  ],
  'admin': [
    { id: '8', user_id: 'admin-002', menu_item_id: 'dashboard', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '9', user_id: 'admin-002', menu_item_id: 'patients', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '10', user_id: 'admin-002', menu_item_id: 'medical_exams', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '11', user_id: 'admin-002', menu_item_id: 'users', permission_type: 'read', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '12', user_id: 'admin-002', menu_item_id: 'reports', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true }
  ],
  'medico': [
    { id: '13', user_id: 'medico-001', menu_item_id: 'dashboard', permission_type: 'read', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '14', user_id: 'medico-001', menu_item_id: 'patients', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '15', user_id: 'medico-001', menu_item_id: 'medical_exams', permission_type: 'full', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '16', user_id: 'medico-001', menu_item_id: 'reports', permission_type: 'read', granted_by: 'system', granted_at: new Date(), is_active: true }
  ],
  'asistente': [
    { id: '17', user_id: 'asistente-001', menu_item_id: 'dashboard', permission_type: 'read', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '18', user_id: 'asistente-001', menu_item_id: 'patients', permission_type: 'read', granted_by: 'system', granted_at: new Date(), is_active: true },
    { id: '19', user_id: 'asistente-001', menu_item_id: 'medical_exams', permission_type: 'read', granted_by: 'system', granted_at: new Date(), is_active: true }
  ]
}

// Menús demo disponibles
const DEMO_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    meta: {
      description: 'Panel principal de control'
    }
  },
  {
    id: 'patients',
    name: 'Pacientes',
    href: '/pacientes',
    icon: 'Users',
    meta: {
      description: 'Gestión de pacientes'
    }
  },
  {
    id: 'medical_exams',
    name: 'Exámenes Médicos',
    href: '/examenes',
    icon: 'FileText',
    meta: {
      description: 'Exámenes ocupacionales'
    }
  },
  {
    id: 'users',
    name: 'Usuarios',
    href: '/usuarios',
    icon: 'UserCog',
    meta: {
      description: 'Gestión de usuarios'
    }
  },
  {
    id: 'settings',
    name: 'Configuración',
    href: '/configuracion',
    icon: 'Settings',
    meta: {
      description: 'Configuración del sistema'
    }
  },
  {
    id: 'reports',
    name: 'Reportes',
    href: '/reportes',
    icon: 'BarChart3',
    meta: {
      description: 'Reportes y análisis'
    }
  },
  {
    id: 'billing',
    name: 'Facturación',
    href: '/facturacion',
    icon: 'Receipt',
    meta: {
      description: 'Gestión de facturación'
    }
  }
]

export function useMenuPermissions(): MenuPermissionHookReturn {
  // Mock user - Simular usuario autenticado
  const mockUser = {
    id: '1',
    hierarchy: 'admin'
  }

  const [permissions, setPermissions] = useState<MenuPermissionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar permisos demo basados en la jerarquía del mock user
  const loadPermissions = useCallback(async () => {
    try {
      setLoading(false) // Ya tenemos los datos, no es necesario loading
      setError(null)

      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 100))

      const userPermissions = DEMO_MENU_PERMISSIONS[mockUser.hierarchy] || []
      setPermissions(userPermissions)

      console.log(`📋 Permisos de menú cargados para ${mockUser.hierarchy}:`, userPermissions.length)

    } catch (error: any) {
      console.error('Error cargando permisos de menú:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Verificar si el mock user tiene permiso para un elemento del menú específico
  const hasMenuPermission = useCallback((menuItemId: string, permissionType: 'full' | 'read' | 'none' = 'read'): boolean => {
    // Super admin tiene acceso a todo
    if (mockUser.hierarchy === 'super_admin') return true

    const permission = permissions.find(p => p.menu_item_id === menuItemId)
    if (!permission) return false

    switch (permissionType) {
      case 'full':
        return permission.permission_type === 'full'
      case 'read':
        return permission.permission_type === 'full' || permission.permission_type === 'read'
      case 'none':
        return permission.permission_type === 'none'
      default:
        return false
    }
  }, [permissions])

  // Obtener elementos del menú para el mock user actual
  const getUserMenuItems = useCallback(async (): Promise<NavigationItem[]> => {
    // Filtrar elementos del menú basado en permisos
    const allowedItems = DEMO_NAVIGATION_ITEMS.filter(item => {
      // Super admin ve todo
      if (mockUser.hierarchy === 'super_admin') return true
      
      // Verificar si tiene permiso para este elemento
      return hasMenuPermission(item.id, 'read')
    })

    console.log(`🧭 Elementos de menú disponibles para ${mockUser.hierarchy}:`, allowedItems.length)
    return allowedItems
  }, [hasMenuPermission])

  // Refrescar permisos
  const refreshPermissions = useCallback(async () => {
    await loadPermissions()
  }, [loadPermissions])

  // Invalidar cache (en modo demo no hace nada, pero mantiene compatibilidad)
  const invalidateCache = useCallback(() => {
    console.log('🗑️ Cache invalidado (modo demo)')
  }, [])

  // Cargar permisos demo al inicializar
  useEffect(() => {
    loadPermissions()
  }, [loadPermissions])

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

// Hook alternativo para compatibilidad con código existente
export const useSaaSPermissions = () => {
  // Mock user para compatibilidad
  return { 
    user: {
      id: '1',
      hierarchy: 'admin'
    }
  }
}

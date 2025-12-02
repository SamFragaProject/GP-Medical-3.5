// Manager para configurar y administrar menús personalizados
// DESHABILITADO - Solo modo demo - Sin Supabase
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { MenuItemConfiguration, MenuPermissionRecord, NavigationItem } from '@/types/saas'
import toast from 'react-hot-toast'

interface MenuManagerContextType {
  // Configuración de items
  menuItems: MenuItemConfiguration[]
  loading: boolean
  error: string | null
  
  // Gestión de permisos
  userPermissions: MenuPermissionRecord[]
  
  // Métodos de configuración
  createMenuItem: (item: Omit<MenuItemConfiguration, 'id' | 'created_at' | 'updated_at'>) => Promise<MenuItemConfiguration>
  updateMenuItem: (id: string, updates: Partial<MenuItemConfiguration>) => Promise<MenuItemConfiguration>
  deleteMenuItem: (id: string) => Promise<void>
  duplicateMenuItem: (id: string) => Promise<MenuItemConfiguration>
  
  // Gestión de permisos por usuario
  grantPermission: (userId: string, menuItemId: string, permissionType: 'full' | 'read' | 'none') => Promise<MenuPermissionRecord>
  revokePermission: (userId: string, menuItemId: string) => Promise<void>
  loadUserPermissions: (userId: string) => Promise<MenuPermissionRecord[]>
  
  // Utilidades
  refreshMenuItems: () => Promise<void>
  getAccessibleMenuItems: () => NavigationItem[]
  hasPermission: (userId: string, menuItemId: string) => Promise<boolean>
}

const MenuManagerContext = createContext<MenuManagerContextType | null>(null)

export const useMenuManager = () => {
  const context = useContext(MenuManagerContext)
  if (!context) {
    throw new Error('useMenuManager debe ser usado dentro de un MenuManagerProvider')
  }
  return context
}

// Datos demo para menús (usando tipos correctos)
const DEMO_MENU_ITEMS: MenuItemConfiguration[] = [
  {
    id: '1',
    name: 'Dashboard',
    description: 'Panel principal con métricas y estadísticas',
    href: '/dashboard',
    icon: 'Home',
    category: 'main',
    required_permission: { resource: 'reports', action: 'read', level: 'enterprise' } as any,
    is_active: true,
    is_visible: true,
    sort_order: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2',
    name: 'Pacientes',
    description: 'Gestión de pacientes y expedientes',
    href: '/pacientes',
    icon: 'Users',
    category: 'main',
    required_permission: { resource: 'patients', action: 'read', level: 'enterprise' } as any,
    is_active: true,
    is_visible: true,
    sort_order: 2,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '3',
    name: 'Agenda',
    description: 'Programación de citas y consultas',
    href: '/agenda',
    icon: 'Calendar',
    category: 'main',
    required_permission: { resource: 'appointments', action: 'read', level: 'enterprise' } as any,
    is_active: true,
    is_visible: true,
    sort_order: 3,
    created_at: new Date(),
    updated_at: new Date()
  }
]

// Funciones de demostración sin Supabase
const demoFunctions = {
  loadMenuItems: async (): Promise<MenuItemConfiguration[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...DEMO_MENU_ITEMS]), 100)
    })
  },

  createMenuItem: async (item: Omit<MenuItemConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItemConfiguration> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem: MenuItemConfiguration = {
          ...item,
          id: Date.now().toString(),
          created_at: new Date(),
          updated_at: new Date()
        }
        resolve(newItem)
      }, 100)
    })
  },

  updateMenuItem: async (id: string, updates: Partial<MenuItemConfiguration>): Promise<MenuItemConfiguration> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingItem = DEMO_MENU_ITEMS.find(item => item.id === id) || DEMO_MENU_ITEMS[0]
        const updatedItem: MenuItemConfiguration = {
          ...existingItem,
          ...updates,
          updated_at: new Date()
        }
        resolve(updatedItem)
      }, 100)
    })
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 100)
    })
  },

  grantPermission: async (userId: string, menuItemId: string, permissionType: 'full' | 'read' | 'none'): Promise<MenuPermissionRecord> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const permission: MenuPermissionRecord = {
          id: Date.now().toString(),
          user_id: userId,
          menu_item_id: menuItemId,
          permission_type: permissionType,
          granted_at: new Date(),
          granted_by: 'demo_admin',
          is_active: true
        }
        resolve(permission)
      }, 100)
    })
  },

  revokePermission: async (userId: string, menuItemId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 100)
    })
  },

  loadUserPermissions: async (userId: string): Promise<MenuPermissionRecord[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const permissions: MenuPermissionRecord[] = [
          {
            id: '1',
            user_id: userId,
            menu_item_id: '1',
            permission_type: 'read',
            granted_at: new Date(),
            granted_by: 'demo_admin',
            is_active: true
          }
        ]
        resolve(permissions)
      }, 100)
    })
  }
}

export const MenuManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItemConfiguration[]>([])
  const [userPermissions, setUserPermissions] = useState<MenuPermissionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar items de menú desde la base de datos
  const loadMenuItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await demoFunctions.loadMenuItems()
      setMenuItems(data)
      console.log(`✅ ${data.length} items de menú cargados (modo demo)`)
      
    } catch (error: any) {
      console.error('❌ Error cargando items de menú:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Crear nuevo item de menú
  const createMenuItem = async (newItem: Omit<MenuItemConfiguration, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      setError(null)

      const createdItem = await demoFunctions.createMenuItem(newItem)
      setMenuItems(prev => [...prev, createdItem])
      console.log('✅ Item de menú creado (modo demo):', createdItem.name)
      
      return createdItem
    } catch (error: any) {
      console.error('❌ Error creando item de menú:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Actualizar item de menú
  const updateMenuItem = async (id: string, updates: Partial<MenuItemConfiguration>) => {
    try {
      setLoading(true)
      setError(null)

      const updatedItem = await demoFunctions.updateMenuItem(id, updates)
      setMenuItems(prev => prev.map(item => item.id === id ? updatedItem : item))
      console.log('✅ Item de menú actualizado (modo demo):', updatedItem.name)
      
      return updatedItem
    } catch (error: any) {
      console.error('❌ Error actualizando item de menú:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Eliminar item de menú
  const deleteMenuItem = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      await demoFunctions.deleteMenuItem(id)
      setMenuItems(prev => prev.filter(item => item.id !== id))
      console.log('✅ Item de menú eliminado (modo demo):', id)
      
    } catch (error: any) {
      console.error('❌ Error eliminando item de menú:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Duplicar item de menú
  const duplicateMenuItem = async (id: string) => {
    const originalItem = menuItems.find(item => item.id === id)
    if (!originalItem) {
      throw new Error('Item de menú no encontrado')
    }

    const duplicatedItem = {
      ...originalItem,
      name: `${originalItem.name} (Copia)`,
      href: `${originalItem.href}_copia`
    }

    return createMenuItem(duplicatedItem)
  }

  // Conceder permiso a usuario
  const grantPermission = async (userId: string, menuItemId: string, permissionType: 'full' | 'read' | 'none') => {
    try {
      setError(null)

      const permission = await demoFunctions.grantPermission(userId, menuItemId, permissionType)
      setUserPermissions(prev => [...prev, permission])
      console.log('✅ Permiso concedido (modo demo):', permission)
      
      return permission
    } catch (error: any) {
      console.error('❌ Error concediendo permiso:', error)
      setError(error.message)
      throw error
    }
  }

  // Revocar permiso de usuario
  const revokePermission = async (userId: string, menuItemId: string) => {
    try {
      setError(null)

      await demoFunctions.revokePermission(userId, menuItemId)
      setUserPermissions(prev => prev.filter(perm => 
        !(perm.user_id === userId && perm.menu_item_id === menuItemId)
      ))
      console.log('✅ Permiso revocado (modo demo):', { userId, menuItemId })
      
    } catch (error: any) {
      console.error('❌ Error revocando permiso:', error)
      setError(error.message)
      throw error
    }
  }

  // Cargar permisos de usuario
  const loadUserPermissions = async (userId: string) => {
    try {
      setError(null)

      const permissions = await demoFunctions.loadUserPermissions(userId)
      setUserPermissions(permissions)
      console.log(`✅ ${permissions.length} permisos cargados para usuario (modo demo):`, userId)
      
      return permissions
    } catch (error: any) {
      console.error('❌ Error cargando permisos de usuario:', error)
      setError(error.message)
      throw error
    }
  }

  // Verificar si usuario tiene permiso
  const hasPermission = async (userId: string, menuItemId: string) => {
    const permissions = await loadUserPermissions(userId)
    return permissions.some(perm => 
      perm.user_id === userId && perm.menu_item_id === menuItemId && perm.is_active
    )
  }

  // Obtener items de menú accesibles
  const getAccessibleMenuItems = () => {
    const accessibleItems: NavigationItem[] = menuItems
      .filter(item => item.is_active && item.is_visible)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(item => ({
        id: item.id,
        name: item.name,
        path: item.href,
        href: item.href,
        icon: item.icon,
        description: item.description,
        isActive: true
      }))

    return accessibleItems
  }

  // Refrescar items de menú
  const refreshMenuItems = async () => {
    await loadMenuItems()
  }

  // Cargar menús al montar el componente
  useEffect(() => {
    loadMenuItems()
  }, [])

  const value: MenuManagerContextType = {
    menuItems,
    loading,
    error,
    userPermissions,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    duplicateMenuItem,
    grantPermission,
    revokePermission,
    loadUserPermissions,
    refreshMenuItems,
    getAccessibleMenuItems,
    hasPermission
  }

  return (
    <MenuManagerContext.Provider value={value}>
      {children}
    </MenuManagerContext.Provider>
  )
}
// Contexto centralizado para la gestión de estado del sistema de permisos
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'
import { useAuditLog } from '@/hooks/useAuditLog'
import { SystemIntegrationState, PermissionCacheState, UserSessionState, NavigationState } from '@/types/saas'

// Acciones del reducer
type SystemAction = 
  | { type: 'SET_PERMISSIONS'; payload: PermissionCacheState }
  | { type: 'SET_SESSION'; payload: UserSessionState }
  | { type: 'SET_NAVIGATION'; payload: NavigationState }
  | { type: 'INVALIDATE_CACHE' }
  | { type: 'UPDATE_SESSION_ACTIVITY'; payload: Date }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// Estado inicial con propiedades adicionales para UI
interface SystemStateWithUI extends SystemIntegrationState {
  loading: boolean
  error: string | null
}

const initialState: SystemStateWithUI = {
  permissions: {
    permissions: [],
    timestamp: 0,
    enterpriseId: '',
    sedeId: undefined,
    hierarchy: 'paciente',
    version: '1.0.0'
  },
  session: {
    sessionId: '',
    userId: '',
    enterpriseId: '',
    sedeId: undefined,
    loginTime: new Date(),
    lastActivity: new Date(),
    ipAddress: undefined,
    userAgent: '',
    isActive: false,
    permissions: []
  },
  navigation: {
    currentPath: '/dashboard',
    breadcrumbs: [],
    allowedRoutes: [],
    deniedRoutes: []
  },
  config: {
    sessionTimeout: 30, // minutos
    cacheDuration: 5, // minutos
    maxLoginAttempts: 5,
    enableAuditLogging: true,
    enableRealTimeSync: true,
    defaultRedirectPath: '/dashboard'
  },
  lastSync: new Date(),
  loading: false,
  error: null
}

// Reducer
function systemReducer(state: SystemIntegrationState, action: SystemAction): SystemIntegrationState {
  switch (action.type) {
    case 'SET_PERMISSIONS':
      return {
        ...state,
        permissions: action.payload,
        lastSync: new Date()
      }
    
    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload,
        lastSync: new Date()
      }
    
    case 'SET_NAVIGATION':
      return {
        ...state,
        navigation: action.payload
      }
    
    case 'UPDATE_SESSION_ACTIVITY':
      return {
        ...state,
        session: {
          ...state.session,
          lastActivity: action.payload
        },
        lastSync: new Date()
      }
    
    case 'INVALIDATE_CACHE':
      return {
        ...state,
        permissions: initialState.permissions,
        lastSync: new Date()
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        // @ts-ignore
        loading: action.payload
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        // @ts-ignore
        error: action.payload,
        lastSync: new Date()
      }
    
    default:
      return state
  }
}

interface SystemContextType {
  state: SystemStateWithUI
  actions: {
    updatePermissions: (permissions: PermissionCacheState) => void
    updateSession: (session: UserSessionState) => void
    updateNavigation: (navigation: NavigationState) => void
    updateActivity: () => void
    invalidateCache: () => void
    syncWithServer: () => Promise<void>
    handlePermissionChange: () => void
  }
}

const SystemContext = createContext<SystemContextType | undefined>(undefined)

export function useSystemState() {
  const context = useContext(SystemContext)
  if (context === undefined) {
    throw new Error('useSystemState debe ser usado dentro de un SystemProvider')
  }
  return context
}

interface SystemProviderProps {
  children: React.ReactNode
}

export function SystemProvider({ children }: SystemProviderProps) {
  const [state, dispatch] = useReducer(systemReducer, initialState)
  const { currentUser, invalidateCache: invalidateUserCache } = useCurrentUser()
  const { getUserPermissions, invalidatePermissionsCache } = usePermissionCheck()
  const { logAction } = useAuditLog()

  // Actualizar permisos
  const updatePermissions = useCallback((permissions: PermissionCacheState) => {
    dispatch({ type: 'SET_PERMISSIONS', payload: permissions })
    
    // Log del cambio de permisos
    if (state.config.enableAuditLogging) {
      logAction({
        action: 'PERMISSION_CHECK',
        resourceType: 'system',
        actionType: 'permissions_update',
        details: {
          previousPermissions: state.permissions.permissions,
          newPermissions: permissions.permissions,
          version: permissions.version
        }
      })
    }
  }, [state.config.enableAuditLogging, logAction, state.permissions.permissions])

  // Actualizar sesión
  const updateSession = useCallback((session: UserSessionState) => {
    dispatch({ type: 'SET_SESSION', payload: session })
  }, [])

  // Actualizar navegación
  const updateNavigation = useCallback((navigation: NavigationState) => {
    dispatch({ type: 'SET_NAVIGATION', payload: navigation })
  }, [])

  // Actualizar actividad
  const updateActivity = useCallback(() => {
    dispatch({ type: 'UPDATE_SESSION_ACTIVITY', payload: new Date() })
  }, [])

  // Invalidar cache
  const invalidateCache = useCallback(() => {
    dispatch({ type: 'INVALIDATE_CACHE' })
    invalidateUserCache()
    invalidatePermissionsCache()
    
    // Log de invalidación
    if (state.config.enableAuditLogging) {
      logAction({
        action: 'PERMISSION_CHECK',
        resourceType: 'system',
        actionType: 'cache_invalidate',
        details: {
          reason: 'manual_invalidation'
        }
      })
    }
  }, [invalidateUserCache, invalidatePermissionsCache, state.config.enableAuditLogging, logAction])

  // Sincronizar con el servidor
  const syncWithServer = useCallback(async () => {
    if (!currentUser) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const userPermissions = getUserPermissions()
      const now = new Date()
      
      const updatedPermissions: PermissionCacheState = {
        permissions: userPermissions,
        timestamp: now.getTime(),
        enterpriseId: currentUser.enterpriseId,
        sedeId: currentUser.sede,
        hierarchy: currentUser.hierarchy as any,
        version: '1.0.0'
      }

      updatePermissions(updatedPermissions)

      // Actualizar sesión si es necesario
      if (state.session.sessionId) {
        const updatedSession: UserSessionState = {
          ...state.session,
          lastActivity: now
        }
        updateSession(updatedSession)
      }

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error sincronizando' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [currentUser, getUserPermissions, state.session, updatePermissions, updateSession])

  // Manejar cambio de permisos
  const handlePermissionChange = useCallback(() => {
    invalidateCache()
    syncWithServer()
  }, [invalidateCache, syncWithServer])

  // Efectos para sincronización automática
  useEffect(() => {
    if (!currentUser) return

    // Sincronizar al montar
    syncWithServer()

    // Actualizar actividad cada 30 segundos
    const activityInterval = setInterval(updateActivity, 30 * 1000)

    // Sincronizar con el servidor cada 5 minutos
    const syncInterval = setInterval(syncWithServer, 5 * 60 * 1000)

    // Escuchar cambios de permisos
    const handlePermissionsChanged = (event: CustomEvent) => {
      handlePermissionChange()
    }

    window.addEventListener('permissionsChanged', handlePermissionsChanged as EventListener)

    return () => {
      clearInterval(activityInterval)
      clearInterval(syncInterval)
      window.removeEventListener('permissionsChanged', handlePermissionsChanged as EventListener)
    }
  }, [currentUser, syncWithServer, updateActivity, handlePermissionChange])

  // Escuchar cambios de ruta para actualizar navegación
  useEffect(() => {
    const handleLocationChange = () => {
      const navigation: NavigationState = {
        currentPath: window.location.pathname,
        breadcrumbs: [], // Se puede calcular basado en la ruta
        allowedRoutes: [], // Se puede obtener del sistema de permisos
        deniedRoutes: [] // Se puede obtener del sistema de permisos
      }
      updateNavigation(navigation)
    }

    handleLocationChange()
    window.addEventListener('popstate', handleLocationChange)
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [updateNavigation])

  const value: SystemContextType = {
    state: state as SystemStateWithUI,
    actions: {
      updatePermissions,
      updateSession,
      updateNavigation,
      updateActivity,
      invalidateCache,
      syncWithServer,
      handlePermissionChange
    }
  }

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  )
}

// Hook para usar el estado del sistema
export function useSystemIntegration() {
  const { state, actions } = useSystemState()
  const { currentUser } = useCurrentUser()

  // Computed values
  const isSessionActive = currentUser ? 
    Date.now() - state.session.lastActivity.getTime() < state.config.sessionTimeout * 60 * 1000 : 
    false

  const cacheAge = Date.now() - state.permissions.timestamp
  const isCacheExpired = cacheAge > state.config.cacheDuration * 60 * 1000

  return {
    // Estado
    state: state,
    currentUser,
    isSessionActive,
    isCacheExpired,
    cacheAge,
    
    // Acciones
    ...actions,
    
    // Utilidades
    needSync: isCacheExpired || !isSessionActive,
    getSystemInfo: () => ({
      version: '1.0.0',
      lastSync: state.lastSync,
      sessionDuration: Date.now() - state.session.loginTime.getTime(),
      cacheStatus: isCacheExpired ? 'expired' : 'valid'
    })
  }
}

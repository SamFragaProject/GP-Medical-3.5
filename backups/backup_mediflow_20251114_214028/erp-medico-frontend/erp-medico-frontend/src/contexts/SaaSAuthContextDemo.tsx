// Contexto de autenticación SaaS MODO DEMO PURO - Sin Supabase
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import toast from 'react-hot-toast'

interface EmpresaSedeInfo {
  empresaId: string
  empresaNombre: string
  sedeId: string
  sedeNombre: string
  configuracion?: any
}

interface SaaSUser {
  id: string
  email: string
  name: string
  hierarchy: string
  enterpriseId: string
  enterpriseName: string
  sede: string
  sedeNombre?: string
  empresaSede?: EmpresaSedeInfo
  phone?: string
  permissions: string[]
  status: string
  loginCount: number
  createdAt: Date
  updatedAt: Date
  metadata: any
  preferences: any
  lastActivity?: Date
  sessionInfo?: {
    sessionId: string
    loginTime: Date
    lastActivity: Date
    ipAddress?: string
    deviceInfo?: string
  }
}

interface AuthState {
  user: SaaSUser | null
  loading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

// Cache de permisos en localStorage
interface PermissionCache {
  permissions: string[]
  timestamp: number
  enterpriseId: string
  sedeId: string
  hierarchy: string
}

const PERMISSION_CACHE_KEY = 'mediflow_saas_permissions_cache'
const PERMISSION_CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Usuarios demo locales - Sin conexión a Supabase
const DEMO_USERS: Array<SaaSUser & { password: string }> = [
  {
    id: '1',
    email: 'admin@mediflow.mx',
    password: 'admin123',
    name: 'Administrador Sistema',
    hierarchy: 'super_admin',
    enterpriseId: '1',
    enterpriseName: 'MediFlow Corporativo',
    sede: '1',
    sedeNombre: 'Sede Principal',
    empresaSede: {
      empresaId: '1',
      empresaNombre: 'MediFlow Corporativo',
      sedeId: '1',
      sedeNombre: 'Sede Principal'
    },
    phone: '+52 55 1234-5678',
    permissions: [
      'dashboard.view',
      'dashboard.manage',
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'patients.view',
      'patients.create',
      'patients.edit',
      'patients.delete',
      'exams.view',
      'exams.create',
      'exams.edit',
      'exams.delete',
      'reports.view',
      'reports.manage',
      'settings.view',
      'settings.edit',
      'billing.view',
      'billing.manage'
    ],
    status: 'active',
    loginCount: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    metadata: { lastLogin: null },
    preferences: { theme: 'light', language: 'es' },
    lastActivity: new Date(),
    sessionInfo: {
      sessionId: 'demo-session-1',
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress: '127.0.0.1',
      deviceInfo: 'Demo Browser'
    }
  },
  {
    id: '2',
    email: 'medico@mediflow.mx',
    password: 'medico123',
    name: 'Dr. Juan Pérez',
    hierarchy: 'medico_trabajo',
    enterpriseId: '1',
    enterpriseName: 'MediFlow Corporativo',
    sede: '1',
    sedeNombre: 'Sede Principal',
    empresaSede: {
      empresaId: '1',
      empresaNombre: 'MediFlow Corporativo',
      sedeId: '1',
      sedeNombre: 'Sede Principal'
    },
    phone: '+52 55 2345-6789',
    permissions: [
      'dashboard.view',
      'patients.view',
      'patients.create',
      'patients.edit',
      'exams.view',
      'exams.create',
      'exams.edit',
      'reports.view'
    ],
    status: 'active',
    loginCount: 1,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date(),
    metadata: { cedula: '12345', especialidad: 'Medicina del Trabajo' },
    preferences: { theme: 'light', language: 'es' },
    lastActivity: new Date(),
    sessionInfo: {
      sessionId: 'demo-session-2',
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress: '127.0.0.1',
      deviceInfo: 'Demo Browser'
    }
  },
  {
    id: '3',
    email: 'enfermera@mediflow.mx',
    password: 'enfermera123',
    name: 'Enf. María García',
    hierarchy: 'enfermera_especializada',
    enterpriseId: '1',
    enterpriseName: 'MediFlow Corporativo',
    sede: '1',
    sedeNombre: 'Sede Principal',
    empresaSede: {
      empresaId: '1',
      empresaNombre: 'MediFlow Corporativo',
      sedeId: '1',
      sedeNombre: 'Sede Principal'
    },
    phone: '+52 55 3456-7890',
    permissions: [
      'dashboard.view',
      'patients.view',
      'patients.edit',
      'exams.view',
      'exams.create',
      'reports.view'
    ],
    status: 'active',
    loginCount: 1,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date(),
    metadata: { cedula: '67890', especialidad: 'Enfermería' },
    preferences: { theme: 'light', language: 'es' },
    lastActivity: new Date(),
    sessionInfo: {
      sessionId: 'demo-session-3',
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress: '127.0.0.1',
      deviceInfo: 'Demo Browser'
    }
  },
  {
    id: '4',
    email: 'administrador@mediflow.mx',
    password: 'admin123',
    name: 'Admin Empresa',
    hierarchy: 'admin_empresa',
    enterpriseId: '1',
    enterpriseName: 'MediFlow Corporativo',
    sede: '1',
    sedeNombre: 'Sede Principal',
    empresaSede: {
      empresaId: '1',
      empresaNombre: 'MediFlow Corporativo',
      sedeId: '1',
      sedeNombre: 'Sede Principal'
    },
    phone: '+52 55 4567-8901',
    permissions: [
      'dashboard.view',
      'users.view',
      'users.create',
      'users.edit',
      'patients.view',
      'patients.create',
      'patients.edit',
      'exams.view',
      'reports.view'
    ],
    status: 'active',
    loginCount: 1,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date(),
    metadata: {},
    preferences: { theme: 'dark', language: 'es' },
    lastActivity: new Date(),
    sessionInfo: {
      sessionId: 'demo-session-4',
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress: '127.0.0.1',
      deviceInfo: 'Demo Browser'
    }
  },
  {
    id: '5',
    email: 'coordinador@mediflow.mx',
    password: 'coord123',
    name: 'Coordinador de Sede',
    hierarchy: 'coordinador_sede',
    enterpriseId: '1',
    enterpriseName: 'MediFlow Corporativo',
    sede: '1',
    sedeNombre: 'Sede Principal',
    empresaSede: {
      empresaId: '1',
      empresaNombre: 'MediFlow Corporativo',
      sedeId: '1',
      sedeNombre: 'Sede Principal'
    },
    phone: '+52 55 5678-9012',
    permissions: [
      'dashboard.view',
      'users.view',
      'patients.view',
      'exams.view',
      'reports.view'
    ],
    status: 'active',
    loginCount: 1,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date(),
    metadata: {},
    preferences: { theme: 'light', language: 'es' },
    lastActivity: new Date(),
    sessionInfo: {
      sessionId: 'demo-session-5',
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress: '127.0.0.1',
      deviceInfo: 'Demo Browser'
    }
  },
  {
    id: '6',
    email: 'tecnico@mediflow.mx',
    password: 'tecnico123',
    name: 'Técnico en Radiología',
    hierarchy: 'tecnico_radiologia',
    enterpriseId: '1',
    enterpriseName: 'MediFlow Corporativo',
    sede: '1',
    sedeNombre: 'Sede Principal',
    empresaSede: {
      empresaId: '1',
      empresaNombre: 'MediFlow Corporativo',
      sedeId: '1',
      sedeNombre: 'Sede Principal'
    },
    phone: '+52 55 6789-0123',
    permissions: [
      'dashboard.view',
      'patients.view',
      'exams.view',
      'exams.create'
    ],
    status: 'active',
    loginCount: 1,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date(),
    metadata: {},
    preferences: { theme: 'light', language: 'es' },
    lastActivity: new Date(),
    sessionInfo: {
      sessionId: 'demo-session-6',
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress: '127.0.0.1',
      deviceInfo: 'Demo Browser'
    }
  },
  {
    id: '7',
    email: 'laboratorista@mediflow.mx',
    password: 'lab123',
    name: 'Laboratorista Clínico',
    hierarchy: 'laboratorista_clinico',
    enterpriseId: '1',
    enterpriseName: 'MediFlow Corporativo',
    sede: '1',
    sedeNombre: 'Sede Principal',
    empresaSede: {
      empresaId: '1',
      empresaNombre: 'MediFlow Corporativo',
      sedeId: '1',
      sedeNombre: 'Sede Principal'
    },
    phone: '+52 55 7890-1234',
    permissions: [
      'dashboard.view',
      'patients.view',
      'exams.view',
      'exams.edit'
    ],
    status: 'active',
    loginCount: 1,
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date(),
    metadata: {},
    preferences: { theme: 'light', language: 'es' },
    lastActivity: new Date(),
    sessionInfo: {
      sessionId: 'demo-session-7',
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress: '127.0.0.1',
      deviceInfo: 'Demo Browser'
    }
  },
  {
    id: '8',
    email: 'rh@mediflow.mx',
    password: 'rh123',
    name: 'Responsable RH',
    hierarchy: 'responsable_rh',
    enterpriseId: '1',
    enterpriseName: 'MediFlow Corporativo',
    sede: '1',
    sedeNombre: 'Sede Principal',
    empresaSede: {
      empresaId: '1',
      empresaNombre: 'MediFlow Corporativo',
      sedeId: '1',
      sedeNombre: 'Sede Principal'
    },
    phone: '+52 55 8901-2345',
    permissions: [
      'dashboard.view',
      'patients.view',
      'patients.create',
      'patients.edit',
      'reports.view'
    ],
    status: 'active',
    loginCount: 1,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date(),
    metadata: {},
    preferences: { theme: 'light', language: 'es' },
    lastActivity: new Date(),
    sessionInfo: {
      sessionId: 'demo-session-8',
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress: '127.0.0.1',
      deviceInfo: 'Demo Browser'
    }
  },
  {
    id: '9',
    email: 'gerente@mediflow.mx',
    password: 'gerente123',
    name: 'Gerente General',
    hierarchy: 'gerente_general',
    enterpriseId: '1',
    enterpriseName: 'MediFlow Corporativo',
    sede: '1',
    sedeNombre: 'Sede Principal',
    empresaSede: {
      empresaId: '1',
      empresaNombre: 'MediFlow Corporativo',
      sedeId: '1',
      sedeNombre: 'Sede Principal'
    },
    phone: '+52 55 9012-3456',
    permissions: [
      'dashboard.view',
      'dashboard.manage',
      'users.view',
      'patients.view',
      'exams.view',
      'reports.view',
      'reports.manage'
    ],
    status: 'active',
    loginCount: 1,
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date(),
    metadata: {},
    preferences: { theme: 'dark', language: 'es' },
    lastActivity: new Date(),
    sessionInfo: {
      sessionId: 'demo-session-9',
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress: '127.0.0.1',
      deviceInfo: 'Demo Browser'
    }
  }
]

// Mapeo de jerarquías para permisos
const HIERARCHY_PERMISSIONS: Record<string, string[]> = {
  'super_admin': ['*'], // Todos los permisos
  'admin_empresa': [
    'dashboard.view', 'dashboard.manage',
    'users.view', 'users.create', 'users.edit',
    'patients.view', 'patients.create', 'patients.edit',
    'exams.view', 'reports.view'
  ],
  'medico_trabajo': [
    'dashboard.view',
    'patients.view', 'patients.create', 'patients.edit',
    'exams.view', 'exams.create', 'exams.edit',
    'reports.view'
  ],
  'enfermera_especializada': [
    'dashboard.view',
    'patients.view', 'patients.edit',
    'exams.view', 'exams.create',
    'reports.view'
  ],
  'coordinador_sede': [
    'dashboard.view',
    'users.view', 'patients.view',
    'exams.view', 'reports.view'
  ],
  'tecnico_radiologia': [
    'dashboard.view',
    'patients.view',
    'exams.view', 'exams.create'
  ],
  'laboratorista_clinico': [
    'dashboard.view',
    'patients.view',
    'exams.view', 'exams.edit'
  ],
  'responsable_rh': [
    'dashboard.view',
    'patients.view', 'patients.create', 'patients.edit',
    'reports.view'
  ],
  'gerente_general': [
    'dashboard.view', 'dashboard.manage',
    'users.view',
    'patients.view',
    'exams.view',
    'reports.view', 'reports.manage'
  ]
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  // Función para obtener permisos de la jerarquía
  const getPermissionsByHierarchy = (hierarchy: string): string[] => {
    return HIERARCHY_PERMISSIONS[hierarchy] || []
  }

  // Función para obtener el usuario desde localStorage
  const getStoredUser = (): SaaSUser | null => {
    try {
      const stored = localStorage.getItem('mediflow_demo_user')
      if (stored) {
        const userData = JSON.parse(stored)
        return {
          ...userData,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt),
          lastActivity: new Date(userData.lastActivity),
          sessionInfo: {
            ...userData.sessionInfo,
            loginTime: new Date(userData.sessionInfo.loginTime),
            lastActivity: new Date(userData.sessionInfo.lastActivity)
          }
        }
      }
    } catch (error) {
      console.error('Error getting stored user:', error)
    }
    return null
  }

  // Función para guardar el usuario en localStorage
  const storeUser = (user: SaaSUser) => {
    try {
      localStorage.setItem('mediflow_demo_user', JSON.stringify(user))
      localStorage.setItem('mediflow_demo_session', JSON.stringify({
        sessionId: user.sessionInfo?.sessionId,
        loginTime: user.sessionInfo?.loginTime,
        lastActivity: user.lastActivity
      }))
    } catch (error) {
      console.error('Error storing user:', error)
    }
  }

  // Función para limpiar el localStorage
  const clearUserStorage = () => {
    localStorage.removeItem('mediflow_demo_user')
    localStorage.removeItem('mediflow_demo_session')
  }

  // Función de login DEMO - Sin Supabase
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800))

      // Buscar usuario en DEMO_USERS
      const user = DEMO_USERS.find(u => u.email === email && u.password === password)
      
      if (!user) {
        setAuthState(prev => ({ ...prev, loading: false, error: 'Credenciales incorrectas' }))
        toast.error('Credenciales incorrectas')
        return false
      }

      // Crear objeto de usuario sin password
      const { password: _, ...userWithoutPassword } = user
      
      const userData: SaaSUser = {
        ...userWithoutPassword,
        loginCount: user.loginCount + 1,
        updatedAt: new Date(),
        lastActivity: new Date(),
        sessionInfo: {
          sessionId: `demo-session-${Date.now()}`,
          loginTime: new Date(),
          lastActivity: new Date(),
          ipAddress: '127.0.0.1',
          deviceInfo: 'Demo Browser'
        }
      }

      // Guardar en localStorage
      storeUser(userData)

      setAuthState({
        user: userData,
        loading: false,
        error: null
      })

      toast.success(`Bienvenido, ${userData.name}`)
      return true

    } catch (error) {
      console.error('Demo login error:', error)
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Error en el login demo' 
      }))
      toast.error('Error en el login demo')
      return false
    }
  }, [])

  // Función de logout DEMO - Sin Supabase
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Limpiar localStorage
      clearUserStorage()
      
      setAuthState({
        user: null,
        loading: false,
        error: null
      })

      toast.success('Sesión cerrada')
    } catch (error) {
      console.error('Demo logout error:', error)
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Error en el logout demo' 
      }))
    }
  }, [])

  // Función para actualizar el usuario
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const storedUser = getStoredUser()
      if (storedUser) {
        setAuthState({
          user: { ...storedUser, lastActivity: new Date() },
          loading: false,
          error: null
        })
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null
        })
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Error refreshing user'
      }))
    }
  }, [])

  // Cargar usuario desde localStorage al inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = getStoredUser()
        if (storedUser) {
          setAuthState({
            user: storedUser,
            loading: false,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setAuthState({
          user: null,
          loading: false,
          error: 'Error initializing auth'
        })
      }
    }

    initializeAuth()
  }, [])

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    refreshUser,
    isAuthenticated: !!authState.user
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
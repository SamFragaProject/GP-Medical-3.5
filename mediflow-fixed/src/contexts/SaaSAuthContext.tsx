// Contexto de autenticación SaaS - VERSIÓN DEMO LOCAL SIN SUPABASE
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import toast from 'react-hot-toast'
import { SaaSHierarchy } from '@/types/saas'

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
    userAgent?: string
  }
  password?: string // Solo para usuarios demo
}

interface SaaSAuthContextType {
  user: SaaSUser | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  hasHierarchyRole: (roles: string[]) => boolean
  canManagePatients: boolean
  canViewMedicalHistory: boolean
  canAccessBilling: boolean
  getCachedPermissions: () => PermissionCache | null
  setCachedPermissions: (permissions: string[]) => void
  invalidatePermissionsCache: () => void
  getUserPermissions: () => string[]
}

interface SaaSAuthProviderProps {
  children: ReactNode
}

// Definición completa de usuarios demo
const DEMO_USERS: SaaSUser[] = [
  {
    id: 'admin-001',
    email: 'admin@mediflow.mx',
    password: 'admin123',
    name: 'Dr. Carlos Admin',
    hierarchy: 'super_admin',
    enterpriseId: 'empresa-001',
    enterpriseName: 'MediFlow Corporativo',
    sede: 'Matriz CDMX',
    phone: '+52 55 1234-5678',
    permissions: ['*'], // Super admin tiene acceso a todo
    status: 'active',
    loginCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      cedula_profesional: '1234567',
      especialidad: 'Medicina del Trabajo',
      certificaciones: ['NOM-006-STPS', 'NOM-017-STPS'],
      ultimo_acceso: new Date().toISOString()
    },
    preferences: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Mexico_City',
      notifications: { email: true, push: true, sms: false, appointmentReminders: true, systemAlerts: true, auditNotifications: true },
      dashboard: { widgets: ['pacientes', 'citas', 'examenes', 'alertas', 'ingresos'], layout: 'grid', refreshInterval: 300 }
    }
  },
  {
    id: 'admin-empresa-001',
    email: 'admin.empresa@mediflow.mx',
    password: 'adminemp123',
    name: 'Dra. Patricia Fernández',
    hierarchy: 'admin_empresa',
    enterpriseId: 'empresa-001',
    enterpriseName: 'MediFlow Corporativo',
    sede: 'Dirección General',
    phone: '+52 55 9988-7766',
    permissions: ['patients_manage', 'billing_manage', 'reports_manage', 'agenda_manage', 'inventory_manage', 'enterprise_config'],
    status: 'active',
    loginCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      especialidad: 'Administración en Salud',
      puesto: 'Administradora de Empresa',
      turno: 'Administrativo'
    },
    preferences: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Mexico_City',
      notifications: { email: true, push: true, sms: false, appointmentReminders: true, systemAlerts: true, auditNotifications: true },
      dashboard: { widgets: ['ingresos', 'pacientes', 'reportes'], layout: 'grid', refreshInterval: 300 }
    }
  },
  {
    id: 'medico-001',
    email: 'medico@mediflow.mx',
    password: 'medico123',
    name: 'Dra. Luna Rivera',
    hierarchy: 'medico_trabajo',
    enterpriseId: 'empresa-001',
    enterpriseName: 'MediFlow Corporativo',
    sede: 'Sucursal Polanco',
    phone: '+52 55 8765-4321',
    permissions: ['patients_manage', 'medical_view', 'medical_manage', 'exams_manage', 'reports_view', 'agenda_manage', 'billing_view', 'certifications_view'],
    status: 'active',
    loginCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      cedula_profesional: '2345678',
      especialidad: 'Medicina del Trabajo e Higiene Industrial',
      certificaciones: ['NOM-006-STPS', 'NOM-017-STPS', 'ISO 45001'],
      turno: 'Matutino'
    },
    preferences: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Mexico_City',
      notifications: { email: true, push: true, sms: false, appointmentReminders: true, systemAlerts: true, auditNotifications: false },
      dashboard: { widgets: ['pacientes_hoy', 'examenes_pendientes', 'agenda'], layout: 'grid', refreshInterval: 180 }
    }
  },
  {
    id: 'especialista-001',
    email: 'especialista@mediflow.mx',
    password: 'especialista123',
    name: 'Dr. Roberto Silva',
    hierarchy: 'medico_especialista',
    enterpriseId: 'empresa-001',
    enterpriseName: 'MediFlow Corporativo',
    sede: 'Sucursal Roma',
    phone: '+52 55 5567-8901',
    permissions: ['patients_manage', 'medical_view', 'medical_manage', 'reports_view', 'exams_specialized'],
    status: 'active',
    loginCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      cedula_profesional: '3456789',
      especialidad: 'Cardiología y Medicina Interna',
      certificaciones: ['Certificado en Cardiología', 'Medicina Interna']
    },
    preferences: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Mexico_City',
      notifications: { email: true, push: true, sms: false, appointmentReminders: true, systemAlerts: true, auditNotifications: false },
      dashboard: { widgets: ['especialidades', 'consultas_especializadas'], layout: 'grid', refreshInterval: 300 }
    }
  },
  {
    id: 'laboratorio-001',
    email: 'laboratorio@mediflow.mx',
    password: 'lab123',
    name: 'Dr. Miguel Ángel Torres',
    hierarchy: 'medico_laboratorista',
    enterpriseId: 'empresa-001',
    enterpriseName: 'MediFlow Corporativo',
    sede: 'Laboratorio Central',
    phone: '+52 55 1122-3344',
    permissions: ['medical_view', 'medical_manage', 'laboratory_manage', 'exams_laboratory', 'reports_laboratory'],
    status: 'active',
    loginCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      cedula_profesional: '4567890',
      especialidad: 'Medicina de Laboratorio',
      acreditaciones: ['COFEPRIS', 'CLIA']
    },
    preferences: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Mexico_City',
      notifications: { email: true, push: true, sms: false, appointmentReminders: false, systemAlerts: true, auditNotifications: false },
      dashboard: { widgets: ['muestras', 'resultados_laboratorio'], layout: 'grid', refreshInterval: 180 }
    }
  },
  {
    id: 'recepcion-001',
    email: 'recepcion@mediflow.mx',
    password: 'recepcion123',
    name: 'Ana Patricia López',
    hierarchy: 'recepcion',
    enterpriseId: 'empresa-001',
    enterpriseName: 'MediFlow Corporativo',
    sede: 'Matriz CDMX',
    phone: '+52 55 3344-5566',
    permissions: ['patients_manage', 'billing_view', 'agenda_manage', 'scheduling_view'],
    status: 'active',
    loginCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      puesto: 'Coordinadora de Recepción',
      turnos_rotativos: true,
      certificacion_atencion_cliente: true
    },
    preferences: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Mexico_City',
      notifications: { email: true, push: true, sms: true, appointmentReminders: true, systemAlerts: true, auditNotifications: false },
      dashboard: { widgets: ['citas_hoy', 'pacientes_pendientes', 'cobranza'], layout: 'grid', refreshInterval: 120 }
    }
  },
  {
    id: 'paciente-001',
    email: 'paciente@mediflow.mx',
    password: 'paciente123',
    name: 'Juan Carlos Pérez',
    hierarchy: 'paciente',
    enterpriseId: 'empresa-001',
    enterpriseName: 'MediFlow Corporativo',
    sede: 'Paciente Externo',
    phone: '+52 55 7788-9900',
    permissions: ['medical_view', 'appointments_view', 'reports_view'],
    status: 'active',
    loginCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      fecha_nacimiento: '1985-03-15',
      empresa_trabajo: 'Tech Solutions SA de CV',
      tipo_examen: 'Periódico Anual',
      grupo_sanguineo: 'O+'
    },
    preferences: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Mexico_City',
      notifications: { email: true, push: true, sms: false, appointmentReminders: true, systemAlerts: false, auditNotifications: false },
      dashboard: { widgets: ['mis_citas', 'mi_historial', 'proximos_examenes'], layout: 'grid', refreshInterval: 300 }
    }
  },
  {
    id: 'recepcion-demo-001',
    email: 'recepcion@demo.mx',
    password: 'demo123',
    name: 'Recepcionista Demo',
    hierarchy: 'recepcion',
    enterpriseId: 'empresa-001',
    enterpriseName: 'MediFlow Corporativo',
    sede: 'Matriz CDMX',
    phone: '+52 55 0000-0000',
    permissions: ['patients_manage', 'billing_view', 'agenda_manage', 'scheduling_view'],
    status: 'active',
    loginCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      puesto: 'Recepcionista Demo',
      turnos_rotativos: false,
      certificacion_atencion_cliente: true
    },
    preferences: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Mexico_City',
      notifications: { email: true, push: true, sms: true, appointmentReminders: true, systemAlerts: true, auditNotifications: false },
      dashboard: { widgets: ['citas_hoy', 'pacientes_pendientes'], layout: 'grid', refreshInterval: 120 }
    }
  },
  {
    id: 'paciente-demo-001',
    email: 'paciente@demo.mx',
    password: 'demo123',
    name: 'Paciente Demo',
    hierarchy: 'paciente',
    enterpriseId: 'empresa-001',
    enterpriseName: 'MediFlow Corporativo',
    sede: 'Paciente Externo',
    phone: '+52 55 0000-0001',
    permissions: ['medical_view', 'appointments_view', 'reports_view'],
    status: 'active',
    loginCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      fecha_nacimiento: '1990-01-01',
      empresa_trabajo: 'Demo Company',
      tipo_examen: 'Demo Examen'
    },
    preferences: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Mexico_City',
      notifications: { email: true, push: true, sms: false, appointmentReminders: true, systemAlerts: false, auditNotifications: false },
      dashboard: { widgets: ['mis_citas', 'mi_historial'], layout: 'grid', refreshInterval: 300 }
    }
  }
]

// Permisos por jerarquía
const HIERARCHY_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['*'],
  admin_empresa: ['patients_manage', 'billing_manage', 'reports_manage', 'agenda_manage', 'inventory_manage', 'enterprise_config'],
  medico_trabajo: ['patients_manage', 'medical_view', 'medical_manage', 'exams_manage', 'reports_view', 'agenda_manage', 'billing_view', 'certifications_view'],
  medico_especialista: ['patients_manage', 'medical_view', 'medical_manage', 'reports_view', 'exams_specialized'],
  medico_laboratorista: ['patients_manage', 'medical_view', 'exams_manage', 'reports_view', 'inventory_view'],
  recepcion: ['patients_manage', 'billing_view', 'agenda_manage', 'scheduling_view'],
  paciente: ['medical_view', 'appointments_view', 'reports_view'],
  paciente_demo: ['medical_view', 'appointments_view', 'reports_view']
}

const SaaSAuthContext = createContext<SaaSAuthContextType | undefined>(undefined)

export function SaaSAuthProvider({ children }: SaaSAuthProviderProps) {
  const [user, setUser] = useState<SaaSUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [permissionsCache, setPermissionsCache] = useState<string[]>([])

  // Funciones de cache de permisos
  const getCachedPermissions = useCallback((): PermissionCache | null => {
    try {
      const cached = localStorage.getItem(PERMISSION_CACHE_KEY)
      if (!cached) return null

      const parsed = JSON.parse(cached)
      const now = Date.now()

      // Verificar si el cache está expirado
      if (now - parsed.timestamp > PERMISSION_CACHE_DURATION) {
        localStorage.removeItem(PERMISSION_CACHE_KEY)
        return null
      }

      // Verificar si la empresa/sede/jerarquía coincide
      if (parsed.enterpriseId !== user?.enterpriseId || 
          parsed.sedeId !== user?.sede ||
          parsed.hierarchy !== user?.hierarchy) {
        localStorage.removeItem(PERMISSION_CACHE_KEY)
        return null
      }

      return parsed
    } catch (error) {
      console.error('Error leyendo cache de permisos:', error)
      return null
    }
  }, [user])

  const setCachedPermissions = useCallback((permissions: string[]) => {
    try {
      if (!user) return
      
      const cacheData: PermissionCache = {
        permissions,
        timestamp: Date.now(),
        enterpriseId: user.enterpriseId,
        sedeId: user.sede || '',
        hierarchy: user.hierarchy
      }
      localStorage.setItem(PERMISSION_CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error guardando cache de permisos:', error)
    }
  }, [user])

  const invalidatePermissionsCache = useCallback(() => {
    localStorage.removeItem(PERMISSION_CACHE_KEY)
  }, [])

  // Verificar sesión guardada al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Verificando sesión local...')
        
        const savedUser = localStorage.getItem('mediflow_saas_user')
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          parsedUser.createdAt = new Date(parsedUser.createdAt)
          parsedUser.updatedAt = new Date(parsedUser.updatedAt)
          setUser(parsedUser)
          
          // Cargar permisos del cache si existe
          const cachedPerms = getCachedPermissions()
          if (cachedPerms) {
            setPermissionsCache(cachedPerms.permissions)
          }
          
          console.log('✅ Sesión local restaurada:', parsedUser.email)
        } else {
          console.log('ℹ️ No hay sesión guardada')
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        localStorage.removeItem('mediflow_saas_user')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [getCachedPermissions])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('🔐 Intentando login demo para:', email)
      
      // Simular delay de autenticación
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const demoUser = DEMO_USERS.find(
        u => u.email === email && u.password === password
      )
      
      if (!demoUser) {
        console.warn('❌ Usuario no encontrado:', email)
        throw new Error('Email o contraseña incorrectos')
      }
      
      console.log('✅ Usuario encontrado:', demoUser.name)
      
      const { password: _, ...userWithoutPassword } = demoUser
      const demoUserWithSession: SaaSUser = {
        ...userWithoutPassword as SaaSUser,
        loginCount: demoUser.loginCount + 1,
        lastActivity: new Date(),
        sessionInfo: {
          sessionId: crypto.randomUUID(),
          loginTime: new Date(),
          lastActivity: new Date()
        }
      }
      
      setUser(demoUserWithSession)
      localStorage.setItem('mediflow_saas_user', JSON.stringify(demoUserWithSession))
      
      // Cache de permisos para usuarios demo
      setCachedPermissions(demoUserWithSession.permissions)
      setPermissionsCache(demoUserWithSession.permissions)
      
      console.log('🎉 Login exitoso:', demoUserWithSession.name)
      toast.success(`¡Bienvenido ${demoUserWithSession.name}! (Modo Demo)`)
      
    } catch (error: any) {
      console.error('❌ Error en login:', error.message)
      toast.error(error.message || 'Error al iniciar sesión')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      setUser(null)
      localStorage.removeItem('mediflow_saas_user')
      localStorage.removeItem(PERMISSION_CACHE_KEY)
      setPermissionsCache([])
      
      console.log('👋 Logout exitoso')
      toast.success('Sesión cerrada correctamente')
    } catch (error) {
      console.error('Error en logout:', error)
      toast.error('Error al cerrar sesión')
    } finally {
      setLoading(false)
    }
  }

  // Funciones de permisos
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false
    
    // Super admin tiene acceso a todo
    if (user.permissions.includes('*')) return true
    
    return user.permissions.includes(permission)
  }, [user])

  const hasRole = useCallback((role: string): boolean => {
    return user?.hierarchy === role || false
  }, [user])

  const hasHierarchyRole = useCallback((roles: string[]): boolean => {
    return user ? roles.includes(user.hierarchy) : false
  }, [user])

  const isAuthenticated = !!user

  const canManagePatients = hasPermission('patients_manage')
  const canViewMedicalHistory = hasPermission('medical_view')
  const canAccessBilling = hasPermission('billing_manage') || hasPermission('billing_view')

  const value: SaaSAuthContextType = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut,
    hasPermission,
    hasRole,
    hasHierarchyRole,
    canManagePatients,
    canViewMedicalHistory,
    canAccessBilling,
    getCachedPermissions,
    setCachedPermissions,
    invalidatePermissionsCache,
    getUserPermissions: () => permissionsCache
  }

  return (
    <SaaSAuthContext.Provider value={value}>
      {children}
    </SaaSAuthContext.Provider>
  )
}

// Hook para usar el contexto de autenticación
export function useSaaSAuth() {
  const context = useContext(SaaSAuthContext)
  if (context === undefined) {
    throw new Error('useSaaSAuth must be used within a SaaSAuthProvider')
  }
  return context
}

// Hook para permisos (compatibilidad con Layout.tsx)
export function useSaaSPermissions() {
  const { 
    user, 
    hasPermission, 
    hasRole, 
    hasHierarchyRole,
    canManagePatients, 
    canViewMedicalHistory, 
    canAccessBilling 
  } = useSaaSAuth()

  return {
    user,
    hasRole,
    hasHierarchyRole,
    hasPermission,
    isSuperAdmin: hasRole('super_admin'),
    isAdminEmpresa: hasRole('admin_empresa'),
    isMedico: hasHierarchyRole(['medico_trabajo', 'medico_especialista']),
    isAdmin: hasHierarchyRole(['super_admin', 'admin_empresa']),
    canManagePatients,
    canViewMedicalHistory,
    canAccessBilling,
    hasAnyPermission: (permissions: string[]) => permissions.some(permission => hasPermission(permission)),
    hasAllPermissions: (permissions: string[]) => permissions.every(permission => hasPermission(permission)),
    getUserHierarchy: () => user?.hierarchy || '',
    canManageUser: hasPermission('enterprise_config'),
    canViewAuditLogs: hasPermission('audit_logs_view')
  }
}
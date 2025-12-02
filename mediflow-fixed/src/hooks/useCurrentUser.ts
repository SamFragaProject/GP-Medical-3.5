// Hook para obtener información del usuario actual - VERSIÓN DEMO SIN SUPABASE
import { useState, useEffect, useCallback } from 'react'
import { useSaaSAuth } from '@/contexts/SaaSAuthContext'

interface EmpresaInfo {
  id: string
  nombre: string
  razon_social: string
  rfc: string
  direccion: string
  telefono: string
  email: string
  configuracion: any
  status: 'active' | 'inactive' | 'suspended'
  plan_type: string
  created_at: string
  updated_at: string
}

interface SedeInfo {
  id: string
  empresa_id: string
  nombre: string
  direccion: string
  telefono: string
  email: string
  configuracion: any
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

interface ExtendedUserInfo {
  id: string
  email: string
  name: string
  hierarchy: string
  enterpriseId: string
  enterpriseName: string
  sede: string
  sedeName?: string
  phone?: string
  permissions: string[]
  status: string
  loginCount: number
  createdAt: Date
  updatedAt: Date
  metadata: any
  preferences: any
  empresaInfo?: EmpresaInfo
  sedeInfo?: SedeInfo
  sessionInfo?: {
    lastActivity: Date
    sessionDuration: number
    ipAddress?: string
    userAgent: string
  }
}

interface UserSessionData {
  sessionId: string
  enterpriseId: string
  sedeId?: string
  loginTime: Date
  lastActivity: Date
  ipAddress?: string
  userAgent: string
  permissions: string[]
}

const USER_CACHE_KEY = 'mediflow_current_user_cache'
const SESSION_CACHE_KEY = 'mediflow_user_session_cache'

// Datos demo para empresas
const DEMO_EMPRESAS: EmpresaInfo[] = [
  {
    id: 'empresa-001',
    nombre: 'MediFlow Corporativo',
    razon_social: 'MediFlow Corporativo S.A. de C.V.',
    rfc: 'MFC123456789',
    direccion: 'Av. Reforma 123, CDMX, México',
    telefono: '+52 55 1234-5678',
    email: 'contacto@mediflow.mx',
    configuracion: {
      timezone: 'America/Mexico_City',
      language: 'es',
      currency: 'MXN',
      features: ['medicina_trabajo', 'facturacion', 'inventario', 'reportes']
    },
    status: 'active',
    plan_type: 'enterprise',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-04T00:00:00Z'
  }
]

// Datos demo para sedes
const DEMO_SEDES: SedeInfo[] = [
  {
    id: 'sede-001',
    empresa_id: 'empresa-001',
    nombre: 'Matriz CDMX',
    direccion: 'Av. Reforma 123, Col. Centro, CDMX',
    telefono: '+52 55 1234-5678',
    email: 'matriz@mediflow.mx',
    configuracion: {
      horario_atencion: '08:00-18:00',
      servicios: ['consulta_general', 'medicina_trabajo', 'laboratorio'],
      capacidad_pacientes: 100
    },
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-04T00:00:00Z'
  },
  {
    id: 'sede-002',
    empresa_id: 'empresa-001',
    nombre: 'Sucursal Polanco',
    direccion: 'Av. Polanco 456, Col. Polanco, CDMX',
    telefono: '+52 55 8765-4321',
    email: 'polanco@mediflow.mx',
    configuracion: {
      horario_atencion: '07:00-19:00',
      servicios: ['medicina_trabajo', 'especialidades'],
      capacidad_pacientes: 80
    },
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-04T00:00:00Z'
  },
  {
    id: 'sede-003',
    empresa_id: 'empresa-001',
    nombre: 'Sucursal Roma',
    direccion: 'Av. Roma 789, Col. Roma, CDMX',
    telefono: '+52 55 5567-8901',
    email: 'roma@mediflow.mx',
    configuracion: {
      horario_atencion: '08:00-17:00',
      servicios: ['especialidades', 'diagnostico'],
      capacidad_pacientes: 60
    },
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-04T00:00:00Z'
  },
  {
    id: 'sede-004',
    empresa_id: 'empresa-001',
    nombre: 'Laboratorio Central',
    direccion: 'Laboratorio Central, CDMX',
    telefono: '+52 55 1122-3344',
    email: 'laboratorio@mediflow.mx',
    configuracion: {
      horario_atencion: '06:00-22:00',
      servicios: ['laboratorio', 'estudios_especializados'],
      capacidad_muestras: 500
    },
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-04T00:00:00Z'
  }
]

export function useCurrentUser() {
  const { user, loading: authLoading } = useSaaSAuth()
  const [currentUser, setCurrentUser] = useState<ExtendedUserInfo | null>(null)
  const [empresaInfo, setEmpresaInfo] = useState<EmpresaInfo | null>(null)
  const [sedeInfo, setSedeInfo] = useState<SedeInfo | null>(null)
  const [sessionData, setSessionData] = useState<UserSessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cache de datos del usuario
  const getCachedUserData = useCallback((): { user: ExtendedUserInfo; empresa: EmpresaInfo | null; sede: SedeInfo | null } | null => {
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY)
      if (!cached) return null

      const parsed = JSON.parse(cached)
      const now = Date.now()

      // Verificar si el cache es reciente (5 minutos)
      if (now - parsed.timestamp > 5 * 60 * 1000) {
        localStorage.removeItem(USER_CACHE_KEY)
        return null
      }

      return {
        user: parsed.user,
        empresa: parsed.empresa,
        sede: parsed.sede
      }
    } catch (error) {
      console.error('Error leyendo cache de usuario:', error)
      return null
    }
  }, [])

  // Guardar datos del usuario en cache
  const setCachedUserData = useCallback((user: ExtendedUserInfo, empresa: EmpresaInfo | null, sede: SedeInfo | null) => {
    try {
      const cacheData = {
        user,
        empresa,
        sede,
        timestamp: Date.now()
      }
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error guardando cache de usuario:', error)
    }
  }, [])

  // Cargar información de la empresa DEMO
  const loadEmpresaInfo = useCallback(async (empresaId: string): Promise<EmpresaInfo | null> => {
    if (!empresaId) return null

    try {
      console.log('🏢 Cargando información de empresa demo:', empresaId)
      
      // Simular delay de base de datos
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const empresa = DEMO_EMPRESAS.find(e => e.id === empresaId)
      
      if (!empresa) {
        console.warn('❌ Empresa demo no encontrada:', empresaId)
        return null
      }

      console.log('✅ Empresa demo cargada:', empresa.nombre)
      return empresa
    } catch (error) {
      console.error('Error en loadEmpresaInfo:', error)
      return null
    }
  }, [])

  // Cargar información de la sede DEMO
  const loadSedeInfo = useCallback(async (empresaId: string, sedeNombre: string): Promise<SedeInfo | null> => {
    if (!empresaId || !sedeNombre) return null

    try {
      console.log('🏪 Cargando información de sede demo:', sedeNombre)
      
      // Simular delay de base de datos
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const sede = DEMO_SEDES.find(s => 
        s.empresa_id === empresaId && 
        (s.nombre === sedeNombre || sedeNombre.includes(s.nombre) || s.nombre.includes(sedeNombre))
      )
      
      if (!sede) {
        console.warn('❌ Sede demo no encontrada:', sedeNombre)
        // Retornar la primera sede como fallback
        return DEMO_SEDES.find(s => s.empresa_id === empresaId) || null
      }

      console.log('✅ Sede demo cargada:', sede.nombre)
      return sede
    } catch (error) {
      console.error('Error en loadSedeInfo:', error)
      return null
    }
  }, [])

  // Crear o actualizar sesión de usuario DEMO
  const updateUserSession = useCallback(async (userInfo: ExtendedUserInfo) => {
    try {
      const sessionId = crypto.randomUUID()
      const now = new Date()
      
      const sessionInfo: UserSessionData = {
        sessionId,
        enterpriseId: userInfo.enterpriseId,
        sedeId: userInfo.sede,
        loginTime: now,
        lastActivity: now,
        userAgent: navigator.userAgent,
        permissions: userInfo.permissions
      }

      setSessionData(sessionInfo)
      localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(sessionInfo))

      console.log('✅ Sesión demo actualizada:', sessionId)
      return sessionId
    } catch (error) {
      console.error('Error actualizando sesión de usuario:', error)
    }
  }, [])

  // Actualizar última actividad
  const updateLastActivity = useCallback(async () => {
    if (!sessionData) return

    const updatedSession = {
      ...sessionData,
      lastActivity: new Date()
    }

    setSessionData(updatedSession)
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(updatedSession))
  }, [sessionData])

  // Inicializar datos del usuario DEMO
  const initializeUserData = useCallback(async () => {
    if (!user || authLoading) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Inicializando datos de usuario demo...')

      // Intentar usar cache primero
      const cached = getCachedUserData()
      if (cached && cached.user.id === user.id) {
        console.log('📦 Usando datos de cache para usuario:', user.email)
        setCurrentUser(cached.user)
        setEmpresaInfo(cached.empresa)
        setSedeInfo(cached.sede)
        setLoading(false)
        return
      }

      // Cargar datos demo
      const empresa = await loadEmpresaInfo(user.enterpriseId)
      const sede = await loadSedeInfo(user.enterpriseId, user.sede)

      const extendedUser: ExtendedUserInfo = {
        ...user,
        enterpriseName: empresa?.nombre || 'MediFlow Corporativo',
        sedeName: sede?.nombre || user.sede,
        empresaInfo: empresa || undefined,
        sedeInfo: sede || undefined,
        sessionInfo: {
          lastActivity: new Date(),
          sessionDuration: 0,
          userAgent: navigator.userAgent
        }
      }

      setCurrentUser(extendedUser)
      setEmpresaInfo(empresa)
      setSedeInfo(sede)

      // Actualizar cache
      setCachedUserData(extendedUser, empresa, sede)

      // Actualizar sesión
      await updateUserSession(extendedUser)

      console.log('✅ Datos de usuario demo inicializados:', user.email)

    } catch (err) {
      console.error('Error inicializando datos de usuario:', err)
      setError('Error cargando información del usuario')
    } finally {
      setLoading(false)
    }
  }, [user, authLoading, getCachedUserData, loadEmpresaInfo, loadSedeInfo, setCachedUserData, updateUserSession])

  // Cargar datos al montar o cuando cambie el usuario
  useEffect(() => {
    initializeUserData()
  }, [initializeUserData])

  // Actualizar actividad cada 5 minutos
  useEffect(() => {
    if (!sessionData) return

    const interval = setInterval(updateLastActivity, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [sessionData, updateLastActivity])

  // Detectar actividad del usuario y actualizar timestamp
  useEffect(() => {
    if (!sessionData) return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    let timeoutId: NodeJS.Timeout

    const handleUserActivity = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        updateLastActivity()
      }, 30000) // 30 segundos después de la última actividad
    }

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true)
      })
      clearTimeout(timeoutId)
    }
  }, [sessionData, updateLastActivity])

  // Invalidar cache manualmente
  const invalidateCache = useCallback(() => {
    localStorage.removeItem(USER_CACHE_KEY)
    localStorage.removeItem(SESSION_CACHE_KEY)
    initializeUserData()
  }, [initializeUserData])

  // Obtener duración de sesión
  const getSessionDuration = useCallback((): number => {
    if (!sessionData) return 0
    return Date.now() - sessionData.loginTime.getTime()
  }, [sessionData])

  // Verificar si la sesión está activa
  const isSessionActive = useCallback((): boolean => {
    if (!sessionData) return false
    
    const timeSinceLastActivity = Date.now() - sessionData.lastActivity.getTime()
    const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutos
    
    return timeSinceLastActivity < SESSION_TIMEOUT
  }, [sessionData])

  // Datos computados
  const userContext = {
    currentUser,
    empresaInfo,
    sedeInfo,
    sessionData,
    loading: loading || authLoading,
    error,
    
    // Funciones utilitarias
    invalidateCache,
    updateLastActivity,
    getSessionDuration,
    isSessionActive,
    
    // Datos derivados
    isSuperAdmin: currentUser?.hierarchy === 'super_admin',
    isAdminEmpresa: currentUser?.hierarchy === 'admin_empresa',
    isMedico: ['medico_trabajo', 'medico_especialista', 'medico_industrial'].includes(currentUser?.hierarchy || ''),
    isPaciente: currentUser?.hierarchy === 'paciente',
    isBot: currentUser?.hierarchy === 'bot',
    
    // Información completa del contexto
    fullUserInfo: {
      ...currentUser,
      empresa: empresaInfo,
      sede: sedeInfo,
      session: sessionData
    }
  }

  return userContext
}
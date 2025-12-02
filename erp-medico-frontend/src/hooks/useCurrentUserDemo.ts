// Hook para obtener información del usuario actual MODO DEMO - Sin Supabase
import React, { useState, useEffect, useCallback } from 'react'
// Mock user data - Sin autenticación

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

// Datos de empresa y sede demo
const DEMO_EMPRESA: EmpresaInfo = {
  id: '1',
  nombre: 'MediFlow Corporativo',
  razon_social: 'MediFlow Corporativo S.A. de C.V.',
  rfc: 'MCO123456789',
  direccion: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX',
  telefono: '+52 55 1234-5678',
  email: 'contacto@mediflow.mx',
  configuracion: {
    theme: 'light',
    language: 'es',
    notifications: true,
    backup: true
  },
  status: 'active',
  plan_type: 'enterprise',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-11-04T08:00:00Z'
}

const DEMO_SEDE: SedeInfo = {
  id: '1',
  empresa_id: '1',
  nombre: 'Sede Principal',
  direccion: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX',
  telefono: '+52 55 1234-5678',
  email: 'sede.principal@mediflow.mx',
  configuracion: {
    horario_atencion: '08:00-18:00',
    zona_horaria: 'America/Mexico_City',
    idiomas_soportados: ['es', 'en']
  },
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-11-04T08:00:00Z'
}

export function useCurrentUser() {
  // Mock user - Simular usuario autenticado
  const mockUser: ExtendedUserInfo = {
    id: '1',
    email: 'demo@mediflow.mx',
    name: 'Usuario Demo',
    hierarchy: 'admin',
    enterpriseId: '1',
    enterpriseName: 'MediFlow Corporativo',
    sede: '1',
    sedeName: 'Sede Principal',
    phone: '+52 55 1234-5678',
    permissions: ['*'],
    status: 'active',
    loginCount: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    metadata: {},
    preferences: {},
    empresaInfo: DEMO_EMPRESA,
    sedeInfo: DEMO_SEDE,
    sessionInfo: {
      lastActivity: new Date(),
      sessionDuration: 0,
      userAgent: navigator.userAgent
    }
  }

  const mockSessionData: UserSessionData = {
    sessionId: crypto.randomUUID(),
    enterpriseId: '1',
    sedeId: '1',
    loginTime: new Date(),
    lastActivity: new Date(),
    userAgent: navigator.userAgent,
    permissions: ['*']
  }

  const [currentUser, setCurrentUser] = useState<ExtendedUserInfo | null>(mockUser)
  const [empresaInfo, setEmpresaInfo] = useState<EmpresaInfo | null>(DEMO_EMPRESA)
  const [sedeInfo, setSedeInfo] = useState<SedeInfo | null>(DEMO_SEDE)
  const [sessionData, setSessionData] = useState<UserSessionData | null>(mockSessionData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock user data ya está inicializado

  // Datos computados
  const userContext = React.useMemo(() => ({
    currentUser,
    empresaInfo,
    sedeInfo,
    sessionData,
    loading: loading || false,
    error,

    // Funciones utilitarias
    invalidateCache: () => {
      console.log('🗑️ Cache invalidado (modo demo)')
    },
    updateLastActivity: () => {
      console.log('Mock: Actualizando última actividad')
    },
    getSessionDuration: (): number => {
      return sessionData ? Date.now() - sessionData.loginTime.getTime() : 0
    },
    isSessionActive: (): boolean => {
      return !!currentUser && currentUser.status === 'active'
    },

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
  }), [currentUser, empresaInfo, sedeInfo, sessionData, loading, error])

  return userContext
}
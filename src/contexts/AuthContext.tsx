// Contexto de autenticación con 4 roles: super_admin, admin_empresa, medico, paciente
import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, UserRole, hasPermission, ROLE_LABELS } from '@/types/auth'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  originalUser: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isImpersonating: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, metadata: any) => Promise<void>
  logout: () => Promise<void>
  impersonateUser: (targetUser: User) => Promise<void>
  stopImpersonation: () => void
  checkPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'manage') => boolean
  canAccess: (resource: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mapea el perfil de la DB (que usa rol_principal) al tipo User del frontend (que usa rol)
function mapProfileToUser(profile: any): User {
  return {
    id: profile.id,
    email: profile.email,
    nombre: profile.nombre || '',
    apellido_paterno: profile.apellido_paterno || '',
    apellido_materno: profile.apellido_materno,
    rol: profile.rol_principal || profile.rol || 'paciente',
    empresa_id: profile.empresa_id,
    sede_id: profile.sede_id,
    avatar_url: profile.avatar_url,
    telefono: profile.telefono,
    empresa: profile.empresa,
    cedula_profesional: profile.cedula_profesional,
    especialidad: profile.especialidad,
    created_at: profile.created_at,
    last_login: profile.last_login,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // PASO 1: Inicializar usuario desde localStorage INMEDIATAMENTE (< 1ms)
  // Esto desbloquea la UI sin esperar a que Supabase responda
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('GPMedical_user')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed && parsed.id && parsed.rol) {
          console.log('⚡ Usuario cargado desde caché local:', parsed.nombre, parsed.rol)
          return parsed
        }
      }
    } catch (e) {
      console.warn('Error leyendo usuario de localStorage:', e)
    }
    return null
  })
  const [originalUser, setOriginalUser] = useState<User | null>(null) // Para impersonación
  // Si ya tenemos un usuario en caché, NO necesitamos loading blocker
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('GPMedical_user')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed && parsed.id && parsed.rol) {
          return false // ← UI se desbloquea INMEDIATAMENTE
        }
      }
    } catch (e) { }
    return true // Solo loading=true si NO hay usuario en caché
  })
  const [error, setError] = useState<string | null>(null)

  // PASO 2: Verificar sesión con Supabase en background (NO bloquea la UI)
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Timeout de seguridad: si Supabase no responde en 5s, no importa
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn('⏱️ Auth timeout: Supabase no respondió en 5s, usando caché local')
            resolve(null)
          }, 5000)
        })

        // Race entre la llamada real y el timeout
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ])

        // Si ganó el timeout, sessionResult es null
        const session = sessionResult && 'data' in sessionResult
          ? (sessionResult as any).data.session
          : null

        if (session?.user) {
          // Obtener datos del usuario via REST API directa (evitar supabase.from() que puede colgar)
          let userData = null
          try {
            const profileResp = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL || 'https://kftxftikoydldcexkady.supabase.co'}/rest/v1/profiles?id=eq.${session.user.id}&select=*`,
              {
                headers: {
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdHhmdGlrb3lkbGRjZXhrYWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTU2OTMsImV4cCI6MjA4MjI3MTY5M30.UvxYrETiFNil2eNKzJCVcgwOd-MCDBHABlql650y1NU',
                  'Authorization': `Bearer ${session.access_token}`,
                  'Accept': 'application/vnd.pgrst.object+json'
                },
                signal: AbortSignal.timeout(5000)
              }
            )
            if (profileResp.ok) {
              userData = await profileResp.json()
            }
          } catch (fetchError) {
            console.warn('⚠️ Error obteniendo perfil vía REST:', fetchError)
          }

          if (userData) {
            const mappedUser = mapProfileToUser(userData)
            setUser(mappedUser)
            localStorage.setItem('GPMedical_user', JSON.stringify(mappedUser))
          } else if (!user) {
            // Solo crear perfil básico si NO hay usuario en caché
            const basicUser: User = {
              id: session.user.id,
              email: session.user.email!,
              nombre: session.user.user_metadata?.nombre || 'Nuevo Usuario',
              apellido_paterno: session.user.user_metadata?.apellido_paterno || '',
              rol: 'paciente',
              created_at: new Date().toISOString()
            }
            setUser(basicUser)
            localStorage.setItem('GPMedical_user', JSON.stringify(basicUser))
          }
        } else if (!user) {
          // Sin sesión Supabase Y sin usuario en caché — realmente no hay sesión
          setUser(null)
          localStorage.removeItem('GPMedical_user')
        }
        // NOTA: Si hay usuario en caché pero no sesión Supabase (timeout), 
        // NO borrar el caché. El usuario ya hizo login exitoso.
      } catch (error) {
        console.error('Error cargando usuario:', error)
        // Si hay usuario en caché, mantenerlo. Solo limpiar si no hay nada.
        if (!user) {
          setUser(null)
          localStorage.removeItem('GPMedical_user')
        }
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Cargar perfil via REST API directa
        try {
          const profileResp = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL || 'https://kftxftikoydldcexkady.supabase.co'}/rest/v1/profiles?id=eq.${session.user.id}&select=*`,
            {
              headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdHhmdGlrb3lkbGRjZXhrYWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTU2OTMsImV4cCI6MjA4MjI3MTY5M30.UvxYrETiFNil2eNKzJCVcgwOd-MCDBHABlql650y1NU',
                'Authorization': `Bearer ${session.access_token}`,
                'Accept': 'application/vnd.pgrst.object+json'
              },
              signal: AbortSignal.timeout(5000)
            }
          )
          if (profileResp.ok) {
            const userData = await profileResp.json()
            const mappedUser = mapProfileToUser(userData)
            setUser(mappedUser)
            localStorage.setItem('GPMedical_user', JSON.stringify(mappedUser))
          }
        } catch (err) {
          console.warn('⚠️ Error cargando perfil en onAuthStateChange:', err)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setOriginalUser(null)
        localStorage.removeItem('GPMedical_user')
        localStorage.removeItem('GPMedical_original_user')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // === DATABASE DE USUARIOS DEMO ===
  // Permite login offline cuando Supabase no responde o los usuarios no están creados
  const DEMO_USERS: Record<string, { password: string; user: User }> = {
    'super@mediflow.mx': {
      password: 'super123',
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'super@mediflow.mx',
        nombre: 'Super Admin',
        apellido_paterno: 'GPMedical',
        rol: 'super_admin' as UserRole,
        empresa_id: undefined,
        created_at: new Date().toISOString()
      }
    },
    'admin@mediflow.mx': {
      password: 'admin123',
      user: {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'admin@mediflow.mx',
        nombre: 'Carlos',
        apellido_paterno: 'Ramírez',
        rol: 'admin_empresa' as UserRole,
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        created_at: new Date().toISOString()
      }
    },
    'medico@mediflow.mx': {
      password: 'medico123',
      user: {
        id: '00000000-0000-0000-0000-000000000003',
        email: 'medico@mediflow.mx',
        nombre: 'Ana',
        apellido_paterno: 'López',
        rol: 'medico' as UserRole,
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        cedula_profesional: 'CED-12345',
        especialidad: 'Medicina Ocupacional',
        created_at: new Date().toISOString()
      }
    },
    'enfermera@mediflow.mx': {
      password: 'enfermera123',
      user: {
        id: '00000000-0000-0000-0000-000000000004',
        email: 'enfermera@mediflow.mx',
        nombre: 'Laura',
        apellido_paterno: 'Ruiz',
        rol: 'enfermera' as UserRole,
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        created_at: new Date().toISOString()
      }
    },
    'recepcion@mediflow.mx': {
      password: 'recepcion123',
      user: {
        id: '00000000-0000-0000-0000-000000000005',
        email: 'recepcion@mediflow.mx',
        nombre: 'María',
        apellido_paterno: 'González',
        rol: 'recepcion' as UserRole,
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        created_at: new Date().toISOString()
      }
    }
  }

  // Login — intenta Supabase real primero, fallback a demo si falla
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      // Limpiar sesión anterior antes de intentar login nuevo
      const keysToRemove = Object.keys(localStorage).filter(k =>
        k.includes('supabase') || k.includes('sb-')
      )
      keysToRemove.forEach(k => localStorage.removeItem(k))

      // PASO 1: Intentar login real con Supabase (timeout 8s)
      let supabaseSuccess = false
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('SUPABASE_TIMEOUT')), 8000)
        })

        const { data, error } = await Promise.race([
          supabase.auth.signInWithPassword({ email, password }),
          timeoutPromise
        ])

        if (error) throw error

        if (data.session) {
          // Login exitoso con Supabase - cargar perfil
          let profile = null
          try {
            await new Promise(r => setTimeout(r, 200))
            const profileResp = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL || 'https://kftxftikoydldcexkady.supabase.co'}/rest/v1/profiles?id=eq.${data.user.id}&select=*`,
              {
                headers: {
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdHhmdGlrb3lkbGRjZXhrYWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTU2OTMsImV4cCI6MjA4MjI3MTY5M30.UvxYrETiFNil2eNKzJCVcgwOd-MCDBHABlql650y1NU',
                  'Authorization': `Bearer ${data.session.access_token}`,
                  'Accept': 'application/vnd.pgrst.object+json'
                },
                signal: AbortSignal.timeout(5000)
              }
            )
            if (profileResp.ok) {
              profile = await profileResp.json()
            }
          } catch (profileError) {
            console.warn('⚠️ Error cargando perfil vía REST, usando datos básicos:', profileError)
          }

          const finalUser: User = profile ? mapProfileToUser(profile) : {
            id: data.user.id,
            email: data.user.email!,
            nombre: data.user.user_metadata?.nombre || 'Usuario',
            apellido_paterno: '',
            rol: 'paciente' as UserRole,
            created_at: new Date().toISOString()
          }

          setUser(finalUser)
          localStorage.setItem('GPMedical_user', JSON.stringify(finalUser))
          toast.success(`Bienvenido ${finalUser.nombre}`)
          supabaseSuccess = true
        }
      } catch (supabaseError: any) {
        console.warn('⚠️ Supabase auth falló:', supabaseError.message)
        // Continuar al fallback demo
      }

      // PASO 2: Fallback a login demo si Supabase falló
      if (!supabaseSuccess) {
        const demoEntry = DEMO_USERS[email.toLowerCase()]
        if (demoEntry && demoEntry.password === password) {
          console.log(`🔓 Login demo activado para: ${email}`)
          const demoUser = { ...demoEntry.user }
          setUser(demoUser)
          localStorage.setItem('GPMedical_user', JSON.stringify(demoUser))
          toast.success(`Bienvenido ${demoUser.nombre} (Modo Demo)`)
          return // Login demo exitoso
        }

        // Si no es usuario demo, lanzar error
        throw new Error('Invalid login credentials')
      }
    } catch (error: any) {
      console.error('Error en login:', error)

      const errorMessages: Record<string, string> = {
        'Invalid login credentials': 'Credenciales incorrectas. Verifique su correo y contraseña.',
        'Email not confirmed': 'Correo no verificado. Revise su bandeja de entrada.',
        'Too many requests': 'Demasiados intentos. Espere un momento antes de reintentar.',
      }

      const friendlyMessage = errorMessages[error.message] || error.message || 'Error al conectar con el servidor'
      setError(friendlyMessage)
      toast.error(friendlyMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Register
  const register = async (email: string, password: string, metadata: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) throw error

      if (data.session) {
        // Registro exitoso con sesión automática (si no requiere verificación email)
        const newUser: User = {
          id: data.user!.id,
          email: data.user!.email!,
          nombre: metadata.nombre || 'Nuevo Usuario',
          apellido_paterno: metadata.apellido_paterno || '',
          rol: metadata.rol || 'paciente',
          created_at: new Date().toISOString()
        }
        setUser(newUser)
        localStorage.setItem('GPMedical_user', JSON.stringify(newUser))
        toast.success('Cuenta creada exitosamente')
      } else {
        toast.success('Registro exitoso. Por favor verifica tu correo electrónico.')
      }
    } catch (error: any) {
      console.error('Error en Supabase register:', error)
      toast.error(error.message || 'Error al registrarse')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      // Limpiar localStorage primero (siempre funciona)
      setUser(null)
      setOriginalUser(null)
      localStorage.removeItem('GPMedical_user')
      localStorage.removeItem('GPMedical_original_user')

      // Intentar cerrar sesión en Supabase (no crítico)
      try {
        await Promise.race([
          supabase.auth.signOut(),
          new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000))
        ])
      } catch {
        // Ignorar errores de Supabase, ya limpiamos localStorage
      }

      toast.success('Sesión cerrada correctamente')
      // Usar ruta relativa para compatibilidad con Vercel
      window.location.href = '/login'
    } catch (error: any) {
      console.error('Error en logout:', error)
      // Aún así redirigir al login
      window.location.href = '/login'
    }
  }

  // Impersonar usuario (Solo Super Admin)
  const impersonateUser = async (targetUser: User) => {
    if (!user || user.rol !== 'super_admin') {
      toast.error('No tienes permisos para realizar esta acción')
      return
    }

    setOriginalUser(user)
    setUser(targetUser)

    localStorage.setItem('GPMedical_original_user', JSON.stringify(user))
    localStorage.setItem('GPMedical_user', JSON.stringify(targetUser))

    toast.success(`Iniciando sesión como ${targetUser.nombre}`)
    window.location.href = '/dashboard' // Redirigir al dashboard del usuario
  }

  // Detener impersonación
  const stopImpersonation = () => {
    if (!originalUser) return

    setUser(originalUser)
    setOriginalUser(null)

    localStorage.setItem('GPMedical_user', JSON.stringify(originalUser))
    localStorage.removeItem('GPMedical_original_user')

    toast.success('Volviendo a sesión de administrador')
    window.location.href = '/dashboard'
  }

  // Verificar permiso específico
  const checkPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'manage'): boolean => {
    if (!user) return false

    // Fallback para super_admin en desarrollo/offline
    if (user.rol === 'super_admin') return true

    return hasPermission(user.rol, resource, action)
  }

  // Verificar acceso a recurso (cualquier acción)
  const canAccessResource = (resource: string): boolean => {
    if (!user) return false
    if (user.rol === 'super_admin') return true
    return checkPermission(resource, 'read')
  }

  const value: AuthContextType = {
    user,
    originalUser,
    loading,
    error,
    isAuthenticated: !!user,
    isImpersonating: !!originalUser,
    login,
    register,
    logout,
    impersonateUser,
    stopImpersonation,
    checkPermission,
    canAccess: canAccessResource
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

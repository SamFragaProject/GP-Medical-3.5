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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('AuthProvider: rendering')
  const [user, setUser] = useState<User | null>(null)
  const [originalUser, setOriginalUser] = useState<User | null>(null) // Para impersonación
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar usuario desde localStorage o sesión de Supabase
  useEffect(() => {
    console.log('AuthProvider: useEffect start')
    const loadUser = async () => {
      try {
        // Intentar cargar desde Supabase primero
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // Obtener datos del usuario de la DB pública
          const { data: userData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userData && !error) {
            setUser(userData as User)
            localStorage.setItem('GPMedical_user', JSON.stringify(userData))
          } else {
            // Si el usuario existe en Auth pero no en tabla usuarios, crearlo (JIT Provisioning)
            console.log('Usuario nuevo detectado, creando perfil...')
            const newUserProfile: User = {
              id: session.user.id,
              email: session.user.email!,
              nombre: session.user.user_metadata.nombre || 'Nuevo Usuario',
              apellido_paterno: session.user.user_metadata.apellido_paterno || '',
              rol: 'paciente', // Rol por defecto seguro
              created_at: new Date().toISOString()
            }

            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newUserProfile)
              .select()
              .single()

            if (!createError && newProfile) {
              setUser(newProfile as User)
              localStorage.setItem('GPMedical_user', JSON.stringify(newProfile))
              toast.success('Perfil de usuario creado exitosamente')
            }
          }
        } else {
          // Si no hay sesión Supabase, verificar si hay usuario OFFLINE/DEMO en localStorage
          const savedUser = localStorage.getItem('GPMedical_user')
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser) as User
              // Verificar que sea un usuario demo válido (tiene id que empieza con 'demo-' o 'mock-')
              if (parsedUser.id?.startsWith('demo-') || parsedUser.id?.startsWith('mock-') || savedUser.includes('(Demo)') || savedUser.includes('(Offline)')) {
                console.log('🔓 Usuario OFFLINE/DEMO detectado en localStorage, cargando...')
                setUser(parsedUser)
                // No borrar, mantener la sesión offline
              } else {
                // Usuario real sin sesión válida, limpiar
                console.log('Sesión expirada, limpiando usuario...')
                setUser(null)
                localStorage.removeItem('GPMedical_user')
              }
            } catch {
              setUser(null)
              localStorage.removeItem('GPMedical_user')
            }
          } else {
            setUser(null)
            // No hay usuario guardado, nada que limpiar
          }
        }
      } catch (error) {
        console.error('Error cargando usuario:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Reutilizar lógica de carga o forzar recarga
        // Simplemente recargar la página para limpiar estado es una estrategia segura a veces, 
        // pero aquí intentaremos cargar el perfil directamente
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userData) {
          setUser(userData as User)
          localStorage.setItem('GPMedical_user', JSON.stringify(userData))
        } else {
          // Crear perfil si no existe (manejado en loadUser también, pero bueno aquí también por si acaso es un sign in directo)
          const newUserProfile: User = {
            id: session.user.id,
            email: session.user.email!,
            nombre: session.user.user_metadata.nombre || 'Nuevo Usuario',
            apellido_paterno: session.user.user_metadata.apellido_paterno || '',
            rol: 'paciente',
            created_at: new Date().toISOString()
          }
          const { data: newProfile } = await supabase.from('profiles').insert(newUserProfile).select().single()
          if (newProfile) setUser(newProfile as User)
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

  // Login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      // 1. Intentar login real con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        // Login exitoso, cargar perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        const finalUser: User = (profile as User) || {
          id: data.user.id,
          email: data.user.email!,
          nombre: data.user.user_metadata?.nombre || 'Usuario',
          apellido_paterno: '',
          rol: 'paciente', // Rol por defecto
          created_at: new Date().toISOString()
        }

        setUser(finalUser)
        localStorage.setItem('GPMedical_user', JSON.stringify(finalUser))
        toast.success(`Bienvenido ${finalUser.nombre}`)
      }
    } catch (error: any) {
      console.error('Error en Supabase login:', error)

      // FALLBACK MODO OFFLINE / DEMO (ROBUSTO)
      // Si falla por CUALQUIER razón (error de red, usuario no encontrado, script no corrido), activamos demo.
      const offlineUsers: Record<string, User> = {
        'super@gpmedical.mx': { id: 'mock-super', email: 'super@gpmedical.mx', nombre: 'Super Admin (Offline)', apellido_paterno: 'Demo', rol: 'super_admin', empresa_id: 'all', created_at: new Date().toISOString() },
        'admin@gpmedical.mx': { id: 'mock-admin', email: 'admin@gpmedical.mx', nombre: 'Admin Clínica (Offline)', apellido_paterno: 'Demo', rol: 'admin_empresa', empresa_id: 'empresa-1', created_at: new Date().toISOString() },
        'medico@gpmedical.mx': { id: 'mock-medico', email: 'medico@gpmedical.mx', nombre: 'Dr. Médico (Offline)', apellido_paterno: 'Demo', rol: 'medico', empresa_id: 'empresa-1', created_at: new Date().toISOString() },
        'paciente@gpmedical.mx': { id: 'mock-paciente', email: 'paciente@gpmedical.mx', nombre: 'Paciente (Offline)', apellido_paterno: 'Demo', rol: 'paciente', empresa_id: 'empresa-1', created_at: new Date().toISOString() },
        // Legacy .com
        'sam@gpmedical.com': { id: 'mock-sam', email: 'sam@gpmedical.com', nombre: 'Sam (Offline)', apellido_paterno: 'Fraga', rol: 'super_admin', empresa_id: 'all', created_at: new Date().toISOString() },
        'admin@empresa.com': { id: 'mock-admin-old', email: 'admin@empresa.com', nombre: 'Admin (Offline)', apellido_paterno: 'Demo', rol: 'admin_empresa', empresa_id: 'empresa-1', created_at: new Date().toISOString() },
        'admin.medico@gpmedical.mx': { id: 'mock-admin-medico', email: 'admin.medico@gpmedical.mx', nombre: 'Dr. Admin Medico (Offline)', apellido_paterno: 'Demo', rol: 'admin_empresa', empresa_id: 'empresa-1', created_at: new Date().toISOString(), especialidad: 'Medicina del Trabajo' },
        'asistente.demo@gpmedical.mx': { id: 'mock-asistente', email: 'asistente.demo@gpmedical.mx', nombre: 'Asistente Demo (Offline)', apellido_paterno: 'Demo', rol: 'asistente', empresa_id: 'empresa-1', created_at: new Date().toISOString() },
      }

      const mockUser = offlineUsers[email.toLowerCase()]
      if (mockUser) {
        console.warn('⚠️ Fallo conexión Supabase. Usando Modo Offline.')
        setUser(mockUser)
        localStorage.setItem('GPMedical_user', JSON.stringify(mockUser))
        localStorage.setItem('sb-access-token', 'mock-token') // Bypass
        toast.success(`⚠️ Modo Offline: Bienvenido ${mockUser.nombre}`)
        return
      }

      toast.error(error.message || 'Error al iniciar sesión')
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
        console.log('Supabase signOut skipped (no connection)')
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

  console.log('AuthProvider: returning provider, loading:', loading)
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

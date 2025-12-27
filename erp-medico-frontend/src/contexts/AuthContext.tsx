// Contexto de autenticación con 4 roles: super_admin, admin_empresa, medico, paciente
import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, UserRole, hasPermission, ROLE_LABELS } from '@/types/auth'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  originalUser: User | null
  loading: boolean
  isAuthenticated: boolean
  isImpersonating: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  impersonateUser: (targetUser: User) => Promise<void>
  stopImpersonation: () => void
  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'manage') => boolean
  canAccess: (resource: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('AuthProvider: rendering')
  const [user, setUser] = useState<User | null>(null)
  const [originalUser, setOriginalUser] = useState<User | null>(null) // Para impersonación
  const [loading, setLoading] = useState(true)

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
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userData && !error) {
            setUser(userData as User)
            localStorage.setItem('mediflow_user', JSON.stringify(userData))
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
              .from('usuarios')
              .insert(newUserProfile)
              .select()
              .single()

            if (!createError && newProfile) {
              setUser(newProfile as User)
              localStorage.setItem('mediflow_user', JSON.stringify(newProfile))
              toast.success('Perfil de usuario creado exitosamente')
            }
          }
        } else {
          // Si no hay sesión, limpiar estado (NO crear demo users)
          setUser(null)
          localStorage.removeItem('mediflow_user')
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
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userData) {
          setUser(userData as User)
          localStorage.setItem('mediflow_user', JSON.stringify(userData))
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
          const { data: newProfile } = await supabase.from('usuarios').insert(newUserProfile).select().single()
          if (newProfile) setUser(newProfile as User)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setOriginalUser(null)
        localStorage.removeItem('mediflow_user')
        localStorage.removeItem('mediflow_original_user')
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

      // Intentar login con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        // Obtener datos del usuario de la DB
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', data.user.id)
          .single()

        const finalUser = (userData as User) || {
          id: data.user.id,
          email: data.user.email!,
          nombre: 'Usuario',
          apellido_paterno: '',
          rol: 'paciente' as const,
          created_at: new Date().toISOString()
        }

        setUser(finalUser)
        localStorage.setItem('mediflow_user', JSON.stringify(finalUser))
        toast.success(`Bienvenido ${finalUser.nombre}`)
      }
    } catch (error: any) {
      console.error('Error en Supabase login:', error)
      const msg = error.message.toLowerCase()

      // FALLBACK MODO OFFLINE / DEMO
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('connection')) {
        console.warn('⚠️ Fallo conexión Supabase. Usando Modo Offline de Emergencia.')

        // Verificar credenciales hardcodeadas para emergencias
        if (email === 'sam@mediflow.com' && password === 'sam123') {
          const mockUser: User = {
            id: 'mock-sam-id',
            email: 'sam@mediflow.com',
            nombre: 'Sam (Offline)',
            apellido_paterno: 'Fraga',
            rol: 'super_admin',
            created_at: new Date().toISOString()
          }
          setUser(mockUser)
          localStorage.setItem('mediflow_user', JSON.stringify(mockUser))
          toast.success('⚠️ Modo Offline Activado: Bienvenido Sam')
          return
        }
      }

      toast.error(error.message || 'Error al iniciar sesión')
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
      localStorage.removeItem('mediflow_user')
      localStorage.removeItem('mediflow_original_user')

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

    localStorage.setItem('mediflow_original_user', JSON.stringify(user))
    localStorage.setItem('mediflow_user', JSON.stringify(targetUser))

    toast.success(`Iniciando sesión como ${targetUser.nombre}`)
    window.location.href = '/dashboard' // Redirigir al dashboard del usuario
  }

  // Detener impersonación
  const stopImpersonation = () => {
    if (!originalUser) return

    setUser(originalUser)
    setOriginalUser(null)

    localStorage.setItem('mediflow_user', JSON.stringify(originalUser))
    localStorage.removeItem('mediflow_original_user')

    toast.success('Volviendo a sesión de administrador')
    window.location.href = '/dashboard'
  }

  // Verificar permiso específico
  const checkPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'manage'): boolean => {
    if (!user) return false
    return hasPermission(user.rol, resource, action)
  }

  // Verificar acceso a recurso (cualquier acción)
  const canAccess = (resource: string): boolean => {
    if (!user) return false
    return checkPermission(resource, 'read')
  }

  const value: AuthContextType = {
    user,
    originalUser,
    loading,
    isAuthenticated: !!user,
    isImpersonating: !!originalUser,
    login,
    logout,
    impersonateUser,
    stopImpersonation,
    hasPermission: checkPermission,
    canAccess
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

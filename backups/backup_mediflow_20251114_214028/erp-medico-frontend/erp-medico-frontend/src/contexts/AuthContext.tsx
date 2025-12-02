// Contexto de autenticación con 4 roles: super_admin, admin_empresa, medico, paciente
import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, UserRole, hasPermission, ROLE_LABELS } from '@/types/auth'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'manage') => boolean
  canAccess: (resource: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar usuario desde localStorage o sesión de Supabase
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Intentar cargar desde localStorage primero (sesión demo)
        const savedUser = localStorage.getItem('mediflow_user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
          setLoading(false)
          return
        }

        // Intentar cargar desde Supabase
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Obtener datos completos del usuario desde la base de datos
          const { data: userData, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userData && !error) {
            setUser(userData as User)
            localStorage.setItem('mediflow_user', JSON.stringify(userData))
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
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userData) {
          setUser(userData as User)
          localStorage.setItem('mediflow_user', JSON.stringify(userData))
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        localStorage.removeItem('mediflow_user')
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
        // Obtener datos completos del usuario
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (userError) throw userError

        setUser(userData as User)
        localStorage.setItem('mediflow_user', JSON.stringify(userData))
        
        toast.success(`Bienvenido ${userData.nombre} - ${ROLE_LABELS[userData.rol as UserRole]}`)
      }
    } catch (error: any) {
      console.error('Error en login:', error)
      toast.error(error.message || 'Error al iniciar sesión')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      localStorage.removeItem('mediflow_user')
      toast.success('Sesión cerrada correctamente')
    } catch (error: any) {
      console.error('Error en logout:', error)
      toast.error('Error al cerrar sesión')
    }
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
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission: checkPermission,
    canAccess
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

// Hook para obtener información del usuario actual - Adaptador para useAuth
import { useAuth } from '@/contexts/AuthContext'
import { useMemo } from 'react'

export function useCurrentUser() {
  const { user, loading, error } = useAuth()

  const userContext = useMemo(() => {
    if (!user) return {
      currentUser: null,
      empresaInfo: null,
      sedeInfo: null,
      loading,
      error,
      isSuperAdmin: false,
      isAdminEmpresa: false,
      isMedico: false,
      isPaciente: false
    }

    const adaptedUser = {
      id: user.id,
      email: user.email,
      name: user.nombre,
      hierarchy: user.rol,
      enterpriseId: user.empresa_id,
      sede: (user as any).sede_id,
      status: 'active',
      permissions: ['*'], // Simplificado para compatibilidad
    }

    return {
      currentUser: adaptedUser,
      empresaInfo: { id: user.empresa_id, nombre: 'Empresa' }, // Mock mínimo
      sedeInfo: (user as any).sede_id ? { id: (user as any).sede_id, nombre: 'Sede' } : null,
      loading,
      error,
      isSuperAdmin: user.rol === 'super_admin',
      isAdminEmpresa: user.rol === 'admin_empresa',
      isMedico: ['medico', 'medico_trabajo', 'medico_industrial'].includes(user.rol || ''),
      isPaciente: user.rol === 'paciente',
    }
  }, [user, loading, error])

  return userContext as any
}

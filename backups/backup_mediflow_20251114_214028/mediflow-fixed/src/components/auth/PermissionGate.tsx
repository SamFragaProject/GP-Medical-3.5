// Componente de Control de Acceso basado en Permisos SaaS
import React from 'react'
import { useSaaSAuth, useSaaSPermissions } from '@/contexts/SaaSAuthContext'
import { mapComplexPermissionToSimple } from '@/utils/permissionMapping'
import { ResourceType, PermissionCondition, PermissionAction, UserHierarchy } from '@/types/saas'

interface PermissionGateProps {
  children: React.ReactNode
  resource?: ResourceType
  action?: keyof PermissionAction
  conditions?: PermissionCondition[]
  hierarchy?: UserHierarchy | UserHierarchy[]
  fallback?: React.ReactNode
  requireAll?: boolean // Si true, requiere TODOS los permisos. Si false, requiere AL MENOS uno.
}

/**
 * Componente que controla el acceso basado en permisos granulares SaaS
 * 
 * @param children - Contenido a renderizar si tiene permisos
 * @param resource - Tipo de recurso a verificar
 * @param action - Acción específica a verificar
 * @param conditions - Condiciones adicionales para el permiso
 * @param hierarchy - Jerarquía específica requerida
 * @param fallback - Contenido a mostrar si NO tiene permisos
 * @param requireAll - Si true, requiere todos los permisos (AND). Si false, requiere al menos uno (OR).
 */
export function PermissionGate({
  children,
  resource,
  action,
  conditions,
  hierarchy,
  fallback = null,
  requireAll = false
}: PermissionGateProps) {
  const { user } = useSaaSAuth()
  const { hasPermission, hasRole, hasHierarchyRole } = useSaaSPermissions()

  // Si no hay usuario autenticado
  if (!user) {
    return <>{fallback}</>
  }

  let hasAccess = true

  // Verificar jerarquía específica
  if (hierarchy) {
    if (requireAll) {
      // Requiere TODAS las jerarquías (AND)
      hasAccess = hasAccess && Array.isArray(hierarchy) 
        ? (hierarchy as UserHierarchy[]).every(h => hasRole(h))
        : hasRole(hierarchy as UserHierarchy)
    } else {
      // Requiere AL MENOS una jerarquía (OR)
      hasAccess = hasAccess && (Array.isArray(hierarchy) 
        ? (hierarchy as UserHierarchy[]).some(h => hasRole(h))
        : hasRole(hierarchy as UserHierarchy))
    }
  }

  // Verificar permisos específicos
  if (resource && action) {
    if (requireAll) {
      // Requiere TODOS los permisos (AND)
      hasAccess = hasAccess && hasPermission(mapComplexPermissionToSimple(`${resource}_${action}`))
    } else {
      // Requiere AL MENOS un permiso (OR)
      hasAccess = hasAccess || hasPermission(mapComplexPermissionToSimple(`${resource}_${action}`))
    }
  }

  return <>{hasAccess ? children : fallback}</>
}

// Hook para verificar permisos con lógica más compleja
export function useAdvancedPermissions() {
  const { user } = useSaaSAuth()
  const { hasPermission, hasRole, hasHierarchyRole, canManageUser } = useSaaSPermissions()

  /**
   * Verifica si el usuario puede crear usuarios en una jerarquía específica
   */
  const canCreateUserAtLevel = (targetHierarchy: UserHierarchy): boolean => {
    if (!user) return false
    
    // Super admin puede crear cualquier usuario
    if (hasRole('super_admin')) return true
    
    // Admin de empresa puede crear usuarios hasta nivel médico
    if (hasRole('admin_empresa')) {
      const userLevel = getHierarchyLevel(user.hierarchy)
      const targetLevel = getHierarchyLevel(targetHierarchy)
      return targetLevel <= 3 // Médicos y niveles inferiores
    }
    
    // Médicos pueden crear pacientes y personal de apoyo
    if (hasRole('medico_especialista') || hasRole('medico_trabajo')) {
      const targetLevel = getHierarchyLevel(targetHierarchy)
      return targetLevel <= 2 // Personal técnico y pacientes
    }
    
    return false
  }

  /**
   * Verifica si el usuario puede ver información sensible de otros usuarios
   */
  const canViewSensitiveUserInfo = (targetUserId: string, infoType: 'salary' | 'performance' | 'personal'): boolean => {
    if (!user) return false
    
    // Solo super admin y admin de empresa pueden ver información sensible
    if (hasRole('super_admin')) return true
    if (hasRole('admin_empresa')) {
      return infoType === 'performance' || infoType === 'personal'
    }
    
    // Los usuarios solo pueden ver su propia información
    return user.id === targetUserId
  }

  /**
   * Verifica si el usuario puede aprobar acciones de nivel superior
   */
  const canApproveHigherLevelAction = (action: 'user_creation' | 'promotion' | 'access_request'): boolean => {
    if (!user) return false
    
    // Solo admin de empresa y super admin
    if (hasRole('super_admin')) return true
    if (hasRole('admin_empresa')) return true
    
    return false
  }

  /**
   * Verifica permisos de departamento específico
   */
  const canAccessDepartment = (departmentId: string): boolean => {
    if (!user) return false
    
    // Super admin y admin de empresa tienen acceso a todos los departamentos
    if (hasRole('super_admin') || hasRole('admin_empresa')) return true
    
    // Verificar si pertenece al departamento
    return user.enterpriseId === departmentId
  }

  /**
   * Verifica permisos de clínica específica
   */
  const canAccessClinic = (clinicId: string): boolean => {
    if (!user) return false
    
    // Super admin, admin de empresa y médicos especialistas tienen acceso completo
    if (hasRole('super_admin') || hasRole('admin_empresa') || hasRole('medico_especialista')) return true
    
    // Verificar si la clínica está en su área
    return user.sede === clinicId
  }

  /**
   * Obtiene la lista de usuarios que este usuario puede gestionar
   */
  const getManageableUsers = (allUsers: any[]): any[] => {
    if (!user) return []
    
    return allUsers.filter(targetUser => {
      // No puede gestionarse a sí mismo
      if (targetUser.id === user.id) return false
      
      // Super admin puede gestionar todos
      if (hasRole('super_admin')) return true
      
      // Admin de empresa puede gestionar hasta nivel médico
      if (hasRole('admin_empresa')) {
        return getHierarchyLevel(targetUser.hierarchy) <= 3
      }
      
      // Médicos pueden gestionar personal técnico y pacientes
      if (hasRole('medico_especialista') || hasRole('medico_trabajo')) {
        return getHierarchyLevel(targetUser.hierarchy) <= 2
      }
      
      // Otros no pueden gestionar usuarios
      return false
    })
  }

  /**
   * Verifica si puede realizar acciones masivas
   */
  const canPerformBulkActions = (action: 'export' | 'import' | 'delete'): boolean => {
    if (!user) return false
    
    // Solo super admin y admin de empresa
    if (hasRole('super_admin')) return true
    if (hasRole('admin_empresa')) return action !== 'delete' // Admin empresa no puede eliminar masivamente
    
    return false
  }

  /**
   * Verifica acceso a configuraciones del sistema
   */
  const canAccessSystemSettings = (settingType: 'security' | 'billing' | 'integrations' | 'compliance'): boolean => {
    if (!user) return false
    
    // Super admin tiene acceso a todo
    if (hasRole('super_admin')) return true
    
    // Admin de empresa tiene acceso a billing e integrations
    if (hasRole('admin_empresa')) {
      return ['billing', 'integrations'].includes(settingType)
    }
    
    return false
  }

  /**
   * Obtiene el nivel de jerarquía de un usuario
   */
  const getHierarchyLevel = (hierarchy: any): number => {
    const levels: Record<string, number> = {
      'super_admin': 5,
      'admin_empresa': 4,
      'medico_especialista': 3,
      'medico_trabajo': 3,
      'enfermera': 2,
      'audiometrista': 2,
      'psicologo_laboral': 2,
      'tecnico_ergonomico': 2,
      'recepcion': 1,
      'paciente': 0
    }
    return levels[hierarchy] || 0
  }

  /**
   * Verifica si puede acceder a una funcionalidad basada en el contexto
   */
  const canAccessContextualFeature = (
    feature: 'patient_records' | 'billing_info' | 'staff_schedule' | 'compliance_reports',
    context: { userId?: string; patientId?: string; departmentId?: string }
  ): boolean => {
    if (!user) return false

    switch (feature) {
      case 'patient_records':
        // Médicos y personal médico pueden ver expedientes
        if (hasRole('medico_especialista') || hasRole('medico_trabajo') || 
            hasRole('enfermera') || hasRole('audiometrista')) {
          return true
        }
        // Pacientes solo pueden ver sus propios expedientes
        if (hasRole('paciente') && context.patientId === user.id) {
          return true
        }
        break

      case 'billing_info':
        // Admin de empresa y super admin
        return hasRole('admin_empresa') || hasRole('super_admin')

      case 'staff_schedule':
        // Médicos, admin de empresa y super admin
        return hasRole('medico_especialista') || hasRole('medico_trabajo') || 
               hasRole('admin_empresa') || hasRole('super_admin')

      case 'compliance_reports':
        // Admin de empresa y super admin
        return hasRole('admin_empresa') || hasRole('super_admin')
    }

    return false
  }

  return {
    hasPermission,
    hasRole,
    hasHierarchyRole,
    canManageUser,
    canCreateUserAtLevel,
    canViewSensitiveUserInfo,
    canApproveHigherLevelAction,
    canAccessDepartment,
    canAccessClinic,
    getManageableUsers,
    canPerformBulkActions,
    canAccessSystemSettings,
    getHierarchyLevel,
    canAccessContextualFeature
  }
}

// Utilidades para componentes comunes
export function AdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate hierarchy={['super_admin', 'admin_empresa']} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function SuperAdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate hierarchy="super_admin" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function MedicalStaffOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate hierarchy={['medico_especialista', 'medico_trabajo']} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function TechnicalStaffOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate hierarchy={['enfermera', 'audiometrista', 'psicologo_laboral', 'tecnico_ergonomico']} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function PatientView({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate hierarchy="paciente" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

// HOC para proteger componentes
export function withPermissionCheck<P extends object>(
  Component: React.ComponentType<P>,
  permissionConfig: {
    resource?: ResourceType
    action?: keyof PermissionAction
    conditions?: PermissionCondition[]
    hierarchy?: any
    fallback?: React.ComponentType
  }
) {
  return function WrappedComponent(props: P) {
    const { resource, action, conditions, hierarchy, fallback: FallbackComponent } = permissionConfig
    
    return (
      <PermissionGate
        resource={resource}
        action={action}
        conditions={conditions}
        hierarchy={hierarchy}
        fallback={FallbackComponent ? <FallbackComponent /> : null}
      >
        <Component {...props} />
      </PermissionGate>
    )
  }
}
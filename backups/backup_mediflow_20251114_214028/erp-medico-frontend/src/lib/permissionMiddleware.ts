// Middleware de autenticación y permisos granulares para SaaS
import { SaaSUser, GranularPermission, PermissionAction, PermissionCondition, ResourceType, UserHierarchy, SaaSHierarchy, Department, Clinic, HIERARCHY_LEVELS, HIERARCHY_CONSTANTS } from '@/types/saas'

export class PermissionMiddleware {
  private static instance: PermissionMiddleware
  
  private constructor() {}
  
  static getInstance(): PermissionMiddleware {
    if (!PermissionMiddleware.instance) {
      PermissionMiddleware.instance = new PermissionMiddleware()
    }
    return PermissionMiddleware.instance
  }

  /**
   * Verifica si el usuario tiene permisos específicos para un recurso
   */
  checkPermission(
    user: SaaSUser, 
    resource: ResourceType, 
    action: keyof PermissionAction, 
    context?: any
  ): boolean {
    // Super admin tiene acceso a todo
    if (user.hierarchy === HIERARCHY_CONSTANTS.SUPER_ADMIN) {
      return true
    }

    // Verificar permisos directos del usuario
    const userPermission = this.findPermission(user.permissions, resource, action)
    if (userPermission) {
      if (!this.evaluateConditions(userPermission.conditions, user, context)) {
        return false
      }
      return true
    }

    // Verificar permisos heredados por jerarquía
    return this.checkInheritedPermissions(user, resource, action, context)
  }

  /**
   * Verifica si un usuario puede acceder a otro usuario basado en jerarquía
   */
  checkHierarchyAccess(manager: SaaSUser, employee: SaaSUser): boolean {
    // Super admin puede ver todos
    if (manager.hierarchy === HIERARCHY_CONSTANTS.SUPER_ADMIN) {
      return true
    }

    // Mismo nivel no puede gestionar (excepto admin de empresa)
    if (manager.hierarchy === employee.hierarchy) {
      return manager.hierarchy === HIERARCHY_CONSTANTS.ADMIN_EMPRESA
    }

    // Verificar jerarquía ascendente
    return HIERARCHY_LEVELS[manager.hierarchy] > HIERARCHY_LEVELS[employee.hierarchy]
  }

  /**
   * Verifica si el usuario pertenece a la misma empresa
   */
  checkEnterpriseAccess(user: SaaSUser, enterpriseId: string): boolean {
    return user.enterpriseId === enterpriseId || 
           user.hierarchy === HIERARCHY_CONSTANTS.SUPER_ADMIN
  }

  /**
   * Verifica si el usuario puede acceder a un departamento
   */
  checkDepartmentAccess(user: SaaSUser, departmentId: string): boolean {
    // Super admin y admin de empresa tienen acceso a todos los departamentos
    const highLevelUsers: UserHierarchy[] = [HIERARCHY_CONSTANTS.SUPER_ADMIN, HIERARCHY_CONSTANTS.ADMIN_EMPRESA]
    if (highLevelUsers.includes(user.hierarchy)) {
      return true
    }

    // Verificar si pertenece al departamento
    return user.departmentId === departmentId
  }

  /**
   * Verifica si el usuario puede acceder a una clínica
   */
  checkClinicAccess(user: SaaSUser, clinicId: string): boolean {
    // Super admin, admin de empresa y médicos especialistas tienen acceso completo
    const fullAccessUsers: UserHierarchy[] = [
      HIERARCHY_CONSTANTS.SUPER_ADMIN, 
      HIERARCHY_CONSTANTS.ADMIN_EMPRESA, 
      HIERARCHY_CONSTANTS.MEDICO_ESPECIALISTA
    ]
    if (fullAccessUsers.includes(user.hierarchy)) {
      return true
    }

    // Verificar si la clínica está en su departamento
    return user.clinicId === clinicId
  }

  /**
   * Verifica si un manager puede gestionar un empleado
   */
  canManageUser(manager: SaaSUser, employee: SaaSUser): boolean {
    // Verificar acceso por empresa
    if (!this.checkEnterpriseAccess(manager, employee.enterpriseId)) {
      return false
    }

    // Verificar jerarquía
    if (!this.checkHierarchyAccess(manager, employee)) {
      return false
    }

    // Verificar relaciones de reporte directo
    if (employee.reportsTo && employee.reportsTo !== manager.id) {
      return false
    }

    return true
  }

  /**
   * Verifica si un usuario puede acceder a un recurso específico
   */
  canAccessResource(user: SaaSUser, resourceType: ResourceType, resourceId?: string): boolean {
    const action: keyof PermissionAction = 'read'
    
    // Verificar permisos básicos
    if (!this.checkPermission(user, resourceType, action)) {
      return false
    }

    // Verificaciones específicas por tipo de recurso
    switch (resourceType) {
      case 'users':
        return this.canAccessUserResource(user, resourceId)
      case 'patients':
        return this.canAccessPatientResource(user, resourceId)
      case 'appointments':
        return this.canAccessAppointmentResource(user, resourceId)
      case 'examinations':
        return this.canAccessExaminationResource(user, resourceId)
      default:
        return true
    }
  }

  /**
   * Filtra lista de usuarios basado en permisos del viewer
   */
  filterUsersByPermission(viewer: SaaSUser, users: SaaSUser[]): SaaSUser[] {
    // Super admin ve todos
    if (viewer.hierarchy === HIERARCHY_CONSTANTS.SUPER_ADMIN) {
      return users
    }

    return users.filter(user => {
      // Misma empresa
      if (!this.checkEnterpriseAccess(viewer, user.enterpriseId)) {
        return false
      }

      // Mismo departamento (excepto admin de empresa)
      if (viewer.hierarchy !== HIERARCHY_CONSTANTS.ADMIN_EMPRESA) {
        if (!this.checkDepartmentAccess(viewer, user.departmentId || '')) {
          return false
        }
      }

      // Verificar jerarquía
      return this.checkHierarchyAccess(viewer, user)
    })
  }

  /**
   * Crea un nuevo permiso granular
   */
  createGranularPermission(
    resource: ResourceType,
    action: keyof PermissionAction,
    level: 'system' | 'enterprise' | 'department' | 'clinic' | 'user' = 'user',
    conditions?: PermissionCondition[]
  ): GranularPermission {
    return {
      id: `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resource,
      action: { read: false, create: false, update: false, delete: false, export: false, import: false, admin: false, [action]: true },
      level,
      conditions
    }
  }

  /**
   * Obtiene permisos por jerarquía
   */
  getPermissionsByHierarchy(hierarchy: UserHierarchy): GranularPermission[] {
    const permissions: GranularPermission[] = []

    switch (hierarchy) {
      case HIERARCHY_CONSTANTS.SUPER_ADMIN:
        // Acceso total
        const allResources: ResourceType[] = ['users', 'patients', 'appointments', 'examinations', 'reports', 'billing', 'inventory', 'settings', 'audits']
        allResources.forEach(resource => {
          ['read', 'create', 'update', 'delete', 'export', 'import', 'admin'].forEach(action => {
            permissions.push(this.createGranularPermission(
              resource as ResourceType, 
              action as keyof PermissionAction
            ))
          })
        })
        break

      case HIERARCHY_CONSTANTS.ADMIN_EMPRESA:
        // Gestión completa de empresa
        ['users', 'patients', 'appointments', 'examinations', 'reports', 'billing', 'inventory', 'settings'].forEach(resource => {
          ;['read', 'create', 'update', 'delete', 'export'].forEach(action => {
            permissions.push(this.createGranularPermission(
              resource as ResourceType, 
              action as keyof PermissionAction,
              'enterprise'
            ))
          })
        })
        break

      case HIERARCHY_CONSTANTS.MEDICO_ESPECIALISTA:
      case HIERARCHY_CONSTANTS.MEDICO_TRABAJO:
        // Acceso médico completo
        ['patients', 'appointments', 'examinations', 'reports'].forEach(resource => {
          ;['read', 'create', 'update', 'export'].forEach(action => {
            permissions.push(this.createGranularPermission(
              resource as ResourceType, 
              action as keyof PermissionAction,
              'department'
            ))
          })
        })
        break

      case HIERARCHY_CONSTANTS.ENFERMERA:
      case HIERARCHY_CONSTANTS.AUDIOMETRISTA:
      case HIERARCHY_CONSTANTS.PSICOLOGO_LABORAL:
      case HIERARCHY_CONSTANTS.TECNICO_ERGONOMICO:
        // Personal de apoyo
        ['patients', 'appointments', 'examinations'].forEach(resource => {
          ;['read', 'create', 'update'].forEach(action => {
            permissions.push(this.createGranularPermission(
              resource as ResourceType, 
              action as keyof PermissionAction,
              'clinic'
            ))
          })
        })
        break

      case HIERARCHY_CONSTANTS.RECEPCION:
        // Personal administrativo
        ['patients', 'appointments'].forEach(resource => {
          ;['read', 'create', 'update'].forEach(action => {
            permissions.push(this.createGranularPermission(
              resource as ResourceType, 
              action as keyof PermissionAction,
              'clinic'
            ))
          })
        })
        break

      case HIERARCHY_CONSTANTS.PACIENTE:
        // Solo sus propios datos
        permissions.push(this.createGranularPermission('patients', 'read', 'user', [
          { type: 'ownership', operator: 'equals', value: 'self' }
        ]))
        break
    }

    return permissions
  }

  // Métodos privados

  private findPermission(
    permissions: GranularPermission[], 
    resource: ResourceType, 
    action: keyof PermissionAction
  ): GranularPermission | undefined {
    return permissions.find(p => p.resource === resource && p.action[action])
  }

  private checkInheritedPermissions(
    user: SaaSUser, 
    resource: ResourceType, 
    action: keyof PermissionAction, 
    context?: any
  ): boolean {
    // Por ahora, verificar solo permisos directos
    // En una implementación completa, aquí se resolverían permisos heredados
    return false
  }

  private evaluateConditions(
    conditions: PermissionCondition[] = [], 
    user: SaaSUser, 
    context?: any
  ): boolean {
    return conditions.every(condition => this.evaluateCondition(condition, user, context))
  }

  private evaluateCondition(
    condition: PermissionCondition, 
    user: SaaSUser, 
    context?: any
  ): boolean {
    const value = this.getConditionValue(condition, user, context)
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value
      case 'not_equals':
        return value !== condition.value
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value)
      case 'contains':
        return String(value).includes(String(condition.value))
      default:
        return false
    }
  }

  private getConditionValue(condition: PermissionCondition, user: SaaSUser, context?: any): any {
    switch (condition.type) {
      case 'ownership':
        return context?.resourceOwnerId === user.id ? 'self' : 'other'
      case 'department':
        return user.departmentId
      case 'enterprise':
        return user.enterpriseId
      case 'hierarchy':
        return user.hierarchy
      case 'custom':
        return condition.field ? user.metadata?.[condition.field] : null
      default:
        return null
    }
  }

  private canAccessUserResource(user: SaaSUser, resourceId?: string): boolean {
    if (!resourceId) return true
    return this.checkPermission(user, 'users', 'read')
  }

  private canAccessPatientResource(user: SaaSUser, resourceId?: string): boolean {
    if (!resourceId) return this.checkPermission(user, 'patients', 'read')
    
    // Pacientes solo pueden ver sus propios datos
    if (user.hierarchy === HIERARCHY_CONSTANTS.PACIENTE) {
      return this.checkPermission(user, 'patients', 'read', { resourceOwnerId: resourceId })
    }
    
    return this.checkPermission(user, 'patients', 'read')
  }

  private canAccessAppointmentResource(user: SaaSUser, resourceId?: string): boolean {
    return this.checkPermission(user, 'appointments', 'read')
  }

  private canAccessExaminationResource(user: SaaSUser, resourceId?: string): boolean {
    return this.checkPermission(user, 'examinations', 'read')
  }
}

// Export singleton instance
export const permissionMiddleware = PermissionMiddleware.getInstance()
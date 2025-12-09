// Hook para verificar permisos específicos por rol y módulo
import { useAuth } from '@/contexts/AuthContext'
import { getRoleConfig, canPerformAction, RoleViewConfig } from '@/config/roleConfig'
import { UserRole } from '@/types/auth'

export function useRolePermissions() {
  const { user } = useAuth()
  const role = (user?.rol || 'paciente') as UserRole
  const config = getRoleConfig(role)

  // Verificar si puede realizar una acción en un módulo
  const can = (
    module: keyof RoleViewConfig['modules'],
    action: 'canView' | 'canViewAll' | 'canViewOwn' | 'canViewFull' | 'canCreate' | 'canEdit' | 'canDelete' | 'canExport' | 'canPrint' | 'canDigitalSign' | 'canCertify' | 'canCancel' | 'canReschedule' | 'canAddNotes' | 'canManage' | 'canOrder' | 'canGenerate' | 'canApprove' | 'showAdvancedFilters' | 'canAccess' | 'canUseAssistant' | 'canPurchase' | 'canManageProducts' | 'canUpload' | 'canAnnotate' | 'canReceive'
  ): boolean => {
    return canPerformAction(role, module, action)
  }

  // Verificar si puede realizar una acción general
  const canAction = (action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import', resource?: string): boolean => {
    if (!resource) return false

    const actions = config.actions
    const actionMap: Record<string, keyof typeof actions> = {
      'create': 'canCreate',
      'read': 'canRead',
      'update': 'canUpdate',
      'delete': 'canDelete',
      'export': 'canExport',
      'import': 'canImport'
    }

    const actionKey = actionMap[action]
    if (!actionKey) return false

    const allowedResources = actions[actionKey]
    return allowedResources.includes('*') || allowedResources.includes(resource)
  }

  // Obtener configuración de un módulo específico
  const getModuleConfig = (module: keyof RoleViewConfig['modules']) => {
    return config.modules[module]
  }

  // Verificar configuración de settings
  const canViewSetting = (setting: keyof RoleViewConfig['settings']): boolean => {
    return config.settings[setting]
  }

  // Obtener configuración completa del dashboard
  const getDashboardConfig = () => {
    return config.dashboard
  }

  return {
    role,
    config,
    can,
    canAction,
    getModuleConfig,
    canViewSetting,
    getDashboardConfig,
    // Helpers específicos por módulo
    pacientes: {
      canViewAll: can('pacientes', 'canViewAll'),
      canViewOwn: can('pacientes', 'canViewOwn'),
      canEdit: can('pacientes', 'canEdit'),
      canDelete: can('pacientes', 'canDelete'),
      canExport: can('pacientes', 'canExport'),
      showAdvancedFilters: can('pacientes', 'showAdvancedFilters')
    },
    citas: {
      canViewAll: can('citas', 'canViewAll'),
      canViewOwn: can('citas', 'canViewOwn'),
      canCreate: can('citas', 'canCreate'),
      canEdit: can('citas', 'canEdit'),
      canCancel: can('citas', 'canCancel'),
      canReschedule: can('citas', 'canReschedule')
    },
    examenes: {
      canViewAll: can('examenes', 'canViewAll'),
      canViewOwn: can('examenes', 'canViewOwn'),
      canCreate: can('examenes', 'canCreate'),
      canEdit: can('examenes', 'canEdit'),
      canCertify: can('examenes', 'canCertify')
    },
    recetas: {
      canCreate: can('recetas', 'canCreate'),
      canView: can('recetas', 'canView'),
      canEdit: can('recetas', 'canEdit'),
      canPrint: can('recetas', 'canPrint'),
      canDigitalSign: can('recetas', 'canDigitalSign')
    },
    historial: {
      canViewFull: can('historial', 'canViewFull'),
      canViewOwn: can('historial', 'canViewOwn'),
      canAddNotes: can('historial', 'canAddNotes'),
      canEdit: can('historial', 'canEdit')
    },
    facturacion: {
      canView: can('facturacion', 'canView'),
      canCreate: can('facturacion', 'canCreate'),
      canEdit: can('facturacion', 'canEdit'),
      canApprove: can('facturacion', 'canApprove')
    },
    inventario: {
      canView: can('inventario', 'canView'),
      canManage: can('inventario', 'canManage'),
      canOrder: can('inventario', 'canOrder')
    },
    reportes: {
      canView: can('reportes', 'canView'),
      canGenerate: can('reportes', 'canGenerate'),
      canExport: can('reportes', 'canExport')
    }
  }
}


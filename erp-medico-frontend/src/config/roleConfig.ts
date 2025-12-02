// Configuración completa de roles, permisos y vistas
import { UserRole } from '@/types/auth'
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  Building2,
  CreditCard,
  Package,
  Settings,
  BarChart3,
  Shield,
  Activity,
  Microscope,
  ClipboardCheck,
  UserCheck,
  Crown,
  Heart,
  ClipboardList,
  Pill,
  X,
  AlertCircle,
  History,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Sparkles
} from 'lucide-react'

export interface RoleViewConfig {
  // Navegación
  navigation: {
    title: string
    path: string
    resource: string
    icon: React.ElementType
    gradient?: string
    badge?: string | number
    visible: boolean
  }[]

  // Dashboard específico
  dashboard: {
    showKPIs: boolean
    showCharts: boolean
    showRecentActivity: boolean
    showAlerts: boolean
    customWidgets?: string[]
  }

  // Acciones permitidas
  actions: {
    canCreate: string[]
    canRead: string[]
    canUpdate: string[]
    canDelete: string[]
    canExport: string[]
    canImport: string[]
  }

  // Configuraciones visibles
  settings: {
    canViewGeneral: boolean
    canViewSecurity: boolean
    canViewBilling: boolean
    canViewIntegrations: boolean
    canViewNotifications: boolean
    canViewBackup: boolean
  }

  // Contenido específico por módulo
  modules: {
    pacientes: {
      canViewAll: boolean
      canViewOwn: boolean
      canEdit: boolean
      canDelete: boolean
      canExport: boolean
      showAdvancedFilters: boolean
    }
    citas: {
      canViewAll: boolean
      canViewOwn: boolean
      canCreate: boolean
      canEdit: boolean
      canCancel: boolean
      canReschedule: boolean
    }
    examenes: {
      canViewAll: boolean
      canViewOwn: boolean
      canCreate: boolean
      canEdit: boolean
      canCertify: boolean
    }
    recetas: {
      canCreate: boolean
      canView: boolean
      canEdit: boolean
      canPrint: boolean
      canDigitalSign: boolean
    }
    historial: {
      canViewFull: boolean
      canViewOwn: boolean
      canAddNotes: boolean
      canEdit: boolean
    }
    facturacion: {
      canView: boolean
      canCreate: boolean
      canEdit: boolean
      canApprove: boolean
    }
    inventario: {
      canView: boolean
      canManage: boolean
      canOrder: boolean
    }
    reportes: {
      canView: boolean
      canGenerate: boolean
      canExport: boolean
    }
    // Nuevos módulos
    ia: {
      canAccess: boolean
      canUseAssistant: boolean
    }
    tienda: {
      canView: boolean
      canPurchase: boolean
      canManageProducts: boolean
    }
    rayos_x: {
      canView: boolean
      canUpload: boolean
      canAnnotate: boolean
    }
    alertas: {
      canView: boolean
      canManage: boolean
      canReceive: boolean
    }
  }
}

export const ROLE_CONFIG: Record<UserRole, RoleViewConfig> = {
  super_admin: {
    navigation: [
      { title: 'Dashboard', path: '/dashboard', resource: 'dashboard', icon: LayoutDashboard, gradient: 'from-purple-500 to-pink-500', visible: true },
      { title: 'Empresas', path: '/empresas', resource: 'empresas', icon: Building2, gradient: 'from-blue-500 to-cyan-500', visible: true },
      { title: 'Super Admin', path: '/super-admin', resource: 'sistema', icon: Crown, gradient: 'from-yellow-500 to-orange-500', visible: true },
      { title: 'Usuarios', path: '/usuarios', resource: 'usuarios', icon: Users, gradient: 'from-green-500 to-emerald-500', visible: true },
      { title: 'Analytics', path: '/analytics', resource: 'analytics', icon: BarChart3, gradient: 'from-indigo-500 to-purple-500', visible: true },
      { title: 'Configuración', path: '/configuracion', resource: 'configuracion', icon: Settings, gradient: 'from-gray-500 to-slate-600', visible: true },
      // Nuevos
      { title: 'IA Asistente', path: '/ia', resource: 'ia', icon: Sparkles, gradient: 'from-violet-500 to-fuchsia-500', visible: true },
      { title: 'Tienda', path: '/tienda', resource: 'tienda', icon: Package, gradient: 'from-orange-500 to-red-500', visible: true },
      { title: 'Rayos X', path: '/rayos-x', resource: 'rayos_x', icon: Activity, gradient: 'from-blue-600 to-cyan-600', visible: true },
      { title: 'Alertas', path: '/alertas', resource: 'alertas', icon: AlertCircle, gradient: 'from-red-600 to-rose-600', visible: true }
    ],
    dashboard: {
      showKPIs: true,
      showCharts: true,
      showRecentActivity: true,
      showAlerts: true,
      customWidgets: ['empresas', 'usuarios', 'facturacion', 'sistema']
    },
    actions: {
      canCreate: ['*'],
      canRead: ['*'],
      canUpdate: ['*'],
      canDelete: ['*'],
      canExport: ['*'],
      canImport: ['*']
    },
    settings: {
      canViewGeneral: true,
      canViewSecurity: true,
      canViewBilling: true,
      canViewIntegrations: true,
      canViewNotifications: true,
      canViewBackup: true
    },
    modules: {
      pacientes: { canViewAll: true, canViewOwn: true, canEdit: true, canDelete: true, canExport: true, showAdvancedFilters: true },
      citas: { canViewAll: true, canViewOwn: true, canCreate: true, canEdit: true, canCancel: true, canReschedule: true },
      examenes: { canViewAll: true, canViewOwn: true, canCreate: true, canEdit: true, canCertify: true },
      recetas: { canCreate: true, canView: true, canEdit: true, canPrint: true, canDigitalSign: true },
      historial: { canViewFull: true, canViewOwn: true, canAddNotes: true, canEdit: true },
      facturacion: { canView: true, canCreate: true, canEdit: true, canApprove: true },
      inventario: { canView: true, canManage: true, canOrder: true },
      reportes: { canView: true, canGenerate: true, canExport: true },
      ia: { canAccess: true, canUseAssistant: true },
      tienda: { canView: true, canPurchase: true, canManageProducts: true },
      rayos_x: { canView: true, canUpload: true, canAnnotate: true },
      alertas: { canView: true, canManage: true, canReceive: true }
    }
  },

  admin_empresa: {
    navigation: [
      { title: 'Dashboard', path: '/dashboard', resource: 'dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-cyan-500', visible: true },
      { title: 'Pacientes', path: '/pacientes', resource: 'pacientes', icon: Users, gradient: 'from-green-500 to-emerald-500', visible: true },
      { title: 'Agenda', path: '/agenda', resource: 'citas', icon: Calendar, gradient: 'from-purple-500 to-pink-500', visible: true },
      { title: 'Exámenes', path: '/examenes', resource: 'examenes', icon: Stethoscope, gradient: 'from-red-500 to-orange-500', visible: true },
      { title: 'Personal Médico', path: '/medicos', resource: 'usuarios', icon: UserCheck, gradient: 'from-teal-500 to-cyan-500', visible: true },
      { title: 'Sedes', path: '/sedes', resource: 'sedes', icon: Building2, gradient: 'from-indigo-500 to-blue-500', visible: true },
      { title: 'Facturación', path: '/facturacion', resource: 'facturacion', icon: CreditCard, gradient: 'from-yellow-500 to-amber-500', visible: true },
      { title: 'Inventario', path: '/inventario', resource: 'inventario', icon: Package, gradient: 'from-lime-500 to-green-500', visible: true },
      { title: 'Reportes', path: '/reportes', resource: 'reportes', icon: BarChart3, gradient: 'from-violet-500 to-purple-500', visible: true },
      { title: 'Configuración', path: '/configuracion', resource: 'configuracion', icon: Settings, gradient: 'from-gray-500 to-slate-600', visible: true },
      // Nuevos
      { title: 'IA Asistente', path: '/ia', resource: 'ia', icon: Sparkles, gradient: 'from-violet-500 to-fuchsia-500', visible: true },
      { title: 'Tienda', path: '/tienda', resource: 'tienda', icon: Package, gradient: 'from-orange-500 to-red-500', visible: true },
      { title: 'Rayos X', path: '/rayos-x', resource: 'rayos_x', icon: Activity, gradient: 'from-blue-600 to-cyan-600', visible: true },
      { title: 'Alertas', path: '/alertas', resource: 'alertas', icon: AlertCircle, gradient: 'from-red-600 to-rose-600', visible: true }
    ],
    dashboard: {
      showKPIs: true,
      showCharts: true,
      showRecentActivity: true,
      showAlerts: true,
      customWidgets: ['pacientes', 'citas', 'facturacion', 'personal']
    },
    actions: {
      canCreate: ['pacientes', 'citas', 'examenes', 'usuarios', 'sedes', 'facturacion', 'inventario'],
      canRead: ['*'],
      canUpdate: ['pacientes', 'citas', 'examenes', 'usuarios', 'sedes', 'facturacion', 'inventario', 'configuracion'],
      canDelete: ['pacientes', 'citas', 'examenes', 'usuarios', 'sedes', 'inventario'],
      canExport: ['pacientes', 'citas', 'examenes', 'reportes', 'facturacion'],
      canImport: ['pacientes', 'usuarios']
    },
    settings: {
      canViewGeneral: true,
      canViewSecurity: false,
      canViewBilling: true,
      canViewIntegrations: true,
      canViewNotifications: true,
      canViewBackup: false
    },
    modules: {
      pacientes: { canViewAll: true, canViewOwn: true, canEdit: true, canDelete: true, canExport: true, showAdvancedFilters: true },
      citas: { canViewAll: true, canViewOwn: true, canCreate: true, canEdit: true, canCancel: true, canReschedule: true },
      examenes: { canViewAll: true, canViewOwn: true, canCreate: true, canEdit: true, canCertify: false },
      recetas: { canCreate: false, canView: true, canEdit: false, canPrint: true, canDigitalSign: false },
      historial: { canViewFull: true, canViewOwn: true, canAddNotes: false, canEdit: false },
      facturacion: { canView: true, canCreate: true, canEdit: true, canApprove: true },
      inventario: { canView: true, canManage: true, canOrder: true },
      reportes: { canView: true, canGenerate: true, canExport: true },
      ia: { canAccess: true, canUseAssistant: true },
      tienda: { canView: true, canPurchase: true, canManageProducts: true },
      rayos_x: { canView: true, canUpload: true, canAnnotate: false },
      alertas: { canView: true, canManage: true, canReceive: true }
    }
  },

  medico: {
    navigation: [
      { title: 'Mi Dashboard', path: '/dashboard', resource: 'dashboard', icon: LayoutDashboard, gradient: 'from-green-500 to-emerald-500', visible: true },
      { title: 'Mis Pacientes', path: '/pacientes', resource: 'pacientes', icon: Users, gradient: 'from-blue-500 to-cyan-500', visible: true },
      { title: 'Mi Agenda', path: '/agenda', resource: 'citas', icon: Calendar, gradient: 'from-purple-500 to-pink-500', visible: true },
      { title: 'Exámenes', path: '/examenes', resource: 'examenes', icon: Microscope, gradient: 'from-red-500 to-orange-500', visible: true },
      { title: 'Evaluaciones', path: '/evaluaciones', resource: 'evaluaciones', icon: ClipboardCheck, gradient: 'from-teal-500 to-cyan-500', visible: true },
      { title: 'Certificaciones', path: '/certificaciones', resource: 'certificaciones', icon: FileText, gradient: 'from-indigo-500 to-blue-500', visible: true },
      { title: 'Mis Reportes', path: '/reportes', resource: 'reportes', icon: Activity, gradient: 'from-violet-500 to-purple-500', visible: true },
      // Nuevos
      { title: 'IA Asistente', path: '/ia', resource: 'ia', icon: Sparkles, gradient: 'from-violet-500 to-fuchsia-500', visible: true },
      { title: 'Tienda', path: '/tienda', resource: 'tienda', icon: Package, gradient: 'from-orange-500 to-red-500', visible: true },
      { title: 'Rayos X', path: '/rayos-x', resource: 'rayos_x', icon: Activity, gradient: 'from-blue-600 to-cyan-600', visible: true },
      { title: 'Alertas', path: '/alertas', resource: 'alertas', icon: AlertCircle, gradient: 'from-red-600 to-rose-600', visible: true }
    ],
    dashboard: {
      showKPIs: true,
      showCharts: false,
      showRecentActivity: true,
      showAlerts: true,
      customWidgets: ['mis_citas', 'mis_pacientes', 'pendientes']
    },
    actions: {
      canCreate: ['citas', 'examenes', 'recetas', 'certificaciones', 'evaluaciones'],
      canRead: ['pacientes', 'citas', 'examenes', 'historial', 'reportes'],
      canUpdate: ['citas', 'examenes', 'recetas', 'certificaciones', 'evaluaciones'],
      canDelete: ['citas'],
      canExport: ['reportes', 'certificaciones'],
      canImport: []
    },
    settings: {
      canViewGeneral: true,
      canViewSecurity: false,
      canViewBilling: false,
      canViewIntegrations: false,
      canViewNotifications: true,
      canViewBackup: false
    },
    modules: {
      pacientes: { canViewAll: false, canViewOwn: true, canEdit: true, canDelete: false, canExport: false, showAdvancedFilters: false },
      citas: { canViewAll: false, canViewOwn: true, canCreate: true, canEdit: true, canCancel: true, canReschedule: true },
      examenes: { canViewAll: false, canViewOwn: true, canCreate: true, canEdit: true, canCertify: true },
      recetas: { canCreate: true, canView: true, canEdit: true, canPrint: true, canDigitalSign: true },
      historial: { canViewFull: true, canViewOwn: true, canAddNotes: true, canEdit: true },
      facturacion: { canView: false, canCreate: false, canEdit: false, canApprove: false },
      inventario: { canView: true, canManage: false, canOrder: false },
      reportes: { canView: true, canGenerate: true, canExport: true },
      ia: { canAccess: true, canUseAssistant: true },
      tienda: { canView: true, canPurchase: true, canManageProducts: false },
      rayos_x: { canView: true, canUpload: true, canAnnotate: true },
      alertas: { canView: true, canManage: true, canReceive: true }
    }
  },

  paciente: {
    navigation: [
      { title: 'Mi Panel', path: '/dashboard', resource: 'dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-cyan-500', visible: true },
      { title: 'Mi Perfil', path: '/perfil', resource: 'perfil', icon: UserCheck, gradient: 'from-orange-500 to-red-500', visible: true },
      { title: 'Mis Citas', path: '/citas', resource: 'citas', icon: Calendar, gradient: 'from-purple-500 to-pink-500', visible: true },
      { title: 'Mis Exámenes', path: '/examenes', resource: 'examenes', icon: Stethoscope, gradient: 'from-blue-500 to-cyan-500', visible: true },
      { title: 'Mis Resultados', path: '/resultados', resource: 'reportes', icon: FileText, gradient: 'from-green-500 to-emerald-500', visible: true },
      { title: 'Mi Historial', path: '/historial', resource: 'reportes', icon: History, gradient: 'from-indigo-500 to-purple-500', visible: true },
      // Nuevos
      { title: 'Tienda', path: '/tienda', resource: 'tienda', icon: Package, gradient: 'from-orange-500 to-red-500', visible: true },
      { title: 'Rayos X', path: '/rayos-x', resource: 'rayos_x', icon: Activity, gradient: 'from-blue-600 to-cyan-600', visible: true },
      { title: 'Alertas', path: '/alertas', resource: 'alertas', icon: AlertCircle, gradient: 'from-red-600 to-rose-600', visible: true }
    ],
    dashboard: {
      showKPIs: false,
      showCharts: false,
      showRecentActivity: true,
      showAlerts: true,
      customWidgets: ['proximas_citas', 'resultados_pendientes', 'alertas']
    },
    actions: {
      canCreate: ['citas'],
      canRead: ['citas', 'examenes', 'resultados', 'historial', 'perfil'],
      canUpdate: ['perfil', 'citas'],
      canDelete: ['citas'],
      canExport: ['resultados', 'historial'],
      canImport: []
    },
    settings: {
      canViewGeneral: true,
      canViewSecurity: true,
      canViewBilling: false,
      canViewIntegrations: false,
      canViewNotifications: true,
      canViewBackup: false
    },
    modules: {
      pacientes: { canViewAll: false, canViewOwn: true, canEdit: false, canDelete: false, canExport: false, showAdvancedFilters: false },
      citas: { canViewAll: false, canViewOwn: true, canCreate: true, canEdit: false, canCancel: true, canReschedule: false },
      examenes: { canViewAll: false, canViewOwn: true, canCreate: false, canEdit: false, canCertify: false },
      recetas: { canCreate: false, canView: true, canEdit: false, canPrint: true, canDigitalSign: false },
      historial: { canViewFull: false, canViewOwn: true, canAddNotes: false, canEdit: false },
      facturacion: { canView: false, canCreate: false, canEdit: false, canApprove: false },
      inventario: { canView: false, canManage: false, canOrder: false },
      reportes: { canView: true, canGenerate: false, canExport: true },
      ia: { canAccess: false, canUseAssistant: false },
      tienda: { canView: true, canPurchase: true, canManageProducts: false },
      rayos_x: { canView: true, canUpload: false, canAnnotate: false },
      alertas: { canView: true, canManage: false, canReceive: true }
    }
  }
}

// Helper para obtener configuración de rol
export function getRoleConfig(role: UserRole): RoleViewConfig {
  return ROLE_CONFIG[role] || ROLE_CONFIG.paciente
}

// Helper para verificar si un rol puede realizar una acción
export function canPerformAction(
  role: UserRole,
  module: keyof RoleViewConfig['modules'],
  action: string
): boolean {
  const config = getRoleConfig(role)
  const moduleConfig = config.modules[module]

  if (!moduleConfig) return false

  return (moduleConfig as any)[action] === true
}

// Helper para obtener navegación filtrada por permisos
export function getNavigationForRole(role: UserRole) {
  const config = getRoleConfig(role)
  return config.navigation.filter(item => item.visible)
}

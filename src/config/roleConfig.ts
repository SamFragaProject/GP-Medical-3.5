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
  Network,
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
  Sparkles,
  Briefcase
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
    rrhh: {
      canView: boolean
      canManageEmpleados: boolean
      canManageAsistencia: boolean
      canManageVacaciones: boolean
      canManageIncidencias: boolean
      canViewOrganigrama: boolean
    }
  }
}

const SUPER_ADMIN_CONFIG: RoleViewConfig = {
  navigation: [
    // Dashboard Principal
    { title: 'Dashboard', path: '/dashboard', resource: 'dashboard', icon: LayoutDashboard, gradient: 'from-purple-500 to-pink-500', visible: true },

    // Gestión SaaS (Nivel Plataforma)
    { title: 'Empresas', path: '/empresas', resource: 'empresas', icon: Building2, gradient: 'from-blue-500 to-cyan-500', visible: true },
    { title: 'Usuarios', path: '/usuarios', resource: 'usuarios', icon: Users, gradient: 'from-green-500 to-emerald-500', visible: true },

    // Gestión Clínica (Nivel Operativo)
    { title: 'Pacientes', path: '/pacientes', resource: 'pacientes', icon: Users, gradient: 'from-green-500 to-emerald-500', visible: true },
    { title: 'Agenda', path: '/agenda', resource: 'citas', icon: Calendar, gradient: 'from-purple-500 to-pink-500', visible: true },
    { title: 'Exámenes', path: '/examenes', resource: 'examenes', icon: Stethoscope, gradient: 'from-red-500 to-orange-500', visible: true },
    { title: 'Rayos X', path: '/rayos-x', resource: 'rayos_x', icon: Activity, gradient: 'from-blue-600 to-cyan-600', visible: true },

    // Administración Interna
    { title: 'RRHH', path: '/rrhh', resource: 'rrhh', icon: Briefcase, gradient: 'from-violet-500 to-purple-600', visible: true },
    { title: 'Configuración', path: '/configuracion', resource: 'configuracion', icon: Settings, gradient: 'from-gray-500 to-slate-600', visible: true },

    // Herramientas Avanzadas & IA
    { title: 'IA Asistente', path: '/ia', resource: 'ia', icon: Sparkles, gradient: 'from-violet-500 to-fuchsia-500', visible: true },
    { title: 'Webhooks/API', path: '/admin/webhooks', resource: 'sistema', icon: Network, gradient: 'from-slate-700 to-slate-900', visible: true },
    // { title: 'Tienda', path: '/tienda', resource: 'tienda', icon: Package, gradient: 'from-orange-500 to-red-500', visible: false },
    // { title: 'Alertas', path: '/alertas', resource: 'alertas', icon: AlertCircle, gradient: 'from-red-600 to-rose-600', visible: false },
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
    alertas: { canView: true, canManage: true, canReceive: true },
    rrhh: { canView: true, canManageEmpleados: true, canManageAsistencia: true, canManageVacaciones: true, canManageIncidencias: true, canViewOrganigrama: true }
  }
}

const ADMIN_EMPRESA_CONFIG: RoleViewConfig = {
  navigation: [
    { title: 'Dashboard', path: '/dashboard', resource: 'dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-cyan-500', visible: true },
    { title: 'Pacientes', path: '/pacientes', resource: 'pacientes', icon: Users, gradient: 'from-green-500 to-emerald-500', visible: true },
    { title: 'Agenda', path: '/agenda', resource: 'citas', icon: Calendar, gradient: 'from-purple-500 to-pink-500', visible: true },
    { title: 'Exámenes', path: '/examenes', resource: 'examenes', icon: Stethoscope, gradient: 'from-red-500 to-orange-500', visible: true },
    { title: 'Programa Salud', path: '/medicina/programa-anual', resource: 'examenes', icon: Activity, gradient: 'from-pink-500 to-rose-500', visible: true },
    // Módulos ERP Pro - Normatividad
    { title: 'Dictámenes', path: '/medicina/dictamenes', resource: 'dictamenes', icon: FileText, gradient: 'from-emerald-500 to-teal-500', visible: true },
    { title: 'NOM-011', path: '/nom-011/programa', resource: 'nom011', icon: Activity, gradient: 'from-amber-500 to-orange-500', visible: true },
    { title: 'NOM-036', path: '/nom-036/evaluacion/reba', resource: 'nom036', icon: ClipboardCheck, gradient: 'from-rose-500 to-pink-500', visible: true },
    { title: 'Episodios', path: '/episodios', resource: 'episodios', icon: ClipboardList, gradient: 'from-cyan-500 to-blue-600', visible: true },
    // Administración
    { title: 'Personal Médico', path: '/medicos', resource: 'usuarios', icon: UserCheck, gradient: 'from-teal-500 to-cyan-500', visible: true },
    { title: 'Sedes', path: '/sedes', resource: 'sedes', icon: Building2, gradient: 'from-indigo-500 to-blue-500', visible: true },
    { title: 'Facturación', path: '/facturacion', resource: 'facturacion', icon: CreditCard, gradient: 'from-yellow-500 to-amber-500', visible: true },
    { title: 'Inventario', path: '/inventario', resource: 'inventario', icon: Package, gradient: 'from-lime-500 to-green-500', visible: true },
    { title: 'RRHH', path: '/rrhh', resource: 'rrhh', icon: Briefcase, gradient: 'from-violet-500 to-purple-600', visible: true },
    { title: 'Reportes', path: '/reportes', resource: 'reportes', icon: BarChart3, gradient: 'from-violet-500 to-purple-500', visible: true },
    { title: 'Configuración', path: '/configuracion', resource: 'configuracion', icon: Settings, gradient: 'from-gray-500 to-slate-600', visible: true },
    // Herramientas
    { title: 'IA Asistente', path: '/ia', resource: 'ia', icon: Sparkles, gradient: 'from-violet-500 to-fuchsia-500', visible: true },
    { title: 'Rayos X', path: '/rayos-x', resource: 'rayos_x', icon: Activity, gradient: 'from-blue-600 to-cyan-600', visible: true },
    { title: 'Alertas', path: '/alertas', resource: 'alertas', icon: AlertCircle, gradient: 'from-red-600 to-rose-600', visible: true }
  ],
  dashboard: {
    showKPIs: true,
    showCharts: true,
    showRecentActivity: true,
    showAlerts: true,
    customWidgets: ['pacientes', 'citas', 'facturacion', 'personal', 'dictamenes', 'episodios']
  },
  actions: {
    // Admin Empresa = Médico propietario con permisos administrativos completos
    canCreate: ['pacientes', 'citas', 'examenes', 'usuarios', 'sedes', 'facturacion', 'inventario', 'recetas', 'dictamenes', 'certificaciones', 'evaluaciones', 'audiometrias', 'ergonomia'],
    canRead: ['*'],
    canUpdate: ['pacientes', 'citas', 'examenes', 'usuarios', 'sedes', 'facturacion', 'inventario', 'configuracion', 'recetas', 'dictamenes'],
    canDelete: ['pacientes', 'citas', 'examenes', 'usuarios', 'sedes', 'inventario'],
    canExport: ['pacientes', 'citas', 'examenes', 'reportes', 'facturacion', 'dictamenes', 'nom011', 'nom036'],
    canImport: ['pacientes', 'usuarios', 'audiometrias']
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
    // Admin Empresa PUEDE crear recetas (es médico propietario)
    recetas: { canCreate: true, canView: true, canEdit: true, canPrint: true, canDigitalSign: true },
    historial: { canViewFull: true, canViewOwn: true, canAddNotes: true, canEdit: true },
    facturacion: { canView: true, canCreate: true, canEdit: true, canApprove: true },
    inventario: { canView: true, canManage: true, canOrder: true },
    reportes: { canView: true, canGenerate: true, canExport: true },
    ia: { canAccess: true, canUseAssistant: true },
    tienda: { canView: true, canPurchase: true, canManageProducts: true },
    rayos_x: { canView: true, canUpload: true, canAnnotate: true },
    alertas: { canView: true, canManage: true, canReceive: true },
    rrhh: { canView: true, canManageEmpleados: true, canManageAsistencia: true, canManageVacaciones: true, canManageIncidencias: true, canViewOrganigrama: true }
  }
}

const MEDICO_CONFIG: RoleViewConfig = {
  navigation: [
    { title: 'Mi Dashboard', path: '/dashboard', resource: 'dashboard', icon: LayoutDashboard, gradient: 'from-green-500 to-emerald-500', visible: true },
    { title: 'Mis Pacientes', path: '/pacientes', resource: 'pacientes', icon: Users, gradient: 'from-blue-500 to-cyan-500', visible: true },
    { title: 'Mi Agenda', path: '/agenda', resource: 'citas', icon: Calendar, gradient: 'from-purple-500 to-pink-500', visible: true },
    { title: 'Programa Salud', path: '/medicina/programa-anual', resource: 'examenes', icon: Activity, gradient: 'from-pink-500 to-rose-500', visible: true },
    { title: 'Exámenes', path: '/examenes', resource: 'examenes', icon: Microscope, gradient: 'from-red-500 to-orange-500', visible: true },
    // Módulos ERP Pro - Normatividad
    { title: 'Dictámenes', path: '/medicina/dictamenes', resource: 'dictamenes', icon: FileText, gradient: 'from-emerald-500 to-teal-500', visible: true },
    { title: 'NOM-011', path: '/nom-011/programa', resource: 'nom011', icon: Activity, gradient: 'from-amber-500 to-orange-500', visible: true },
    { title: 'NOM-036', path: '/nom-036/evaluacion/reba', resource: 'nom036', icon: ClipboardCheck, gradient: 'from-rose-500 to-pink-500', visible: true },
    { title: 'Episodios', path: '/episodios', resource: 'episodios', icon: ClipboardList, gradient: 'from-cyan-500 to-blue-600', visible: true },
    // Otras funciones médicas
    { title: 'Evaluaciones', path: '/evaluaciones', resource: 'evaluaciones', icon: ClipboardCheck, gradient: 'from-teal-500 to-cyan-500', visible: true },
    { title: 'Certificaciones', path: '/certificaciones', resource: 'certificaciones', icon: FileText, gradient: 'from-indigo-500 to-blue-500', visible: true },
    { title: 'Mis Reportes', path: '/reportes', resource: 'reportes', icon: Activity, gradient: 'from-violet-500 to-purple-500', visible: true },
    // Herramientas
    { title: 'IA Asistente', path: '/ia', resource: 'ia', icon: Sparkles, gradient: 'from-violet-500 to-fuchsia-500', visible: true },
    { title: 'Rayos X', path: '/rayos-x', resource: 'rayos_x', icon: Activity, gradient: 'from-blue-600 to-cyan-600', visible: true },
    { title: 'Alertas', path: '/alertas', resource: 'alertas', icon: AlertCircle, gradient: 'from-red-600 to-rose-600', visible: true }
  ],
  dashboard: {
    showKPIs: true,
    showCharts: true,
    showRecentActivity: true,
    showAlerts: true,
    customWidgets: ['mis_citas', 'mis_pacientes', 'pendientes', 'dictamenes']
  },
  actions: {
    canCreate: ['citas', 'examenes', 'recetas', 'certificaciones', 'evaluaciones', 'dictamenes', 'audiometrias', 'ergonomia'],
    canRead: ['pacientes', 'citas', 'examenes', 'historial', 'reportes', 'dictamenes', 'nom011', 'nom036'],
    canUpdate: ['citas', 'examenes', 'recetas', 'certificaciones', 'evaluaciones', 'dictamenes'],
    canDelete: ['citas'],
    canExport: ['reportes', 'certificaciones', 'dictamenes', 'nom011', 'nom036'],
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
    pacientes: { canViewAll: true, canViewOwn: true, canEdit: true, canDelete: false, canExport: true, showAdvancedFilters: true },
    citas: { canViewAll: true, canViewOwn: true, canCreate: true, canEdit: true, canCancel: true, canReschedule: true },
    examenes: { canViewAll: true, canViewOwn: true, canCreate: true, canEdit: true, canCertify: true },
    recetas: { canCreate: true, canView: true, canEdit: true, canPrint: true, canDigitalSign: true },
    historial: { canViewFull: true, canViewOwn: true, canAddNotes: true, canEdit: true },
    facturacion: { canView: false, canCreate: false, canEdit: false, canApprove: false },
    inventario: { canView: true, canManage: false, canOrder: false },
    reportes: { canView: true, canGenerate: true, canExport: true },
    ia: { canAccess: true, canUseAssistant: true },
    tienda: { canView: true, canPurchase: true, canManageProducts: false },
    rayos_x: { canView: true, canUpload: true, canAnnotate: true },
    alertas: { canView: true, canManage: true, canReceive: true },
    rrhh: { canView: false, canManageEmpleados: false, canManageAsistencia: false, canManageVacaciones: false, canManageIncidencias: false, canViewOrganigrama: false }
  }
}

const PACIENTE_CONFIG: RoleViewConfig = {
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
    alertas: { canView: true, canManage: false, canReceive: true },
    rrhh: { canView: false, canManageEmpleados: false, canManageAsistencia: false, canManageVacaciones: false, canManageIncidencias: false, canViewOrganigrama: false }
  }
}

const ENFERMERA_CONFIG: RoleViewConfig = {
  navigation: [
    { title: 'Mi Dashboard', path: '/dashboard', resource: 'dashboard', icon: LayoutDashboard, gradient: 'from-pink-500 to-rose-500', visible: true },
    { title: 'Pacientes', path: '/pacientes', resource: 'pacientes', icon: Users, gradient: 'from-blue-500 to-cyan-500', visible: true },
    { title: 'Agenda', path: '/agenda', resource: 'citas', icon: Calendar, gradient: 'from-purple-500 to-pink-500', visible: true },
    { title: 'Signos Vitales', path: '/examenes', resource: 'examenes', icon: Heart, gradient: 'from-red-500 to-pink-500', visible: true },
    { title: 'Alertas', path: '/alertas', resource: 'alertas', icon: AlertCircle, gradient: 'from-red-600 to-rose-600', visible: true }
  ],
  dashboard: {
    showKPIs: true,
    showCharts: false,
    showRecentActivity: true,
    showAlerts: true,
    customWidgets: ['pacientes_hoy', 'signos_pendientes', 'alertas']
  },
  actions: {
    canCreate: ['signos_vitales'],
    canRead: ['pacientes', 'citas', 'signos_vitales'],
    canUpdate: ['signos_vitales'],
    canDelete: [],
    canExport: [],
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
    pacientes: { canViewAll: true, canViewOwn: false, canEdit: false, canDelete: false, canExport: false, showAdvancedFilters: false },
    citas: { canViewAll: true, canViewOwn: false, canCreate: false, canEdit: false, canCancel: false, canReschedule: false },
    examenes: { canViewAll: false, canViewOwn: false, canCreate: false, canEdit: false, canCertify: false },
    recetas: { canCreate: false, canView: false, canEdit: false, canPrint: false, canDigitalSign: false },
    historial: { canViewFull: false, canViewOwn: false, canAddNotes: true, canEdit: false },
    facturacion: { canView: false, canCreate: false, canEdit: false, canApprove: false },
    inventario: { canView: true, canManage: false, canOrder: false },
    reportes: { canView: false, canGenerate: false, canExport: false },
    ia: { canAccess: false, canUseAssistant: false },
    tienda: { canView: false, canPurchase: false, canManageProducts: false },
    rayos_x: { canView: false, canUpload: false, canAnnotate: false },
    alertas: { canView: true, canManage: false, canReceive: true },
    rrhh: { canView: false, canManageEmpleados: false, canManageAsistencia: false, canManageVacaciones: false, canManageIncidencias: false, canViewOrganigrama: false }
  }
}

const RECEPCION_CONFIG: RoleViewConfig = {
  navigation: [
    { title: 'Dashboard', path: '/dashboard', resource: 'dashboard', icon: LayoutDashboard, gradient: 'from-cyan-500 to-blue-500', visible: true },
    { title: 'Pacientes', path: '/pacientes', resource: 'pacientes', icon: Users, gradient: 'from-green-500 to-emerald-500', visible: true },
    { title: 'Agenda', path: '/agenda', resource: 'citas', icon: Calendar, gradient: 'from-purple-500 to-pink-500', visible: true },
    { title: 'Nueva Cita', path: '/agenda/nueva', resource: 'citas', icon: Plus, gradient: 'from-blue-500 to-cyan-500', visible: true },
    { title: 'Facturación', path: '/facturacion', resource: 'facturacion', icon: CreditCard, gradient: 'from-yellow-500 to-amber-500', visible: true }
  ],
  dashboard: {
    showKPIs: true,
    showCharts: false,
    showRecentActivity: true,
    showAlerts: true,
    customWidgets: ['citas_hoy', 'pacientes_espera', 'proximas_citas']
  },
  actions: {
    canCreate: ['pacientes', 'citas'],
    canRead: ['pacientes', 'citas', 'facturacion'],
    canUpdate: ['pacientes', 'citas'],
    canDelete: ['citas'],
    canExport: [],
    canImport: ['pacientes']
  },
  settings: {
    canViewGeneral: true,
    canViewSecurity: false,
    canViewBilling: true,
    canViewIntegrations: false,
    canViewNotifications: true,
    canViewBackup: false
  },
  modules: {
    pacientes: { canViewAll: true, canViewOwn: false, canEdit: true, canDelete: false, canExport: false, showAdvancedFilters: false },
    citas: { canViewAll: true, canViewOwn: false, canCreate: true, canEdit: true, canCancel: true, canReschedule: true },
    examenes: { canViewAll: false, canViewOwn: false, canCreate: false, canEdit: false, canCertify: false },
    recetas: { canCreate: false, canView: false, canEdit: false, canPrint: false, canDigitalSign: false },
    historial: { canViewFull: false, canViewOwn: false, canAddNotes: false, canEdit: false },
    facturacion: { canView: true, canCreate: true, canEdit: false, canApprove: false },
    inventario: { canView: false, canManage: false, canOrder: false },
    reportes: { canView: false, canGenerate: false, canExport: false },
    ia: { canAccess: false, canUseAssistant: false },
    tienda: { canView: false, canPurchase: false, canManageProducts: false },
    rayos_x: { canView: false, canUpload: false, canAnnotate: false },
    alertas: { canView: true, canManage: false, canReceive: true },
    rrhh: { canView: false, canManageEmpleados: false, canManageAsistencia: false, canManageVacaciones: false, canManageIncidencias: false, canViewOrganigrama: false }
  }
}

// Configuración para Admin SaaS (socio) - igual que super pero sin config técnica
const ADMIN_SAAS_CONFIG: RoleViewConfig = {
  ...SUPER_ADMIN_CONFIG,
  navigation: SUPER_ADMIN_CONFIG.navigation.filter(n => n.resource !== 'sistema'),
  settings: {
    ...SUPER_ADMIN_CONFIG.settings,
    canViewBackup: false
  }
}

// Configuración para Contador SaaS - solo finanzas
const CONTADOR_SAAS_CONFIG: RoleViewConfig = {
  navigation: [
    { title: 'Dashboard', path: '/dashboard', resource: 'dashboard', icon: LayoutDashboard, gradient: 'from-indigo-500 to-purple-500', visible: true },
    { title: 'Empresas', path: '/empresas', resource: 'empresas', icon: Building2, gradient: 'from-blue-500 to-cyan-500', visible: true },
    { title: 'Facturación', path: '/facturacion', resource: 'facturacion', icon: CreditCard, gradient: 'from-yellow-500 to-amber-500', visible: true },
    { title: 'Reportes', path: '/reportes', resource: 'reportes', icon: BarChart3, gradient: 'from-violet-500 to-purple-500', visible: true }
  ],
  dashboard: {
    showKPIs: true,
    showCharts: true,
    showRecentActivity: false,
    showAlerts: false,
    customWidgets: ['facturacion', 'empresas']
  },
  actions: {
    canCreate: ['facturacion'],
    canRead: ['empresas', 'facturacion', 'reportes', 'analytics'],
    canUpdate: ['facturacion'],
    canDelete: [],
    canExport: ['facturacion', 'reportes'],
    canImport: []
  },
  settings: {
    canViewGeneral: false,
    canViewSecurity: false,
    canViewBilling: true,
    canViewIntegrations: false,
    canViewNotifications: true,
    canViewBackup: false
  },
  modules: {
    pacientes: { canViewAll: false, canViewOwn: false, canEdit: false, canDelete: false, canExport: false, showAdvancedFilters: false },
    citas: { canViewAll: false, canViewOwn: false, canCreate: false, canEdit: false, canCancel: false, canReschedule: false },
    examenes: { canViewAll: false, canViewOwn: false, canCreate: false, canEdit: false, canCertify: false },
    recetas: { canCreate: false, canView: false, canEdit: false, canPrint: false, canDigitalSign: false },
    historial: { canViewFull: false, canViewOwn: false, canAddNotes: false, canEdit: false },
    facturacion: { canView: true, canCreate: true, canEdit: true, canApprove: true },
    inventario: { canView: false, canManage: false, canOrder: false },
    reportes: { canView: true, canGenerate: true, canExport: true },
    ia: { canAccess: false, canUseAssistant: false },
    tienda: { canView: false, canPurchase: false, canManageProducts: false },
    rayos_x: { canView: false, canUpload: false, canAnnotate: false },
    alertas: { canView: false, canManage: false, canReceive: false },
    rrhh: { canView: false, canManageEmpleados: false, canManageAsistencia: false, canManageVacaciones: false, canManageIncidencias: false, canViewOrganigrama: false }
  }
}

// Configuración para Asistente
const ASISTENTE_CONFIG: RoleViewConfig = {
  navigation: [
    { title: 'Dashboard', path: '/dashboard', resource: 'dashboard', icon: LayoutDashboard, gradient: 'from-teal-500 to-cyan-500', visible: true },
    { title: 'Pacientes', path: '/pacientes', resource: 'pacientes', icon: Users, gradient: 'from-green-500 to-emerald-500', visible: true },
    { title: 'Agenda', path: '/agenda', resource: 'citas', icon: Calendar, gradient: 'from-purple-500 to-pink-500', visible: true },
    { title: 'Reportes', path: '/reportes', resource: 'reportes', icon: BarChart3, gradient: 'from-violet-500 to-purple-500', visible: true }
  ],
  dashboard: {
    showKPIs: false,
    showCharts: false,
    showRecentActivity: true,
    showAlerts: true,
    customWidgets: ['citas_hoy', 'pendientes']
  },
  actions: {
    canCreate: [],
    canRead: ['pacientes', 'citas', 'reportes'],
    canUpdate: ['citas'],
    canDelete: [],
    canExport: [],
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
    pacientes: { canViewAll: true, canViewOwn: false, canEdit: false, canDelete: false, canExport: false, showAdvancedFilters: false },
    citas: { canViewAll: true, canViewOwn: false, canCreate: false, canEdit: true, canCancel: false, canReschedule: false },
    examenes: { canViewAll: false, canViewOwn: false, canCreate: false, canEdit: false, canCertify: false },
    recetas: { canCreate: false, canView: false, canEdit: false, canPrint: false, canDigitalSign: false },
    historial: { canViewFull: false, canViewOwn: false, canAddNotes: false, canEdit: false },
    facturacion: { canView: false, canCreate: false, canEdit: false, canApprove: false },
    inventario: { canView: false, canManage: false, canOrder: false },
    reportes: { canView: true, canGenerate: false, canExport: false },
    ia: { canAccess: false, canUseAssistant: false },
    tienda: { canView: false, canPurchase: false, canManageProducts: false },
    rayos_x: { canView: false, canUpload: false, canAnnotate: false },
    alertas: { canView: true, canManage: false, canReceive: true },
    rrhh: { canView: false, canManageEmpleados: false, canManageAsistencia: false, canManageVacaciones: false, canManageIncidencias: false, canViewOrganigrama: false }
  }
}

// Mapeo de roles a configuraciones - SaaS Multi-Tenant
export const ROLE_CONFIG: Record<UserRole, RoleViewConfig> = {
  // Nivel Plataforma
  super_admin: SUPER_ADMIN_CONFIG,
  admin_saas: ADMIN_SAAS_CONFIG,
  contador_saas: CONTADOR_SAAS_CONFIG,
  // Nivel Empresa
  admin_empresa: ADMIN_EMPRESA_CONFIG,
  medico: MEDICO_CONFIG,
  enfermera: ENFERMERA_CONFIG,
  recepcion: RECEPCION_CONFIG,
  asistente: ASISTENTE_CONFIG,
  paciente: PACIENTE_CONFIG
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

// Helper para obtener navegación de rol
export function getNavigationForRole(role: UserRole) {
  return getRoleConfig(role).navigation
}

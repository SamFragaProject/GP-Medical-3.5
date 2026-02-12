// Menú personalizado dinámico - Sidebar ERP Pro con secciones colapsables
// Organizado por los 13 pilares del ERP SaaS Médico
import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Calendar,
  Users,
  FileText,
  Activity,
  BarChart3,
  Settings,
  Building,
  Shield,
  Bell,
  Database,
  CreditCard,
  Crown,
  UserCog,
  Lock,
  CheckCircle,
  HelpCircle,
  Plus,
  Stethoscope,
  TestTube,
  ShoppingCart,
  ChevronRight,
  ChevronDown,
  MapPin,
  Building2,
  AlertTriangle,
  User,
  LogOut,
  RefreshCw,
  Brain,
  LayoutDashboard,
  Heart,
  Sparkles,
  Microscope,
  Pill,
  ClipboardCheck,
  Briefcase,
  Eye,
  History,
  FileDigit,
  Receipt,
  Search,
  Dumbbell,
  Armchair,
  ShieldAlert,
  CalendarRange,
  FileBarChart2,
  Wind,
  DollarSign,
  ClipboardList,
  LucideIcon
} from 'lucide-react'

import { NavigationItem } from '@/types/saas'
import { UserRole } from '@/types/auth'
import { useAuth } from '@/contexts/AuthContext'
import { useMenuModulos } from '@/hooks/usePermisosDinamicos'
import { PermisoModulo } from '@/services/permisosService'

// ════════════════════════════════════════════════════════
// DEFINICIÓN DE SECCIONES DEL SIDEBAR
// Agrupación por los 13 pilares del ERP
// ════════════════════════════════════════════════════════
interface SidebarSection {
  key: string
  label: string
  icon: LucideIcon
  color: string // tailwind color name
  modules: string[] // modulo_codigo values
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    key: 'medicina',
    label: 'Medicina',
    icon: Stethoscope,
    color: 'emerald',
    modules: ['pacientes', 'estudios_medicos', 'prescripcion', 'incapacidades', 'dictamenes']
  },
  {
    key: 'diagnostico',
    label: 'Diagnóstico',
    icon: Microscope,
    color: 'cyan',
    modules: ['rayos_x', 'espirometria', 'vision', 'resultados']
  },
  {
    key: 'operaciones',
    label: 'Operaciones',
    icon: ClipboardList,
    color: 'purple',
    modules: ['episodios', 'campanias', 'agenda', 'citas', 'alertas']
  },
  {
    key: 'finanzas',
    label: 'Finanzas',
    icon: Receipt,
    color: 'blue',
    modules: ['facturacion', 'cotizaciones', 'cxc', 'inventario', 'tienda']
  },
  {
    key: 'cumplimiento',
    label: 'Cumplimiento',
    icon: Shield,
    color: 'amber',
    modules: ['normatividad', 'nom011', 'evaluaciones', 'matriz_riesgos', 'programa_anual', 'certificaciones']
  },
  {
    key: 'analisis',
    label: 'Análisis',
    icon: BarChart3,
    color: 'violet',
    modules: ['reportes', 'ia', 'rrhh']
  }
]

const ADMIN_SECTION: SidebarSection = {
  key: 'admin',
  label: 'Administración',
  icon: Settings,
  color: 'slate',
  modules: ['empresas', 'usuarios', 'roles_permisos', 'sedes', 'medicos', 'configuracion', 'sistema']
}

// ════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════

interface MenuPersonalizadoProps {
  className?: string
}

export function MenuPersonalizado({ className = '' }: MenuPersonalizadoProps) {
  const location = useLocation()
  const { user: authUser, logout } = useAuth()
  const { modulos: modulosDinamicos, loading: menuLoading } = useMenuModulos()

  // Usar usuario del AuthContext o fallback demo
  const user = authUser ? {
    id: authUser.id,
    email: authUser.email,
    hierarchy: authUser.rol as UserRole,
    name: authUser.nombre || 'Usuario',
    avatar: authUser.avatar_url
  } : {
    id: 'demo-user',
    email: 'demo@GPMedical.com',
    hierarchy: 'super_admin' as UserRole,
    name: 'Dr. Admin',
    avatar: null
  }

  // ── Estado de secciones colapsadas ──
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('gpm_sidebar_collapsed')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const toggleSection = useCallback((key: string) => {
    setCollapsed(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem('gpm_sidebar_collapsed', JSON.stringify(next)) } catch { }
      return next
    })
  }, [])

  // ── Mapeo de íconos ──
  const getIcon = (iconName: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      // Principales
      LayoutDashboard,
      Home: LayoutDashboard,
      Users,
      Calendar,
      Activity,
      CalendarDays: Calendar,
      // Médicos
      Stethoscope,
      Microscope,
      TestTube: Microscope,
      Heart,
      Brain,
      Sparkles,
      Pill,
      ClipboardCheck,
      History,
      FileDigit,
      Award: Shield,
      Bone: Activity,
      AlertTriangle,
      Scale: Shield,
      ShoppingBag: ShoppingCart,
      CalendarRange,
      FileBarChart2,
      ShieldAlert: AlertTriangle,
      FileCheck: ClipboardCheck,
      Wind,
      Eye,
      DollarSign,
      ClipboardList,
      // Administrativos
      Receipt,
      CreditCard,
      ShoppingCart,
      Package: ShoppingCart,
      Building,
      Building2,
      UserCog,
      Settings,
      Shield,
      Database,
      BarChart3,
      TrendingUp: BarChart3,
      Briefcase,
      Server: Database,
      FileBarChart: BarChart3,
      Users2: Users,
      MapPin,
      Bell,
      // Otros
      Search,
      Lock,
      HelpCircle,
      User
    }
    return iconMap[iconName] || FileText
  }

  // ── Lógica de ruta activa (best-match, previene doble selección) ──
  const allModuleRoutes = useMemo(() => {
    return modulosDinamicos.map(m => m.modulo_ruta || `/${m.modulo_codigo}`)
  }, [modulosDinamicos])

  const bestMatchRoute = useMemo(() => {
    const pathname = location.pathname
    let best: string | null = null
    let bestLen = 0
    for (const route of allModuleRoutes) {
      if (pathname === route || pathname.startsWith(route + '/')) {
        if (route.length > bestLen) {
          best = route
          bestLen = route.length
        }
      }
    }
    return best
  }, [location.pathname, allModuleRoutes])

  const isItemActive = (href: string) => href === bestMatchRoute

  // ── Color por módulo (gradiente → tailwind classes) ──
  const getModuleColor = (gradiente: string | undefined) => {
    if (!gradiente) return { activeBg: 'bg-emerald-500/10', activeText: 'text-emerald-400', activeBorder: 'border-emerald-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' }
    const match = gradiente.match(/from-(\w+)-/)
    const color = match?.[1] || 'emerald'
    const map: Record<string, { activeBg: string; activeText: string; activeBorder: string; iconGlow: string }> = {
      emerald: { activeBg: 'bg-emerald-500/10', activeText: 'text-emerald-400', activeBorder: 'border-emerald-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' },
      teal: { activeBg: 'bg-teal-500/10', activeText: 'text-teal-400', activeBorder: 'border-teal-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]' },
      blue: { activeBg: 'bg-blue-500/10', activeText: 'text-blue-400', activeBorder: 'border-blue-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]' },
      purple: { activeBg: 'bg-purple-500/10', activeText: 'text-purple-400', activeBorder: 'border-purple-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]' },
      violet: { activeBg: 'bg-violet-500/10', activeText: 'text-violet-400', activeBorder: 'border-violet-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]' },
      pink: { activeBg: 'bg-pink-500/10', activeText: 'text-pink-400', activeBorder: 'border-pink-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]' },
      rose: { activeBg: 'bg-rose-500/10', activeText: 'text-rose-400', activeBorder: 'border-rose-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]' },
      red: { activeBg: 'bg-red-500/10', activeText: 'text-red-400', activeBorder: 'border-red-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' },
      orange: { activeBg: 'bg-orange-500/10', activeText: 'text-orange-400', activeBorder: 'border-orange-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]' },
      amber: { activeBg: 'bg-amber-500/10', activeText: 'text-amber-400', activeBorder: 'border-amber-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' },
      yellow: { activeBg: 'bg-yellow-500/10', activeText: 'text-yellow-400', activeBorder: 'border-yellow-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]' },
      green: { activeBg: 'bg-green-500/10', activeText: 'text-green-400', activeBorder: 'border-green-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]' },
      cyan: { activeBg: 'bg-cyan-500/10', activeText: 'text-cyan-400', activeBorder: 'border-cyan-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' },
      indigo: { activeBg: 'bg-indigo-500/10', activeText: 'text-indigo-400', activeBorder: 'border-indigo-500', iconGlow: 'drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]' },
      slate: { activeBg: 'bg-slate-500/10', activeText: 'text-slate-300', activeBorder: 'border-slate-400', iconGlow: 'drop-shadow-[0_0_5px_rgba(148,163,184,0.4)]' },
      gray: { activeBg: 'bg-gray-500/10', activeText: 'text-gray-300', activeBorder: 'border-gray-400', iconGlow: 'drop-shadow-[0_0_5px_rgba(156,163,175,0.4)]' },
    }
    return map[color] || map.emerald
  }

  // ── Color del indicador de sección ──
  const getSectionColor = (color: string) => {
    const map: Record<string, { dot: string; text: string; hoverBg: string; activeBg: string; count: string }> = {
      emerald: { dot: 'bg-emerald-400', text: 'text-emerald-400', hoverBg: 'hover:bg-emerald-500/5', activeBg: 'bg-emerald-500/10', count: 'bg-emerald-500/20 text-emerald-400' },
      cyan: { dot: 'bg-cyan-400', text: 'text-cyan-400', hoverBg: 'hover:bg-cyan-500/5', activeBg: 'bg-cyan-500/10', count: 'bg-cyan-500/20 text-cyan-400' },
      purple: { dot: 'bg-purple-400', text: 'text-purple-400', hoverBg: 'hover:bg-purple-500/5', activeBg: 'bg-purple-500/10', count: 'bg-purple-500/20 text-purple-400' },
      blue: { dot: 'bg-blue-400', text: 'text-blue-400', hoverBg: 'hover:bg-blue-500/5', activeBg: 'bg-blue-500/10', count: 'bg-blue-500/20 text-blue-400' },
      amber: { dot: 'bg-amber-400', text: 'text-amber-400', hoverBg: 'hover:bg-amber-500/5', activeBg: 'bg-amber-500/10', count: 'bg-amber-500/20 text-amber-400' },
      violet: { dot: 'bg-violet-400', text: 'text-violet-400', hoverBg: 'hover:bg-violet-500/5', activeBg: 'bg-violet-500/10', count: 'bg-violet-500/20 text-violet-400' },
      slate: { dot: 'bg-slate-400', text: 'text-slate-400', hoverBg: 'hover:bg-slate-500/5', activeBg: 'bg-slate-500/10', count: 'bg-slate-500/20 text-slate-400' },
    }
    return map[color] || map.emerald
  }

  // ── Indexar módulos dinámicos por código ──
  const modulesByCode = useMemo(() => {
    const map: Record<string, PermisoModulo> = {}
    for (const m of modulosDinamicos) {
      map[m.modulo_codigo] = m
    }
    return map
  }, [modulosDinamicos])

  // ── Determinar si una sección tiene un hijo activo ──
  const sectionHasActive = useCallback((section: SidebarSection) => {
    return section.modules.some(code => {
      const m = modulesByCode[code]
      if (!m) return false
      const href = m.modulo_ruta || `/${m.modulo_codigo}`
      return isItemActive(href)
    })
  }, [modulesByCode, isItemActive])

  // ── Auto-expandir la sección activa ──
  useEffect(() => {
    const allSections = [...SIDEBAR_SECTIONS, ADMIN_SECTION]
    for (const section of allSections) {
      if (sectionHasActive(section) && collapsed[section.key]) {
        setCollapsed(prev => {
          const next = { ...prev, [section.key]: false }
          try { localStorage.setItem('gpm_sidebar_collapsed', JSON.stringify(next)) } catch { }
          return next
        })
      }
    }
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dashboard module ──
  const dashboardModule = modulesByCode['dashboard']

  // ── Filtrar secciones con módulos disponibles ──
  const activeSections = useMemo(() => {
    return SIDEBAR_SECTIONS.map(section => {
      const modules = section.modules
        .map(code => modulesByCode[code])
        .filter(Boolean) as PermisoModulo[]
      return { ...section, availableModules: modules }
    }).filter(s => s.availableModules.length > 0)
  }, [modulesByCode])

  const adminSection = useMemo(() => {
    const modules = ADMIN_SECTION.modules
      .map(code => modulesByCode[code])
      .filter(Boolean) as PermisoModulo[]
    return { ...ADMIN_SECTION, availableModules: modules }
  }, [modulesByCode])

  // ── Avatar Component ──
  const UserAvatar = () => (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs border-2 border-emerald-300/20 shadow-lg shadow-emerald-500/10 overflow-hidden">
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <span>{user.name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  )

  // ── Render de un módulo individual ──
  const renderModuleItem = (item: PermisoModulo) => {
    const href = item.modulo_ruta || `/${item.modulo_codigo}`
    const isActive = isItemActive(href)
    const Icon = getIcon(item.modulo_icono)
    const colors = getModuleColor(item.modulo_gradiente)

    return (
      <Link to={href} key={item.modulo_codigo} className="block">
        <div className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
            ? `${colors.activeBg} ${colors.activeText} border-l-[3px] ${colors.activeBorder} shadow-sm`
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border-l-[3px] border-transparent'
          }`}>
          <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive
              ? `${colors.activeText} ${colors.iconGlow}`
              : 'text-slate-500 group-hover:text-slate-300'
            }`} />
          <span className={`text-[13px] font-medium truncate ${isActive ? 'font-semibold' : ''}`}>
            {item.modulo_nombre}
          </span>
        </div>
      </Link>
    )
  }

  // ── Render de una sección colapsable ──
  const renderSection = (section: SidebarSection & { availableModules: PermisoModulo[] }, isAdminSection = false) => {
    const isCollapsed = collapsed[section.key] ?? false
    const hasActive = sectionHasActive(section)
    const SectionIcon = section.icon
    const sColors = getSectionColor(section.color)

    return (
      <div key={section.key} className={`${isAdminSection ? 'mt-4 pt-4 border-t border-white/[0.04]' : ''}`}>
        {/* Section Header */}
        <button
          onClick={() => toggleSection(section.key)}
          className={`w-full group flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 ${sColors.hoverBg} ${hasActive ? sColors.activeBg : ''}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${hasActive ? sColors.dot : 'bg-slate-600'} transition-colors`} />
          <SectionIcon className={`w-3.5 h-3.5 ${hasActive ? sColors.text : 'text-slate-500 group-hover:text-slate-400'} transition-colors`} />
          <span className={`flex-1 text-left text-[11px] font-bold uppercase tracking-[0.15em] ${hasActive ? sColors.text : 'text-slate-500 group-hover:text-slate-400'
            } transition-colors`}>
            {section.label}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${sColors.count}`}>
            {section.availableModules.length}
          </span>
          <ChevronRight className={`w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-all duration-200 ${isCollapsed ? '' : 'rotate-90'
            }`} />
        </button>

        {/* Section Items (animated collapse) */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100'
            }`}
        >
          <div className="ml-3 mt-1 space-y-0.5 border-l border-white/[0.04] pl-2">
            {section.availableModules.map(renderModuleItem)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-transparent px-4 pb-4 ${className}`}>
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-3 space-y-1">

        {/* Dashboard (siempre visible y destacado) */}
        {dashboardModule && (
          <Link to="/dashboard" className="block mb-3">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isItemActive('/dashboard')
                ? 'bg-emerald-500/10 text-emerald-400 border-l-[3px] border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
              }`}>
              <LayoutDashboard className={`w-5 h-5 ${isItemActive('/dashboard')
                  ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]'
                  : ''
                }`} />
              <span className={`text-sm font-bold tracking-tight ${isItemActive('/dashboard') ? 'neon-text-light' : ''
                }`}>Dashboard</span>
            </div>
          </Link>
        )}

        {/* Secciones operativas agrupadas */}
        <div className="space-y-1.5">
          {activeSections.map(section => renderSection(section))}
        </div>

        {/* Sección de Administración */}
        {adminSection.availableModules.length > 0 && renderSection(adminSection, true)}
      </div>

      {/* Perfil de usuario (footer) */}
      <div className="mt-auto pt-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-3 px-2">
          <UserAvatar />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-emerald-500/80 font-semibold truncate uppercase tracking-wider">
              {user.hierarchy.replace(/_/g, ' ')}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Layout simple para modo colapsado (opcional o placeholder)
export function MenuHierarchyIndicator() {
  return <div className="hidden"></div>
}

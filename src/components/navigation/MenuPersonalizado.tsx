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
    key: 'legal',
    label: 'Legal / STPS',
    icon: Shield,
    color: 'amber',
    modules: ['cumplimiento_legal', 'ley_silla', 'nom035', 'riesgos_trabajo', 'normatividad', 'nom011', 'evaluaciones', 'matriz_riesgos', 'programa_anual', 'certificaciones']
  },
  {
    key: 'analisis',
    label: 'Análisis',
    icon: BarChart3,
    color: 'violet',
    modules: ['reportes', 'ia', 'rrhh']
  },
  {
    key: 'herramientas',
    label: 'Herramientas',
    icon: Settings,
    color: 'cyan',
    modules: ['importar_exportar', 'analizador_documentos']
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
    if (!gradiente) return { activeBg: 'bg-emerald-500/15 backdrop-blur-md', activeText: 'text-emerald-400', activeBorder: 'border-emerald-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' }
    const match = gradiente.match(/from-(\w+)-/)
    const color = match?.[1] || 'emerald'
    const map: Record<string, { activeBg: string; activeText: string; activeBorder: string; iconGlow: string }> = {
      emerald: { activeBg: 'bg-emerald-500/15 backdrop-blur-md', activeText: 'text-emerald-400', activeBorder: 'border-emerald-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' },
      teal: { activeBg: 'bg-teal-500/15 backdrop-blur-md', activeText: 'text-teal-400', activeBorder: 'border-teal-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]' },
      blue: { activeBg: 'bg-blue-500/15 backdrop-blur-md', activeText: 'text-blue-400', activeBorder: 'border-blue-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' },
      purple: { activeBg: 'bg-purple-500/15 backdrop-blur-md', activeText: 'text-purple-400', activeBorder: 'border-purple-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' },
      violet: { activeBg: 'bg-violet-500/15 backdrop-blur-md', activeText: 'text-violet-400', activeBorder: 'border-violet-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' },
      pink: { activeBg: 'bg-pink-500/15 backdrop-blur-md', activeText: 'text-pink-400', activeBorder: 'border-pink-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' },
      rose: { activeBg: 'bg-rose-500/15 backdrop-blur-md', activeText: 'text-rose-400', activeBorder: 'border-rose-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' },
      red: { activeBg: 'bg-red-500/15 backdrop-blur-md', activeText: 'text-red-400', activeBorder: 'border-red-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' },
      orange: { activeBg: 'bg-orange-500/15 backdrop-blur-md', activeText: 'text-orange-400', activeBorder: 'border-orange-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' },
      amber: { activeBg: 'bg-amber-500/15 backdrop-blur-md', activeText: 'text-amber-400', activeBorder: 'border-amber-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' },
      yellow: { activeBg: 'bg-yellow-500/15 backdrop-blur-md', activeText: 'text-yellow-400', activeBorder: 'border-yellow-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]' },
      green: { activeBg: 'bg-green-500/15 backdrop-blur-md', activeText: 'text-green-400', activeBorder: 'border-green-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]' },
      cyan: { activeBg: 'bg-cyan-500/15 backdrop-blur-md', activeText: 'text-cyan-400', activeBorder: 'border-cyan-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' },
      indigo: { activeBg: 'bg-indigo-500/15 backdrop-blur-md', activeText: 'text-indigo-400', activeBorder: 'border-indigo-500', iconGlow: 'drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' },
      slate: { activeBg: 'bg-slate-500/15 backdrop-blur-md', activeText: 'text-slate-300', activeBorder: 'border-slate-400', iconGlow: 'drop-shadow-[0_0_8px_rgba(148,163,184,0.6)]' },
      gray: { activeBg: 'bg-gray-500/15 backdrop-blur-md', activeText: 'text-gray-300', activeBorder: 'border-gray-400', iconGlow: 'drop-shadow-[0_0_8px_rgba(156,163,175,0.6)]' },
    }
    return map[color] || map.emerald
  }

  // ── Color del indicador de sección ──
  const getSectionColor = (color: string) => {
    const map: Record<string, { dot: string; text: string; hoverBg: string; activeBg: string; count: string; iconBg: string; activeIconBg: string }> = {
      emerald: { dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]', text: 'text-emerald-400', hoverBg: 'hover:bg-white/5', activeBg: 'bg-gradient-to-r from-emerald-500/10 to-transparent border-l-2 border-emerald-500 shadow-inner', count: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', iconBg: 'bg-slate-800/50 border-white/5', activeIconBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
      cyan: { dot: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]', text: 'text-cyan-400', hoverBg: 'hover:bg-white/5', activeBg: 'bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-500 shadow-inner', count: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30', iconBg: 'bg-slate-800/50 border-white/5', activeIconBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' },
      purple: { dot: 'bg-purple-400 shadow-[0_0_8px_#c084fc]', text: 'text-purple-400', hoverBg: 'hover:bg-white/5', activeBg: 'bg-gradient-to-r from-purple-500/10 to-transparent border-l-2 border-purple-500 shadow-inner', count: 'bg-purple-500/20 text-purple-400 border border-purple-500/30', iconBg: 'bg-slate-800/50 border-white/5', activeIconBg: 'bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
      blue: { dot: 'bg-blue-400 shadow-[0_0_8px_#60a5fa]', text: 'text-blue-400', hoverBg: 'hover:bg-white/5', activeBg: 'bg-gradient-to-r from-blue-500/10 to-transparent border-l-2 border-blue-500 shadow-inner', count: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', iconBg: 'bg-slate-800/50 border-white/5', activeIconBg: 'bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' },
      amber: { dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]', text: 'text-amber-400', hoverBg: 'hover:bg-white/5', activeBg: 'bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 shadow-inner', count: 'bg-amber-500/20 text-amber-400 border border-amber-500/30', iconBg: 'bg-slate-800/50 border-white/5', activeIconBg: 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
      violet: { dot: 'bg-violet-400 shadow-[0_0_8px_#a78bfa]', text: 'text-violet-400', hoverBg: 'hover:bg-white/5', activeBg: 'bg-gradient-to-r from-violet-500/10 to-transparent border-l-2 border-violet-500 shadow-inner', count: 'bg-violet-500/20 text-violet-400 border border-violet-500/30', iconBg: 'bg-slate-800/50 border-white/5', activeIconBg: 'bg-violet-500/20 border-violet-500/40 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]' },
      slate: { dot: 'bg-slate-400 shadow-[0_0_8px_#94a3b8]', text: 'text-slate-200', hoverBg: 'hover:bg-white/5', activeBg: 'bg-gradient-to-r from-slate-500/10 to-transparent border-l-2 border-slate-500 shadow-inner', count: 'bg-slate-500/30 text-slate-300 border border-slate-500/40', iconBg: 'bg-slate-800/50 border-white/5', activeIconBg: 'bg-slate-600/30 border-slate-500/40 text-slate-200 shadow-[0_0_15px_rgba(148,163,184,0.3)]' },
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
      <Link to={href} key={item.modulo_codigo} className="block relative group">
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className={`flex items-center gap-2.5 px-2 py-1.5 ml-1.5 rounded-xl transition-all duration-300 ${isActive
          ? `${colors.activeBg} ${colors.activeText} border border-white/10 shadow-sm font-bold`
          : 'text-slate-400/80 hover:text-slate-100 hover:bg-white/5 border border-transparent'
          }`}>
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-300 ${isActive ? `bg-white/10 shadow-inner ${colors.activeBorder}` : 'bg-slate-900 border-white/5 group-hover:border-white/10'}`}>
            <Icon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isActive
              ? `${colors.activeText} ${colors.iconGlow}`
              : 'text-slate-500 group-hover:text-slate-300'
              }`} />
          </div>
          <span className={`text-xs tracking-wide truncate ${isActive ? 'drop-shadow-sm' : ''}`}>
            {item.modulo_nombre}
          </span>
          {isActive && <CheckCircle className="w-3 h-3 opacity-50 ml-auto mr-1" />}
        </div>
      </Link>
    )
  }

  // ── Render de una sección colapsable ──
  const renderSection = (section: SidebarSection & { availableModules: PermisoModulo[] }, isAdminSection = false) => {
    const isCollapsed = collapsed[section.key] ?? true
    const hasActive = sectionHasActive(section)
    const SectionIcon = section.icon
    const sColors = getSectionColor(section.color)

    return (
      <div key={section.key} className={`${isAdminSection ? 'mt-3 pt-3 border-t border-white/[0.04]' : ''}`}>
        {/* Section Header */}
        <button
          onClick={() => toggleSection(section.key)}
          className={`w-full group flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm ${hasActive ? sColors.activeBg : `hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05]`}`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all duration-300 ${hasActive ? sColors.activeIconBg : `${sColors.iconBg} text-slate-500 group-hover:text-slate-300 group-hover:border-white/10`}`}>
            <SectionIcon className={`w-3.5 h-3.5 transition-transform duration-300 ${hasActive ? 'scale-110' : 'group-hover:scale-110'}`} />
          </div>
          <div className="flex-1 text-left flex flex-col justify-center">
            <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-colors leading-none mb-0.5 ${hasActive ? sColors.text : 'text-slate-500 group-hover:text-slate-400'}`}>
              {section.label}
            </span>
            <div className="flex items-center gap-1.5 opacity-60">
                <div className={`w-1 h-1 rounded-full ${hasActive ? sColors.dot : 'bg-slate-700'}`} />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{section.availableModules.length} MÓDULOS</span>
            </div>
          </div>
          <div className={`w-6 h-6 flex items-center justify-center rounded-md border transition-all duration-300 bg-slate-900/50 ${hasActive ? sColors.activeIconBg : 'border-white/5 text-slate-600 group-hover:border-white/10'}`}>
             <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-90'}`} />
          </div>
        </button>

        {/* Section Items (animated collapse) */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100'
            }`}
        >
          <div className="ml-2 mt-1 space-y-0.5 border-l border-white/[0.04] pl-2">
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
          <Link to="/dashboard" className="block mb-4 mt-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/5 blur-xl -z-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 backdrop-blur-md border ${isItemActive('/dashboard')
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10'
              }`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-300 ${isItemActive('/dashboard') ? 'bg-emerald-500/20 shadow-inner border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-white/10 group-hover:border-white/20'}`}>
                <LayoutDashboard className={`w-3.5 h-3.5 ${isItemActive('/dashboard') ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : ''}`} />
              </div>
              <span className={`text-[11px] font-black uppercase tracking-[0.1em] ${isItemActive('/dashboard') ? 'text-white drop-shadow-sm' : ''
                }`}>Vista General</span>
            </div>
          </Link>
        )}

        {/* Secciones operativas agrupadas */}
        <div className="space-y-1">
          {activeSections.map(section => renderSection(section))}
        </div>

        {/* Sección de Administración */}
        {adminSection.availableModules.length > 0 && renderSection(adminSection, true)}
      </div>

      {/* Perfil de usuario (footer) */}
      <div className="mt-auto pt-5 pb-2">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative group shadow-sm">
          <UserAvatar />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white tracking-wide truncate">{user.name}</p>
            <p className="text-[9px] text-emerald-400 font-bold truncate uppercase tracking-[0.2em] opacity-80 mt-0.5">
              {user.hierarchy.replace(/_/g, ' ')}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all shadow-inner"
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

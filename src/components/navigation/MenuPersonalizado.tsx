// Menú personalizado dinámico - Rediseño Moderno Clean Blue
import React, { useMemo } from 'react'
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
  FileBarChart2
} from 'lucide-react'

import { NavigationItem } from '@/types/saas'
import { UserRole } from '@/types/auth'
import { useAuth } from '@/contexts/AuthContext'
import { useMenuModulos } from '@/hooks/usePermisosDinamicos'

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

  // Mapeo de íconos robusto (Soporta todos los módulos del sistema)
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
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

  const isItemActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  // Avatar component helper
  const UserAvatar = () => (
    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm overflow-hidden">
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <User className="w-6 h-6" />
      )}
    </div>
  )

  // Separar módulos en secciones
  const adminModuleCodes = ['empresas', 'usuarios', 'roles', 'roles_permisos', 'logs', 'configuracion', 'sistema', 'suscripcion'];

  const dashboardModule = modulosDinamicos.find(m => m.modulo_codigo === 'dashboard');
  const operationalModules = modulosDinamicos.filter(m => m.modulo_codigo !== 'dashboard' && !adminModuleCodes.includes(m.modulo_codigo));
  const adminModulesList = modulosDinamicos.filter(m => adminModuleCodes.includes(m.modulo_codigo));
  const hasAdminModules = adminModulesList.length > 0;

  return (
    <div className={`flex flex-col h-full bg-transparent px-6 pb-6 ${className}`}>

      {/* Main Navigation */}
      <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar pt-4">

        {/* Dashboard Button destacado (Solo si tiene permiso) */}
        {dashboardModule && (
          <Link to="/dashboard" className="mb-6 block">
            <button className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${isItemActive('/dashboard')
              ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] border-l-4 border-emerald-500'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <LayoutDashboard className={`w-5 h-5 ${isItemActive('/dashboard') ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : ''}`} />
              <span className={`font-bold text-sm tracking-tight ${isItemActive('/dashboard') ? 'neon-text-light' : ''}`}>Dashboard</span>
            </button>
          </Link>
        )}

        {/* Módulos Operativos Dinámicos */}
        <div className="space-y-2">
          {operationalModules.map((item) => {
            const href = item.modulo_ruta || `/${item.modulo_codigo}`;
            const isActive = isItemActive(href)
            const Icon = getIcon(item.modulo_icono)

            return (
              <Link to={href} key={item.modulo_codigo} className="block">
                <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                  }`}>
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-300'
                    }`} />
                  <span className={`text-sm font-semibold tracking-wide ${isActive ? 'neon-text-light' : ''}`}>{item.modulo_nombre}</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Admin Section (Dinámica) */}
        {hasAdminModules && (
          <div className="pt-6 mt-6 border-t border-white/5 animate-in fade-in duration-500">
            <p className="px-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Administración</p>

            {adminModulesList.map((item) => {
              const href = item.modulo_ruta || `/${item.modulo_codigo}`;
              const isActive = isItemActive(href)
              const Icon = getIcon(item.modulo_icono)

              return (
                <Link to={href} key={item.modulo_codigo} className="block mb-2">
                  <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)] font-semibold' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className={`text-sm font-medium ${isActive ? 'neon-text-light' : ''}`}>{item.modulo_nombre}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Intelligence Bureau Quick Access */}
        <div className="pt-6 mt-6 border-t border-white/5">
          <p className="px-5 text-[10px] font-black text-violet-400/60 uppercase tracking-[0.2em] mb-3">Intelligence Bureau</p>
          <Link to="/vigilancia-epidemiologica" className="block">
            <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isItemActive('/vigilancia-epidemiologica')
                ? 'bg-violet-500/10 text-violet-400 border-l-4 border-violet-500 shadow-[0_0_15px_-5px_rgba(139,92,246,0.3)]'
                : 'text-slate-500 hover:text-violet-300 hover:bg-violet-500/5'
              }`}>
              <div className="relative">
                <Brain className={`w-5 h-5 transition-colors ${isItemActive('/vigilancia-epidemiologica') ? 'text-violet-400' : 'text-slate-500 group-hover:text-violet-400'}`} />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
              </div>
              <span className={`text-sm font-semibold ${isItemActive('/vigilancia-epidemiologica') ? 'text-violet-300' : ''}`}>Centro de IA</span>
            </div>
          </Link>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="flex items-center gap-4 px-2">
          <UserAvatar />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white truncate drop-shadow-sm">{user.name}</p>
            <p className="text-[10px] text-emerald-500/80 font-bold truncate uppercase tracking-widest">{user.hierarchy.replace('_', ' ')}</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
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

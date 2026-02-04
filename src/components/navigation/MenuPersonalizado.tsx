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

  // Generar items de menú basados en permisos dinámicos (ESPAÑOL)
  const menuItems = useMemo(() => {
    if (menuLoading || !modulosDinamicos) return []

    // Módulos que se manejan en secciones especiales o administrativas
    const adminModulos = ['dashboard', 'empresas', 'usuarios', 'roles', 'logs', 'configuracion'];

    return modulosDinamicos
      .filter(m => !adminModulos.includes(m.modulo_codigo))
      .map(m => ({
        id: m.modulo_codigo,
        name: m.modulo_nombre,
        href: m.modulo_ruta || '/dashboard',
        icon: m.modulo_icono
      }))
  }, [modulosDinamicos, menuLoading])

  // Verificar si el usuario tiene permiso de ver el dashboard
  const canSeeDashboard = useMemo(() => {
    return modulosDinamicos.some(m => m.modulo_codigo === 'dashboard' && m.puede_ver);
  }, [modulosDinamicos]);

  // Mapeo de íconos robusto (Soporta todos los módulos del sistema)
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      // Principales
      LayoutDashboard,
      Home: LayoutDashboard,
      Users,
      Calendar,
      Activity,

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

      // Otros
      Search,
      Bell,
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

  const isSuperAdmin = user?.hierarchy === 'super_admin';

  return (
    <div className={`flex flex-col h-full bg-transparent px-6 pb-6 ${className}`}>

      {/* Main Navigation */}
      <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar pt-4">

        {/* Dashboard Button destacado (Solo si tiene permiso) */}
        {canSeeDashboard && (
          <Link to="/dashboard">
            <button className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${isItemActive('/dashboard')
              ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] border-l-4 border-emerald-500'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <LayoutDashboard className={`w-5 h-5 ${isItemActive('/dashboard') ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : ''}`} />
              <span className={`font-bold text-sm tracking-tight ${isItemActive('/dashboard') ? 'neon-text-light' : ''}`}>Dashboard</span>
            </button>
          </Link>
        )}

        {/* Acceso Directo a Estudios Médicos (EJE 3) */}
        <Link to="/medicina/estudios">
          <button className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group ${isItemActive('/medicina/estudios')
            ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            <Microscope className={`w-5 h-5 ${isItemActive('/medicina/estudios') ? 'text-emerald-400' : ''}`} />
            <span className={`font-bold text-sm tracking-tight ${isItemActive('/medicina/estudios') ? 'neon-text-light' : ''}`}>Estudios Medicos</span>
          </button>
        </Link>

        {/* EJE 5: Matriz de Riesgos */}
        <Link to="/medicina/matriz-riesgos">
          <button className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group ${isItemActive('/medicina/matriz-riesgos')
            ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            <ShieldAlert className={`w-5 h-5 ${isItemActive('/medicina/matriz-riesgos') ? 'text-emerald-400' : ''}`} />
            <span className={`font-bold text-sm tracking-tight ${isItemActive('/medicina/matriz-riesgos') ? 'neon-text-light' : ''}`}>Matriz Riesgos</span>
          </button>
        </Link>

        {/* EJE 6: Programa Anual */}
        <Link to="/medicina/programa-anual">
          <button className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group ${isItemActive('/medicina/programa-anual')
            ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            <CalendarRange className={`w-5 h-5 ${isItemActive('/medicina/programa-anual') ? 'text-emerald-400' : ''}`} />
            <span className={`font-bold text-sm tracking-tight ${isItemActive('/medicina/programa-anual') ? 'neon-text-light' : ''}`}>Programa Anual</span>
          </button>
        </Link>

        {/* EJE 10: Recetas e Incapacidades - Links en sidebar */}
        <Link to="/medicina/recetas">
          <button className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group ${isItemActive('/medicina/recetas')
            ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            <Pill className={`w-5 h-5 ${isItemActive('/medicina/recetas') ? 'text-emerald-400' : ''}`} />
            <span className={`font-bold text-sm tracking-tight ${isItemActive('/medicina/recetas') ? 'neon-text-light' : ''}`}>Recetas Médicas</span>
          </button>
        </Link>

        <Link to="/medicina/incapacidades">
          <button className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group ${isItemActive('/medicina/incapacidades')
            ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            <FileBarChart2 className={`w-5 h-5 ${isItemActive('/medicina/incapacidades') ? 'text-emerald-400' : ''}`} />
            <span className={`font-bold text-sm tracking-tight ${isItemActive('/medicina/incapacidades') ? 'neon-text-light' : ''}`}>Incapacidades</span>
          </button>
        </Link>

        {/* EJE 13: Farmacia / Inventario */}
        <Link to="/inventario">
          <button className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group ${isItemActive('/inventario')
            ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            <Pill className={`w-5 h-5 ${isItemActive('/inventario') ? 'text-emerald-400' : ''}`} />
            <span className={`font-bold text-sm tracking-tight ${isItemActive('/inventario') ? 'neon-text-light' : ''}`}>Farmacia & Inventario</span>
          </button>
        </Link>

        {/* Menu List */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = isItemActive(item.href)
            const Icon = getIcon(item.icon)

            return (
              <Link to={item.href} key={item.id} className="block">
                <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                  }`}>
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-300'
                    }`} />
                  <span className={`text-sm font-semibold tracking-wide ${isActive ? 'neon-text-light' : ''}`}>{item.name}</span>
                </div>
              </Link>
            )
          })}
          {/* Enlace estático a NOM-035 (Temporal mientras se agrega a módulos dinámicos) */}
          <Link to="/normatividad/nom035" className="block">
            <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isItemActive('/normatividad/nom035')
              ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]'
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}>
              <ClipboardCheck className={`w-5 h-5 transition-colors ${isItemActive('/normatividad/nom035') ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
              <span className={`text-sm font-semibold tracking-wide ${isItemActive('/normatividad/nom035') ? 'neon-text-light' : ''}`}>NOM-035</span>
            </div>
          </Link>

          <Link to="/normatividad/nom036" className="block">
            <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isItemActive('/normatividad/nom036')
              ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]'
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}>
              <Dumbbell className={`w-5 h-5 transition-colors ${isItemActive('/normatividad/nom036') ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
              <span className={`text-sm font-semibold tracking-wide ${isItemActive('/normatividad/nom036') ? 'neon-text-light' : ''}`}>NOM-036-1</span>
            </div>
          </Link>

          <Link to="/normatividad/ley-silla" className="block">
            <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isItemActive('/normatividad/ley-silla')
              ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]'
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}>
              <Armchair className={`w-5 h-5 transition-colors ${isItemActive('/normatividad/ley-silla') ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
              <span className={`text-sm font-semibold tracking-wide ${isItemActive('/normatividad/ley-silla') ? 'neon-text-light' : ''}`}>Ley Silla</span>
            </div>
          </Link>
        </div>

        {/* Admin Section (Solo Super Admin o Admin) */}
        {isSuperAdmin && (
          <div className="pt-6 border-t border-white/5 animate-in fade-in duration-500">
            <p className="px-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Administración</p>

            <Link to="/admin/empresas" className="block">
              <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isItemActive('/admin/empresas') ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)] font-semibold' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                <Building className={`w-5 h-5 transition-colors ${isItemActive('/admin/empresas') ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className={`text-sm font-medium ${isItemActive('/admin/empresas') ? 'neon-text-light' : ''}`}>Empresas</span>
              </div>
            </Link>

            <Link to="/admin/usuarios" className="block">
              <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isItemActive('/admin/usuarios') ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)] font-semibold' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                <Users className={`w-5 h-5 transition-colors ${isItemActive('/admin/usuarios') ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className={`text-sm font-medium ${isItemActive('/admin/usuarios') ? 'neon-text-light' : ''}`}>Usuarios</span>
              </div>
            </Link>

            <Link to="/admin/roles" className="block">
              <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isItemActive('/admin/roles') ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)] font-semibold' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                <Shield className={`w-5 h-5 transition-colors ${isItemActive('/admin/roles') ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className={`text-sm font-medium ${isItemActive('/admin/roles') ? 'neon-text-light' : ''}`}>Roles</span>
              </div>
            </Link>

            <Link to="/admin/logs" className="block">
              <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isItemActive('/admin/logs') ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)] font-semibold' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                <ClipboardCheck className={`w-5 h-5 transition-colors ${isItemActive('/admin/logs') ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className={`text-sm font-medium ${isItemActive('/admin/logs') ? 'neon-text-light' : ''}`}>Logs</span>
              </div>
            </Link>

            <Link to="/admin/suscripcion" className="block">
              <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isItemActive('/admin/suscripcion') ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)] font-semibold' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                <CreditCard className={`w-5 h-5 transition-colors ${isItemActive('/admin/suscripcion') ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className={`text-sm font-medium ${isItemActive('/admin/suscripcion') ? 'neon-text-light' : ''}`}>Planes y Pagos</span>
              </div>
            </Link>

            <Link to="/configuracion" className="block">
              <div className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isItemActive('/configuracion') ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)] font-semibold' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                <Settings className={`w-5 h-5 transition-colors ${isItemActive('/configuracion') ? 'text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className={`text-sm font-medium ${isItemActive('/configuracion') ? 'neon-text-light' : ''}`}>Configuracion</span>
              </div>
            </Link>
          </div>
        )}
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

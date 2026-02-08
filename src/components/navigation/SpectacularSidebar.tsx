/**
 * SpectacularSidebar - GPMedical 3.5
 * 
 * Sidebar ANTI-GENÉRICO con diseño único y distintivo
 * Navegación premium con efectos visuales únicos
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Building2,
  Package,
  Settings,
  BarChart3,
  Activity,
  AlertCircle,
  Sparkles,
  LogOut,
  Shield,
  Heart,
  FileText,
  Clock,
  Plus,
  CreditCard,
  Briefcase,
  Pill,
  ClipboardCheck,
  Microscope,
  Eye,
  Home,
  Zap,
  Loader2,
  ChevronDown,
  Search,
  Bell,
  HelpCircle,
  Hexagon,
  Layers,
  Command,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermisosDinamicos } from '@/hooks/usePermisosDinamicos';

const ICONO_MAP: Record<string, any> = {
  Building2, Users, Calendar, FileText, Stethoscope, Package, CreditCard,
  BarChart3, Settings, Briefcase, Activity, Pill, ClipboardCheck, Microscope,
  Heart, Shield, Sparkles, Eye, AlertCircle, LayoutDashboard, Home: LayoutDashboard
}

export function SpectacularSidebar() {
  const { user, logout } = useAuth();
  const { modulosVisibles: modulosDinamicos, loading, ability } = usePermisosDinamicos();
  const location = useLocation();

  if (!user) return null;

  // Mapa de iconos para renderizado dinámico
  const getIcon = (iconName: string) => ICONO_MAP[iconName] || FileText;

  // Items principales definidos manualmente pero protegidos por permisos
  const potentialMainItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'emerald', permission: 'dashboard' },
    { path: '/rayosx', icon: Zap, label: 'Rayos X & IA', color: 'violet', badge: 'IA', permission: 'rayos_x' },
    { path: '/riesgos-trabajo', icon: AlertCircle, label: 'Riesgos de Trabajo', color: 'amber', badge: 'ST-7', permission: 'riesgos_trabajo' },
    { path: '/rrhh', icon: Users, label: 'RRHH', color: 'blue', permission: 'rrhh' },
    { path: '/recepcion/sala-espera', icon: Clock, label: 'Sala de Espera', color: 'blue', permission: 'agenda' },
    { path: '/facturacion', icon: CreditCard, label: 'Facturación', color: 'teal', permission: 'facturacion' },
  ] as const;

  // Filtrar items principales según permisos
  const mainNavItems = potentialMainItems.filter(item => ability.can('ver', item.permission as any));

  // Admin items protegidos
  const adminItems = [
    { path: '/usuarios', icon: Shield, label: 'Usuarios', color: 'amber', permission: 'usuarios' },
    { path: '/admin/empresas', icon: Building2, label: 'Empresas', color: 'blue', permission: 'empresas' },
  ].filter(item => ability.can('ver', item.permission as any));

  // Configuración protegida
  const showConfig = ability.can('ver', 'configuracion' as any);

  // Módulos dinámicos (excluyendo los que ya están en mainNavItems para evitar duplicados visuales si aplica)
  // Nota: Mantenemos la lógica de renderizar módulos adicionales que no estén arriba
  const excludedPaths: string[] = [
    ...mainNavItems.map(i => i.path),
    ...adminItems.map(i => i.path),
    '/dashboard',
    '/configuracion'
  ];

  const additionalModules = modulosDinamicos.filter(m => {
    const path = m.modulo_ruta || `/${m.modulo_codigo}`;
    return !excludedPaths.includes(path) && !excludedPaths.some(p => path.startsWith(p));
  });

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-[280px] h-screen flex flex-col shrink-0 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0c0c0f 0%, #0a0a0c 50%, #0d0d10 100%)'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />

      {/* Glow Effects */}
      <div className="absolute top-0 left-0 right-0 h-60 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-violet-500/5 to-transparent pointer-events-none" />

      {/* ===== HEADER ===== */}
      <div className="relative z-10 p-6">
        <Link to="/dashboard" className="flex items-center gap-4 group">
          {/* Logo con efecto único */}
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
              <Heart className="w-6 h-6 text-white" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/50 animate-ping opacity-30" />
          </div>

          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              GPMedical
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 rounded">3.5</span>
            </h1>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              Enterprise Suite
            </p>
          </div>
        </Link>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="px-4 mb-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
          <div className="relative flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav className="flex-1 overflow-y-auto px-3 scrollbar-hide">
        {/* Main Section */}
        {mainNavItems.length > 0 && (
          <div className="mb-6">
            <p className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-3 h-3" />
              Principal
            </p>
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <NavItem key={item.path} {...item} isActive={location.pathname === item.path} color={item.color as any} />
              ))}
            </div>
          </div>
        )}

        {/* Admin Section */}
        {adminItems.length > 0 && (
          <div className="mb-6">
            <p className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-3 h-3" />
              Administración
            </p>
            <div className="space-y-1">
              {adminItems.map((item) => (
                <NavItem key={item.path} {...item} isActive={location.pathname === item.path} color={item.color as any} />
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Modules (Restantes) */}
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin h-5 w-5 text-emerald-500" />
          </div>
        ) : additionalModules.length > 0 && (
          <div className="mb-6">
            <p className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <Hexagon className="w-3 h-3" />
              Más Módulos
            </p>
            <div className="space-y-1">
              {additionalModules.map((modulo) => {
                const path = modulo.modulo_ruta || `/${modulo.modulo_codigo}`;
                const Icon = getIcon(modulo.modulo_icono);
                const isActive = location.pathname === path || location.pathname.startsWith(path + '/');

                return (
                  <NavItem
                    key={modulo.modulo_codigo}
                    path={path}
                    icon={Icon}
                    label={modulo.modulo_nombre}
                    color="slate"
                    isActive={isActive}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Config (Protected) */}
        {showConfig && (
          <div className="mb-6">
            <NavItem
              path="/configuracion"
              icon={Settings}
              label="Configuración"
              color="slate"
              isActive={location.pathname === '/configuracion'}
            />
          </div>
        )}
      </nav>

      {/* ===== FOOTER ===== */}
      <div className="relative z-10 p-4 space-y-3">
        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Online</span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono">v3.5.0</span>
        </div>

        {/* User Profile - REAL DATA */}
        <div className="p-3 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-colors group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20 uppercase">
                {user.nombre?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0a0a0c] rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.nombre || 'Usuario'} {user.apellido_paterno || ''}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{user.rol?.replace('_', ' ') || 'Invitado'}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

// ===== NAV ITEM COMPONENT =====
function NavItem({
  path,
  icon: Icon,
  label,
  color = 'emerald',
  badge,
  isActive
}: {
  path: string;
  icon: any;
  label: string;
  color?: 'emerald' | 'violet' | 'blue' | 'amber' | 'teal' | 'rose' | 'slate';
  badge?: string;
  isActive: boolean;
}) {
  const colorStyles: Record<string, { active: string; indicator: string; badge: string }> = {
    emerald: {
      active: 'bg-emerald-500/15 text-emerald-400',
      indicator: 'bg-emerald-400',
      badge: 'bg-emerald-500 text-white'
    },
    violet: {
      active: 'bg-violet-500/15 text-violet-400',
      indicator: 'bg-violet-400',
      badge: 'bg-violet-500 text-white'
    },
    blue: {
      active: 'bg-blue-500/15 text-blue-400',
      indicator: 'bg-blue-400',
      badge: 'bg-blue-500 text-white'
    },
    amber: {
      active: 'bg-amber-500/15 text-amber-400',
      indicator: 'bg-amber-400',
      badge: 'bg-amber-500 text-white'
    },
    teal: {
      active: 'bg-teal-500/15 text-teal-400',
      indicator: 'bg-teal-400',
      badge: 'bg-teal-500 text-white'
    },
    rose: {
      active: 'bg-rose-500/15 text-rose-400',
      indicator: 'bg-rose-400',
      badge: 'bg-rose-500 text-white'
    },
    slate: {
      active: 'bg-white/10 text-white',
      indicator: 'bg-white',
      badge: 'bg-slate-500 text-white'
    }
  };

  const styles = colorStyles[color];

  return (
    <Link
      to={path}
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
        ${isActive
          ? styles.active
          : 'text-slate-500 hover:text-white hover:bg-white/5'
        }
      `}
    >
      {/* Active Indicator */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 20, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full ${styles.indicator}`}
          />
        )}
      </AnimatePresence>

      <Icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'group-hover:scale-110'} transition-transform`} />
      <span className="flex-1 text-sm font-medium">{label}</span>

      {badge && (
        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${styles.badge}`}>
          {badge}
        </span>
      )}

      {isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
    </Link>
  );
}

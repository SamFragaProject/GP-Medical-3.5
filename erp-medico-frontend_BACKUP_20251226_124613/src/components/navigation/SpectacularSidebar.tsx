// Sidebar Premium Funcional - Versión Corregida
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/types/auth';
import { getSectionsForRole } from '@/config/roleSections';

export function SpectacularSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = getSectionsForRole(user.rol);

  return (
    <div className="w-64 h-screen flex flex-col bg-slate-900 text-white border-r border-slate-800 shadow-2xl shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MediFlow</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              Occupational Health
            </p>
          </div>
        </Link>

        {/* Role Badge */}
        <div className="mt-4 flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <Shield className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
            {ROLE_LABELS[user.rol]}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              <span className="text-sm font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-indigo-500 to-purple-600">
            {user.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user.nombre}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

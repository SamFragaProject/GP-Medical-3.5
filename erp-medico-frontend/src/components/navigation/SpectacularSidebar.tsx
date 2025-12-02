// Sidebar Moderno con Glassmorphism - Versión Purple/Emerald
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Shield,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/types/auth';
import { getSectionsForRole } from '@/config/roleSections';
import { Badge } from '@/components/ui/badge';

export function SpectacularSidebar() {
  const { user, canAccess, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (!user) return null;

  const menuItems = getSectionsForRole(user.rol);

  return (
    <div className="w-64 h-screen fixed left-0 top-0 z-50 flex flex-col bg-slate-900 text-white border-r border-slate-800 shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => navigate('/dashboard')}
        >
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg transition-opacity group-hover:opacity-100 opacity-0" />
            <div className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">MediFlow</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              Occupational Health
            </p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mt-4 flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
          <Shield className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
            {ROLE_LABELS[user.rol]}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {menuItems.map((item, index) => {
          const isActive =
            location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const hasAccess = canAccess(item.resource);
          if (!hasAccess) return null;

          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              onClick={() => navigate(item.path)}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full group relative overflow-hidden rounded-xl px-3 py-3 transition-all duration-200 flex items-center space-x-3 ${isActive
                  ? 'bg-blue-600/10 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]'
                  : 'hover:bg-slate-800/50 border border-transparent'
                }`}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}

              {/* Icon */}
              <div className={`p-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700/50'
                }`}>
                <item.icon className="h-5 w-5" />
              </div>

              {/* Title */}
              <span className={`flex-1 text-left text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                {item.title}
              </span>

              {/* Badge */}
              {'badge' in item && item.badge && (
                <Badge className="text-[10px] px-2 py-0.5 border-0 bg-red-500 text-white shadow-sm">
                  {String(item.badge)}
                </Badge>
              )}

              {/* Chevron */}
              {isActive && (
                <ChevronRight className="w-4 h-4 text-blue-400" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-800" />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user.nombre}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user.email}
            </p>
          </div>

          {/* Logout */}
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

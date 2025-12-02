// Sidebar Espectacular Fijo - Menú lateral moderno sin colapsar
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  Heart,
  Activity,
  Microscope,
  ClipboardCheck,
  UserCheck,
  Briefcase,
  ChevronRight,
  Sparkles,
  Crown
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { isHcRxV2Enabled } from '@/lib/flags'
import { ROLE_COLORS, ROLE_LABELS } from '@/types/auth'
import { getSectionsForRole } from '@/config/roleSections'
import { Badge } from '@/components/ui/badge'

// La lista de menús se obtiene desde ROLE_SECTIONS centralizado

export function SpectacularSidebar() {
  const { user, canAccess } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const v2 = isHcRxV2Enabled()

  if (!user) return null

  const menuItems = getSectionsForRole(user.rol)

  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={
        v2
          ? "w-72 h-screen fixed left-0 top-0 z-50 flex flex-col bg-gradient-to-b from-[#F6FAFB] to-white border-r border-gray-200 shadow-[0_10px_30px_rgba(16,24,40,.08)]"
          : "w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 h-screen fixed left-0 top-0 z-50 shadow-2xl border-r border-slate-700/50 flex flex-col"
      }
    >
      {/* Header espectacular con animación */}
      <div className={v2 ? "p-6 border-b border-gray-200 bg-white/70 backdrop-blur-sm" : "p-6 border-b border-slate-700/50 bg-gradient-to-r from-primary/20 to-emerald-600/20 backdrop-blur-sm"}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center space-x-3"
        >
          <div className="relative">
            {v2 ? (
              <div className="rounded-2xl p-3 shadow-md bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                <Heart className="h-7 w-7" />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-3 shadow-lg">
                <Heart className="h-7 w-7 text-white" />
              </div>
            )}
          </div>
          
          <div>
            {v2 ? (
              <>
                <h1 className="text-2xl font-semibold text-gray-900">MediFlow</h1>
                <p className="text-xs text-gray-500 font-medium">Sistema Médico Avanzado</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  MediFlow
                </h1>
                <p className="text-xs text-gray-400 font-medium">Sistema Médico Avanzado</p>
              </>
            )}
          </div>
        </motion.div>

        {/* Badge del rol con animación */}
        <div className="mt-4">
          {v2 ? (
            <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${ROLE_COLORS[user.rol]} text-gray-900 bg-white shadow-sm`}>
              <Shield className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{ROLE_LABELS[user.rol]}</span>
            </div>
          ) : (
            <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full ${ROLE_COLORS[user.rol]} bg-opacity-20 border border-current backdrop-blur-sm`}>
              <Shield className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{ROLE_LABELS[user.rol]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Usuario info con estilo */}
      <div className={v2 ? "p-4 border-b border-gray-200" : "p-4 border-b border-slate-700/50"}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            {v2 ? (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <div className={v2 ? "absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" : "absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"}></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className={v2 ? "text-sm font-semibold text-gray-900 truncate" : "text-sm font-semibold text-white truncate"}>
              {user.nombre} {user.apellido_paterno}
            </p>
            <p className={v2 ? "text-xs text-gray-500 truncate" : "text-xs text-gray-400 truncate"}>{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navegación con efectos espectaculares */}
      <nav className={v2 ? "flex-1 overflow-y-auto py-4 px-3 space-y-1" : "flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"}>
        <AnimatePresence>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            const hasAccess = canAccess(item.resource)

            if (!hasAccess) return null

            return (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.2 }}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
                className={
                  v2
                    ? `w-full group relative overflow-hidden rounded-2xl px-4 py-3 transition-all duration-300 flex items-center space-x-3 ${
                        isActive
                          ? 'bg-white shadow-lg ring-1 ring-emerald-100 text-gray-900'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                      }`
                    : `w-full group relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                      } rounded-xl px-4 py-3 transition-all duration-300 flex items-center space-x-3`
                }
              >
                {/* Sutil brillo en hover */}
                {!v2 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                {/* Icono con animación */}
                <div
                  className={
                    v2
                      ? `relative z-10 p-2 rounded-xl ${
                          isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                        }`
                      : `relative z-10 p-2 rounded-lg ${
                          isActive ? 'bg-white/20' : 'bg-slate-700/50 group-hover:bg-slate-700'
                        }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                </div>

                {/* Texto */}
                <span className={v2 ? "relative z-10 font-semibold text-sm flex-1 text-left" : "relative z-10 font-medium text-sm flex-1 text-left"}>
                  {item.title}
                </span>

                {/* Badge si existe */}
                {'badge' in item && item.badge && (
                  <Badge className="relative z-10 bg-red-500 text-white text-xs px-2 py-0.5">
                    {String(item.badge)}
                  </Badge>
                )}

                {/* Indicador de activo */}
                {isActive && !v2 && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 z-10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.div>
                )}

                {/* Sin partículas para mejor rendimiento */}
              </motion.button>
            )
          })}
        </AnimatePresence>
      </nav>

      {/* Footer con estadísticas */}
      <div className={v2 ? "p-4 border-t border-gray-200 bg-white/60 backdrop-blur-sm" : "p-4 border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm"}>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className={v2 ? "bg-white rounded-xl p-2 shadow-sm border border-gray-200" : "bg-slate-700/30 rounded-lg p-2"}>
            <p className={v2 ? "text-2xl font-bold text-gray-900" : "text-2xl font-bold text-white"}>24</p>
            <p className={v2 ? "text-xs text-gray-500" : "text-xs text-gray-400"}>Pacientes Hoy</p>
          </div>
          <div className={v2 ? "bg-white rounded-xl p-2 shadow-sm border border-gray-200" : "bg-slate-700/30 rounded-lg p-2"}>
            <p className={v2 ? "text-2xl font-bold text-emerald-600" : "text-2xl font-bold text-green-400"}>98%</p>
            <p className={v2 ? "text-xs text-gray-500" : "text-xs text-gray-400"}>Satisfacción</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

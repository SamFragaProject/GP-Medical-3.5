// Layout principal del ERP Médico - Con AuthContext
import React, { useState, useEffect, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Bell,
  User,
  Menu,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Shield,
  LogOut
} from 'lucide-react'
import { MenuPersonalizado, MenuHierarchyIndicator } from '@/components/navigation/MenuPersonalizado'
import { ChatbotSuperinteligente } from '@/components/ChatbotSuperinteligente'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { usePermisosDinamicos } from '@/hooks/usePermisosDinamicos'
import { useReceptionNotifications } from '@/hooks/useReceptionNotifications'
import { toast } from 'sonner'
import { Breadcrumbs } from './ui/Breadcrumbs'
import BuscadorGlobal from '@/components/search/BuscadorGlobal'

interface LayoutProps {
  children?: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user: authUser, logout } = useAuth()
  const { isSuperAdmin, puede, loading: permissionsLoading } = usePermisosDinamicos()

  // Activar notificaciones de sala de espera en tiempo real
  useReceptionNotifications()

  // Usuario del AuthContext o fallback demo
  const currentUser = authUser ? {
    id: authUser.id,
    name: authUser.nombre || 'Usuario',
    email: authUser.email,
    hierarchy: authUser.rol || 'paciente'
  } : {
    id: 'demo',
    name: 'Usuario Demo',
    email: 'demo@GPMedical.com',
    hierarchy: 'super_admin'
  }

  const empresaInfo = {
    nombre: authUser?.empresa?.nombre || (authUser as any)?.empresa || authUser?.empresa_id || 'GPMedical',
    id: authUser?.empresa?.id || authUser?.empresa_id || 'demo-empresa',
    logo: authUser?.empresa?.logo_url || null,
    configuracion: authUser?.empresa?.configuracion || {}
  }

  const sedeInfo = {
    nombre: (authUser as any)?.sede_nombre || 'Sede Principal',
    id: authUser?.sede_id || 'demo-sede'
  }

  // Effect to apply custom theme
  useEffect(() => {
    if (empresaInfo.configuracion?.theme) {
      const root = document.documentElement;
      const theme = empresaInfo.configuracion.theme;

      // Ensure we import hexToHSL dynamically or use it here.
      // Easiest is to supply hex or HSL variables directly.
      if (theme.primary) {
        root.style.setProperty('--primary', theme.primary_hsl || theme.primary); // Usually requires HSL for Tailwind
        root.style.setProperty('--emerald-accent', theme.primary);
      }
      if (theme.secondary) {
        root.style.setProperty('--secondary', theme.secondary_hsl || theme.secondary);
      }
    }
  }, [empresaInfo.configuracion]);

  // Estado del sidebar y UI
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('GPMedical_sidebar_open')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications] = useState(0)
  const [buscadorAbierto, setBuscadorAbierto] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  // Persistir estado del sidebar
  useEffect(() => {
    localStorage.setItem('GPMedical_sidebar_open', JSON.stringify(sidebarOpen))
  }, [sidebarOpen])

  // Cerrar menú de usuario cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.querySelector('[data-user-menu]')
      if (userMenu && !userMenu.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Hotkey Cmd+K / Ctrl+K para buscador global
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setBuscadorAbierto(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setBuscadorAbierto(true)
  }

  // Función para nueva cita
  const handleNewAppointment = () => {
    navigate('/agenda/nueva')
    toast.success('Abriendo formulario de nueva cita')
  }

  // Función para refrescar datos (simulada)
  const handleRefreshUser = () => {
    toast.success('Datos actualizados')
    window.location.reload()
  }

  // Verificar si puede crear nueva cita de forma dinámica
  const canCreateAppointment = isSuperAdmin || puede('agenda', 'crear')
  const canAccessRoles = isSuperAdmin || puede('roles_permisos', 'ver')
  const canAccessAdmin = isSuperAdmin || puede('sistema', 'ver')

  return (
    <div className={`min-h-screen ${location.pathname.includes('/perfil') ? 'bg-transparent' : 'bg-background'}`}>
      {/* Sidebar - Menu Personalizado */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 320 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`glass-sidebar shadow-2xl fixed left-0 top-0 h-full z-[110] flex flex-col ${sidebarOpen ? '' : 'min-w-[80px]'
          }`}
      >
        {/* Header del sidebar */}
        <div className="p-8 pb-4">
          <div className="flex items-center justify-center mb-8">

            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1"
                >
                  {empresaInfo.logo ? (
                    <img src={empresaInfo.logo} alt={empresaInfo.nombre} className="max-h-8 object-contain" />
                  ) : empresaInfo.nombre === 'GPMedical' || empresaInfo.nombre === 'demo-empresa' || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}/.test(empresaInfo.nombre) ? (
                    <img src="/logo-gp.png" alt="GPMedical" className="max-h-10 object-contain brightness-0 invert" />
                  ) : (
                    <h1 className="text-2xl font-black text-white tracking-tighter truncate max-w-[180px]">
                      {empresaInfo.nombre}
                    </h1>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Menú de navegación personalizado */}
        <div className="flex-1 overflow-hidden">
          {sidebarOpen ? (
            <MenuPersonalizado />
          ) : (
            <div className="p-4">
              <MenuHierarchyIndicator />
            </div>
          )}
        </div>
      </motion.aside>

      {/* Header principal - Glassmorphism style - Ocultar en Dashboard para evitar duplicidad */}
      {!location.pathname.includes('/dashboard') && (
        <header
          className={`backdrop-blur-md border-b fixed top-0 left-0 right-0 z-[100] ${
            location.pathname.includes('/perfil')
              ? 'bg-slate-950/90 border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]'
              : 'bg-white/80 border-gray-100 shadow-sm'
          }`}
          style={{ marginLeft: sidebarOpen ? '320px' : '80px' }}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Búsqueda */}
              <div className="flex-1 max-w-2xl">
                <form onSubmit={handleSearch} className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${location.pathname.includes('/perfil') ? 'text-white/30' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar paciente, cita, examen, reporte..."
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                      location.pathname.includes('/perfil')
                        ? 'border-white/10 bg-white/[0.04] text-white/70 placeholder:text-white/25'
                        : 'border-gray-200 bg-gray-50 text-gray-800'
                    }`}
                  />
                </form>
              </div>

              {/* Acciones del header */}
              <div className="flex items-center space-x-4">


                {/* Botón nueva cita */}
                {canCreateAppointment && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNewAppointment}
                    className="bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 font-medium text-sm shadow-sm"
                  >
                    <Plus size={16} />
                    <span>Nueva Cita</span>
                  </motion.button>
                )}

                {/* Notificaciones */}
                <div className="relative">
                  <button className={`p-2 transition-colors relative ${location.pathname.includes('/perfil') ? 'text-white/40 hover:text-white/80' : 'text-gray-600 hover:text-primary'}`}>
                    <Bell size={20} />
                    {notifications > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                      >
                        {notifications}
                      </motion.span>
                    )}
                  </button>
                </div>

                {/* Menú de usuario */}
                <div className="relative" data-user-menu>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(!showUserMenu)
                    }}
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${location.pathname.includes('/perfil') ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-50'}`}
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className={`text-sm font-medium ${location.pathname.includes('/perfil') ? 'text-white/80' : 'text-gray-900'}`}>
                        {currentUser.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {currentUser.hierarchy?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </button>

                  {/* Dropdown del usuario */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[9999]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Información del usuario demo */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                          <p className="text-xs text-gray-500">{currentUser.email}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-primary font-medium">{empresaInfo.nombre}</p>
                            <p className="text-xs text-gray-500">{sedeInfo.nombre}</p>
                          </div>
                        </div>

                        {/* Opciones del menú */}
                        <button
                          onClick={() => {
                            navigate('/perfil')
                            setShowUserMenu(false)
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                        >
                          <User size={16} className="text-gray-400" />
                          <span>Mi Perfil</span>
                        </button>

                        <button
                          onClick={() => {
                            navigate('/configuracion')
                            setShowUserMenu(false)
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                        >
                          <Settings size={16} className="text-gray-400" />
                          <span>Configuración</span>
                        </button>

                        <button
                          onClick={() => {
                            handleRefreshUser()
                            setShowUserMenu(false)
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                        >
                          <Loader2 size={16} className="text-gray-400" />
                          <span>Actualizar Datos</span>
                        </button>

                        {/* Opciones de Administración - Filtradas dinámicamente */}
                        {(canAccessAdmin || canAccessRoles) && (
                          <>
                            <hr className="my-2 border-gray-100" />
                            <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              Administración
                            </p>
                          </>
                        )}

                        {canAccessAdmin && (
                          <button
                            onClick={() => {
                              navigate('/admin/dashboard')
                              setShowUserMenu(false)
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                          >
                            <Shield size={16} className="text-gray-400" />
                            <span>Admin Dashboard</span>
                          </button>
                        )}

                        {canAccessRoles && (
                          <button
                            onClick={() => {
                              navigate('/roles')
                              setShowUserMenu(false)
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                          >
                            <Shield size={16} className="text-violet-400" />
                            <span className="font-medium text-violet-700">Gestión de Roles</span>
                          </button>
                        )}

                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              navigate('/admin/menu-config')
                              setShowUserMenu(false)
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                          >
                            <Settings size={16} className="text-gray-400" />
                            <span>Configuración Menús</span>
                          </button>
                        )}

                        <hr className="my-2 border-gray-100" />
                        <button
                          onClick={() => {
                            logout()
                            setShowUserMenu(false)
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Cerrar Sesión</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main
        className={`${location.pathname.includes('/perfil') ? 'bg-transparent' : 'bg-[#f8fafc]'} overflow-y-auto overflow-x-hidden relative`}
        style={{
          marginLeft: sidebarOpen ? '320px' : '80px',
          marginTop: (location.pathname.includes('/dashboard') || location.pathname.includes('/ia')) ? '0' : '80px',
          height: (location.pathname.includes('/dashboard') || location.pathname.includes('/ia')) ? '100vh' : 'calc(100vh - 80px)',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className={`container mx-auto min-h-full flex flex-col relative ${location.pathname.includes('/perfil') ? 'p-0 max-w-full container-none' : 'px-6 py-8'}`}>
          {!location.pathname.includes('/perfil') && <Breadcrumbs />}
          <motion.div
            key={location.pathname}
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="flex-1 w-full"
          >
            <React.Suspense fallback={
              <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Cargando módulo...</p>
              </div>
            }>
              {children || <Outlet />}
            </React.Suspense>
          </motion.div>
        </div>
      </main>

      {/* Chatbot flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatbotSuperinteligente />
      </div>

      {/* Buscador Global (Cmd+K) */}
      <BuscadorGlobal abierto={buscadorAbierto} onCerrar={() => setBuscadorAbierto(false)} />
    </div>
  )
}

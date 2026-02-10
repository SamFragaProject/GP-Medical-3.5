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
import { AIHealthIndicator } from '@/components/ia/AIHealthIndicator'
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
    nombre: 'GPMedical',
    id: 'demo-empresa'
  }

  const sedeInfo = {
    nombre: 'Sede Principal',
    id: 'demo-sede'
  }

  // Estado del sidebar y UI
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('GPMedical_sidebar_open')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications] = useState(3)
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
    <div className="min-h-screen bg-background">
      {/* Sidebar - Menu Personalizado */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 320 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`glass-sidebar shadow-2xl fixed left-0 top-0 h-full z-30 flex flex-col ${sidebarOpen ? '' : 'min-w-[80px]'
          }`}
      >
        {/* Header del sidebar */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-emerald-500 rounded-2xl p-3 shadow-lg shadow-emerald-500/40 relative group overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Plus className="h-6 w-6 text-white stroke-[3px] relative z-10" />
            </div>

            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1"
                >
                  <h1 className="text-2xl font-black text-white tracking-tighter">
                    GPMedical <span className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">3.5</span>
                  </h1>
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
          className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm fixed top-0 left-0 right-0 z-40"
          style={{ marginLeft: sidebarOpen ? '320px' : '80px' }}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Búsqueda */}
              <div className="flex-1 max-w-2xl">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar paciente, cita, examen, reporte..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-sm"
                  />
                </form>
              </div>

              {/* Acciones del header */}
              <div className="flex items-center space-x-4">
                {/* Indicador de Salud IA */}
                <div className="hidden sm:block">
                  <AIHealthIndicator />
                </div>

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
                  <button className="p-2 text-gray-600 hover:text-primary transition-colors relative">
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
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-medium text-gray-900">
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
        className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 overflow-y-auto relative"
        style={{
          marginLeft: sidebarOpen ? '320px' : '80px',
          marginTop: (location.pathname.includes('/dashboard') || location.pathname.includes('/ia')) ? '0' : '80px',
          height: (location.pathname.includes('/dashboard') || location.pathname.includes('/ia')) ? '100vh' : 'calc(100vh - 80px)',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container mx-auto px-6 py-8 min-h-full flex flex-col">
          <Breadcrumbs />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1"
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
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

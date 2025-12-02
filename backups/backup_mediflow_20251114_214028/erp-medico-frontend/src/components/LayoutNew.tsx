// Layout principal con sistema de roles y sidebar espectacular
import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Bell, 
  User, 
  LogOut,
  Settings,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Activity
} from 'lucide-react'
import { SpectacularSidebar } from '@/components/navigation/SpectacularSidebar'
import { isHcRxV2Enabled, setHcRxV2Enabled } from '@/lib/flags'
import { usePreferences } from '@/hooks/usePreferences'
import { ChatbotSuperinteligente } from '@/components/ChatbotSuperinteligente'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { ROLE_LABELS, ROLE_COLORS } from '@/types/auth'
import toast from 'react-hot-toast'

interface LayoutProps {
  children?: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, hasPermission, isAuthenticated, loading } = useAuth()
  const { prefs, updatePreferences } = usePreferences(user)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications] = useState(5)
  const [darkMode, setDarkMode] = useState(false)
  // Sincronizar tema con preferencias al cargar usuario
  useEffect(() => {
    if (user && prefs.theme) {
      setDarkMode(prefs.theme === 'dark')
      if (prefs.theme === 'system') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        setDarkMode(mq.matches)
      }
    }
  }, [user, prefs.theme])

  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  // NOTA IMPORTANTE SOBRE HOOKS:
  // Evitamos returns tempranos antes de que todos los hooks se hayan ejecutado
  // para no cambiar el número/orden de hooks entre renders.

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

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast.success(`Buscando: ${searchQuery}`)
    }
  }

  // Nueva cita
  const handleNewAppointment = () => {
    if (hasPermission('citas', 'create')) {
      navigate('/agenda/nueva')
      toast.success('Nueva cita')
    } else {
      toast.error('No tienes permiso para crear citas')
    }
  }

  // Logout
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    updatePreferences('theme', next ? 'dark' : 'light')
    toast.success(next ? 'Modo oscuro activado' : 'Modo claro activado')
  }

  const canCreateAppointment = hasPermission('citas', 'create')
  const v2 = isHcRxV2Enabled()

  // Asegura que el nuevo diseño V2 esté activo por defecto si no hay preferencia previa
  useEffect(() => {
    try {
      const current = window.localStorage.getItem('HC_RX_V2')
      if (current === null) {
        setHcRxV2Enabled(true)
      }
    } catch {}
  }, [])

  return (
    <>
      {/* Gate de autenticación y carga sin returns tempranos */}
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
          />
        </div>
      ) : !isAuthenticated ? (
        <Navigate to="/login" replace />
      ) : (
        <div
          className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-gradient-to-br from-gray-50 to-green-50'}`}
          data-hc-rx-v2={v2 ? 'true' : undefined}
        >
          {/* Sidebar Espectacular Fijo */}
          <SpectacularSidebar />

          {/* Contenido principal con margen para el sidebar */}
          <div className="ml-72">
        {/* Header Superior con glassmorphism */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700 shadow-lg"
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Búsqueda avanzada */}
              <div className="flex-1 max-w-2xl">
                <form onSubmit={handleSearch} className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar paciente, cita, examen, reporte..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                  />
                  <kbd className="absolute right-4 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded">
                    Ctrl+K
                  </kbd>
                </form>
              </div>

              {/* Acciones del header */}
              <div className="flex items-center space-x-3">
                {/* Botón nueva cita con animación */}
                {canCreateAppointment && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNewAppointment}
                    className="bg-gradient-to-r from-primary to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 font-semibold text-sm group"
                  >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    <span>Nueva Cita</span>
                  </motion.button>
                )}

                {/* Modo oscuro */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                  title={darkMode ? 'Modo claro' : 'Modo oscuro'}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </motion.button>

                {/* Fullscreen */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleFullscreen}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                  title="Pantalla completa"
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </motion.button>

                {/* Notificaciones con badge animado */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                  title="Notificaciones"
                >
                  <Bell size={20} />
                  {notifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {notifications}
                    </motion.span>
                  )}
                </motion.button>

                {/* Menú de usuario */}
                <div className="relative" data-user-menu>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 pr-4 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 hover:shadow-md transition-all border border-gray-200 dark:border-slate-600"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${ROLE_COLORS[user.rol]} flex items-center justify-center text-white font-bold shadow-lg`}>
                      {user.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user.nombre}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ROLE_LABELS[user.rol]}
                      </p>
                    </div>
                  </motion.button>

                  {/* Dropdown del usuario */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user.nombre} {user.apellido_paterno}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {user.email}
                          </p>
                          <Badge className={`mt-2 ${ROLE_COLORS[user.rol]} text-white`}>
                            {ROLE_LABELS[user.rol]}
                          </Badge>
                        </div>

                        <div className="py-2">
                          <button
                            onClick={() => {
                              navigate('/perfil')
                              setShowUserMenu(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-3 transition-colors"
                          >
                            <User size={18} />
                            <span className="text-sm">Mi Perfil</span>
                          </button>

                          <button
                            onClick={() => {
                              navigate('/configuracion')
                              setShowUserMenu(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-3 transition-colors"
                          >
                            <Settings size={18} />
                            <span className="text-sm">Configuración</span>
                          </button>

                          <button
                            onClick={() => {
                              navigate('/actividad')
                              setShowUserMenu(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-3 transition-colors"
                          >
                            <Activity size={18} />
                            <span className="text-sm">Mi Actividad</span>
                          </button>
                        </div>

                        <div className="border-t border-gray-200 dark:border-slate-700 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 transition-colors text-red-600 dark:text-red-400"
                          >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Cerrar Sesión</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

  {/* Área de contenido principal */}
  <main className="p-6 min-h-[calc(100vh-80px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children || <Outlet />}
          </motion.div>
        </main>

        {/* Chatbot superinteligente */}
        <ChatbotSuperinteligente />
      </div>
    </div>
      )}
    </>
  )
}

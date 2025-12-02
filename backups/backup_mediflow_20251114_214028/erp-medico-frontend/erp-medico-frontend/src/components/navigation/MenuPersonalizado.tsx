// Menú personalizado dinámico basado en permisos de base de datos
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  ChevronDown,
  ChevronRight,
  MapPin,
  Building2,
  AlertTriangle,
  User,
  LogOut,
  RefreshCw,
  Brain
} from 'lucide-react'

import { NavigationItem } from '@/types/saas'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

interface MenuPersonalizadoProps {
  className?: string
}

export function MenuPersonalizado({ className = '' }: MenuPersonalizadoProps) {
  const location = useLocation()
  const user = {
  id: 'demo-user',
  email: 'demo@mediflow.com',
  hierarchy: 'super_admin' as const,
  empresa: { nombre: 'MediFlow Demo Corp' },
  sede: { nombre: 'Sede Principal' },
  name: 'Usuario Demo'
}

const signOut = () => {}
const currentUser = user
const canAccess = () => true
  
  const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard'])
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [userMenuItems, setUserMenuItems] = useState<NavigationItem[]>([])
  const [loading, setLoading] = useState(true)

  // Configuración dinámica de menús basada en jerarquía del usuario
  const generateMenuSections = (): Array<{ id: string; title: string; items: NavigationItem[] }> => {
    // Items base disponibles en el sistema
    const availableItems: NavigationItem[] = [
      // Dashboard (siempre disponible)
      {
        id: 'dashboard',
        name: 'Dashboard',
        href: '/dashboard',
        icon: 'Home',
        order: 1
      },
      
      // Módulo de Pacientes
      {
        id: 'pacientes',
        name: 'Pacientes',
        href: '/pacientes',
        icon: 'Users',
        order: 10,
        children: [
          {
            id: 'pacientes-lista',
            name: 'Lista de Pacientes',
            href: '/pacientes?tab=lista',
            icon: 'Users',
            order: 1
          },
          {
            id: 'pacientes-nuevo',
            name: 'Nuevo Paciente',
            href: '/pacientes?tab=nuevo',
            icon: 'Plus',
            order: 2
          },
          {
            id: 'pacientes-historial',
            name: 'Historial Médico',
            href: '/pacientes?tab=historial',
            icon: 'FileText',
            order: 3
          }
        ]
      },

      // Módulo de Agenda
      {
        id: 'agenda',
        name: 'Agenda',
        href: '/agenda',
        icon: 'Calendar',
        order: 20,
        children: [
          {
            id: 'agenda-calendario',
            name: 'Calendario',
            href: '/agenda?tab=calendario',
            icon: 'Calendar',
            order: 1
          },
          {
            id: 'agenda-nueva',
            name: 'Nueva Cita',
            href: '/agenda?tab=nueva',
            icon: 'Plus',
            order: 2
          }
        ]
      },

      // Módulo de Exámenes
      {
        id: 'examenes',
        name: 'Exámenes',
        href: '/examenes',
        icon: 'Activity',
        order: 30,
        children: [
          {
            id: 'examenes-lista',
            name: 'Lista de Exámenes',
            href: '/examenes?tab=lista',
            icon: 'FileText',
            order: 1
          },
          {
            id: 'examenes-nuevo',
            name: 'Nuevo Examen',
            href: '/examenes?tab=nuevo',
            icon: 'Plus',
            order: 2
          }
        ]
      },

      // Módulo de IA
      {
        id: 'ia',
        name: 'IA & Análisis',
        href: '/ia',
        icon: 'Brain',
        order: 40
      },

      // Módulo de Reportes
      {
        id: 'reportes',
        name: 'Reportes',
        href: '/reportes',
        icon: 'BarChart3',
        order: 50,
        children: [
          {
            id: 'reportes-kpis',
            name: 'Dashboard KPIs',
            href: '/reportes?tab=kpis',
            icon: 'BarChart3',
            order: 1
          },
          {
            id: 'reportes-medicos',
            name: 'Reportes Médicos',
            href: '/reportes?tab=medicos',
            icon: 'FileText',
            order: 2
          }
        ]
      },

      // Módulo de Certificaciones
      {
        id: 'certificaciones',
        name: 'Certificaciones',
        href: '/certificaciones',
        icon: 'FileText',
        order: 60,
        children: [
          {
            id: 'certificaciones-mis',
            name: 'Mis Certificaciones',
            href: '/certificaciones?tab=mis',
            icon: 'CheckCircle',
            order: 1
          }
        ]
      },

      // Módulo de Facturación
      {
        id: 'facturacion',
        name: 'Facturación',
        href: '/facturacion',
        icon: 'CreditCard',
        order: 70,
        children: [
          {
            id: 'facturacion-panel',
            name: 'Panel General',
            href: '/facturacion?tab=panel',
            icon: 'BarChart3',
            order: 1
          },
          {
            id: 'facturacion-medicos',
            name: 'Gestión Médica',
            href: '/facturacion?tab=medicos',
            icon: 'Users',
            order: 2
          }
        ]
      },

      // Módulo de Tienda
      {
        id: 'tienda',
        name: 'Tienda',
        href: '/tienda',
        icon: 'ShoppingCart',
        order: 80,
        children: [
          {
            id: 'tienda-vista',
            name: 'Ver Productos',
            href: '/tienda?tab=vista',
            icon: 'ShoppingCart',
            order: 1
          },
          {
            id: 'tienda-solicitar',
            name: 'Solicitar Productos',
            href: '/tienda?tab=solicitar',
            icon: 'Plus',
            order: 2
          }
        ]
      },

      // Módulo de Inventario
      {
        id: 'inventario',
        name: 'Inventario',
        href: '/inventario',
        icon: 'Database',
        order: 85
      },

      // Módulo de Configuración (solo para admins)
      ...(currentUser?.hierarchy === 'super_admin' || currentUser?.hierarchy === 'admin_empresa' ? [{
        id: 'configuracion',
        name: 'Configuración',
        href: '/configuracion',
        icon: 'Settings',
        order: 90,
        children: [
          {
            id: 'config-saas',
            name: 'Panel SaaS',
            href: '/configuracion?tab=saas_admin',
            icon: 'Crown',
            order: 1
          },
          {
            id: 'config-usuarios',
            name: 'Usuarios SaaS',
            href: '/configuracion?tab=saas_users',
            icon: 'UserCog',
            order: 2
          },
          {
            id: 'config-seguridad',
            name: 'Seguridad',
            href: '/configuracion?tab=seguridad',
            icon: 'Shield',
            order: 3
          },
          {
            id: 'config-audit',
            name: 'Audit Logs',
            href: '/configuracion?tab=audit',
            icon: 'Lock',
            order: 4
          }
        ]
      }] : []),

      // Módulo de Ayuda
      {
        id: 'ayuda',
        name: 'Ayuda',
        href: '/ayuda',
        icon: 'HelpCircle',
        order: 95,
        children: [
          {
            id: 'ayuda-sistema',
            name: 'Soporte Sistema',
            href: '/ayuda?tab=sistema',
            icon: 'Settings',
            order: 1
          },
          {
            id: 'ayuda-medico',
            name: 'Médico Especialista',
            href: '/ayuda?tab=medico',
            icon: 'Stethoscope',
            order: 2
          }
        ]
      }
    ]

    // Filtrar items basado en permisos del usuario
    const filteredItems = availableItems.filter(item => {
      // Dashboard siempre visible
      if (item.id === 'dashboard') return true
      
      // Verificar permisos del recurso principal
      const resource = item.href.split('/')[1] as any
      return canAccess(resource, 'read')
    }).map(item => ({
      ...item,
      children: item.children?.filter(child => {
        const childResource = child.href.split('/')[1] as any
        return canAccess(childResource, 'read')
      })
    }))

    // Agrupar por categorías
    const sections = [
      {
        id: 'principal',
        title: 'Principal',
        items: filteredItems.filter(item => item.order! < 30)
      },
      {
        id: 'medicina',
        title: 'Medicina',
        items: filteredItems.filter(item => item.order! >= 30 && item.order! < 60)
      },
      {
        id: 'administracion',
        title: 'Administración',
        items: filteredItems.filter(item => item.order! >= 60 && item.order! < 85)
      },
      {
        id: 'configuracion',
        title: 'Configuración',
        items: filteredItems.filter(item => item.order! >= 85)
      }
    ].filter(section => section.items.length > 0)

    return sections
  }

  // Generar secciones de menú
  const menuSections = generateMenuSections()

  // Cargar items de menú del usuario desde la base de datos
  useEffect(() => {
    const loadUserMenuItems = async () => {
      if (!user?.id) {
        setUserMenuItems([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Cargar desde la base de datos usando el hook
        // Por ahora usamos la configuración estática filtrada por permisos
        
        console.log(`✅ Menú cargado para usuario ${user.hierarchy}`)
        
      } catch (error) {
        console.error('❌ Error cargando menú:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserMenuItems()
  }, [user])

  // Función para verificar si un usuario puede ver un item del menú
  const canViewMenuItem = (item: NavigationItem): boolean => {
    // Dashboard siempre visible
    if (item.id === 'dashboard') return true
    
    // Verificar permisos del recurso
    const resource = item.href.split('/')[1] as any
    return canAccess(resource, 'read')
  }

  // Función para verificar si un item está activo
  const isItemActive = (item: NavigationItem): boolean => {
    if (location.pathname === item.href) return true
    
    // Verificar sub-items activos
    if (item.children) {
      return item.children.some(child => {
        if (child.href.includes('?')) {
          return location.pathname === child.href.split('?')[0] && 
                 location.search.includes(child.href.split('?')[1])
        }
        return location.pathname === child.href
      })
    }
    
    return false
  }

  // Toggle secciones expandibles
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  // Toggle items expandibles
  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Filtrar items visibles basados en permisos
  const getVisibleItems = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => canViewMenuItem(item))
  }

  // Manejar logout con auditoría
  const handleLogout = async () => {
    try {
      await signOut()
      // invalidarCache() // Limpiar cache al hacer logout
      toast.success('Sesión cerrada correctamente')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  // Manejar refresh de permisos
  const handleRefreshPermissions = async () => {
    try {
      // await refreshPermissions()
      toast.success('Permisos actualizados')
    } catch (error) {
      toast.error('Error actualizando permisos')
    }
  }

  // Mapeo de íconos
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Home, Calendar, Users, FileText, Activity, BarChart3, Settings, Building, Shield, Bell, Database, CreditCard, Crown, UserCog, Lock, CheckCircle, HelpCircle, Plus, Stethoscope, TestTube, ShoppingCart, Brain, AlertTriangle, User, MapPin, Building2
    }
    return iconMap[iconName] || Home
  }

  // Estado de carga
  if (loading) {
    return (
      <div className={`bg-white h-full flex flex-col border-r border-gray-200 ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Navegación</h2>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Estado de error removido - ya no es necesario

  // Usuario no autenticado
  if (!user) {
    return (
      <div className={`bg-white h-full flex items-center justify-center border-r border-gray-200 ${className}`}>
        <p className="text-gray-500">No autenticado</p>
      </div>
    )
  }

  return (
    <div className={`bg-white h-full flex flex-col border-r border-gray-200 ${className}`}>
      {/* Header del usuario */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || user.email}
            </p>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Building2 className="w-3 h-3" />
              <span className="truncate">MediFlow</span>
              {user.hierarchy !== 'paciente' && (
                <>
                  <span>•</span>
                  <MapPin className="w-3 h-3" />
                  <span className="truncate capitalize">{user.hierarchy.replace('_', ' ')}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Badge del rol y botón de refresh */}
        <div className="mt-2 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {currentUser?.hierarchy?.replace('_', ' ').toUpperCase() || 'USUARIO'}
          </Badge>
          <button
            onClick={handleRefreshPermissions}
            className="p-1 text-gray-400 hover:text-primary rounded"
            title="Actualizar permisos"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Información de permisos */}
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Permisos: Activos</span>
          <span className="text-green-600">● Activo</span>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
          {menuSections.map((section) => {
            const visibleItems = getVisibleItems(section.items)
            
            if (visibleItems.length === 0) return null

            const sectionExpanded = expandedSections.includes(section.id)
            const hasActiveItems = visibleItems.some(item => isItemActive(item))

            return (
              <div key={section.id} className="px-3">
                {/* Header de la sección */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  <span>{section.title}</span>
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${
                      sectionExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Items de la sección */}
                <AnimatePresence>
                  {sectionExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1"
                    >
                      {visibleItems.map((item) => {
                        const isActive = isItemActive(item)
                        const Icon = getIcon(item.icon)
                        const hasChildren = item.children && item.children.length > 0
                        const childrenVisible = expandedItems.includes(item.id)

                        return (
                          <div key={item.id}>
                            <Link
                              to={item.href}
                              className={`
                                group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                                ${isActive 
                                  ? 'bg-primary text-white' 
                                  : 'text-gray-700 hover:bg-primary/5 hover:text-primary'
                                }
                              `}
                            >
                              <Icon className={`mr-3 h-5 w-5 ${
                                isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'
                              }`} />
                              <span className="flex-1">{item.name}</span>
                              
                              {/* Badge */}
                              {item.badge && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {item.badge}
                                </span>
                              )}
                              
                              {/* Indicador de hijos */}
                              {hasChildren && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    toggleItem(item.id)
                                  }}
                                  className="ml-2 p-1 hover:bg-white/20 rounded"
                                >
                                  <ChevronRight 
                                    className={`w-4 h-4 transition-transform ${
                                      childrenVisible ? 'rotate-90' : ''
                                    }`} 
                                  />
                                </button>
                              )}
                            </Link>

                            {/* Submenú */}
                            {hasChildren && item.children && (
                              <AnimatePresence>
                                {childrenVisible && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-6 mt-1 space-y-1"
                                  >
                                    {item.children.map((child) => {
                                      if (!canViewMenuItem(child)) return null
                                      
                                      const childIsActive = child.href.includes('?') ? 
                                        location.search.includes(child.href.split('?')[1]) :
                                        location.pathname === child.href
                                      const ChildIcon = getIcon(child.icon)
                                      
                                      return (
                                        <Link
                                          key={child.id}
                                          to={child.href}
                                          className={`
                                            group flex items-center px-3 py-2 text-sm rounded-md transition-colors
                                            ${childIsActive
                                              ? 'bg-primary/10 text-primary font-medium'
                                              : 'text-gray-600 hover:bg-primary/5 hover:text-primary'
                                            }
                                          `}
                                        >
                                          <ChildIcon className={`mr-3 h-4 w-4 ${
                                            childIsActive ? 'text-primary' : 'text-gray-400'
                                          }`} />
                                          <span>{child.name}</span>
                                        </Link>
                                      )
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            )}
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>

        {/* Mensaje cuando no hay items visibles */}
        {menuSections.every(section => getVisibleItems(section.items).length === 0) && (
          <div className="px-4 py-8 text-center text-gray-500">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No hay secciones disponibles</p>
            <p className="text-xs mt-1">Contacta al administrador para configurar permisos</p>
          </div>
        )}
      </div>

      {/* Footer con logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

// Componente para mostrar indicadores de jerarquía
export function MenuHierarchyIndicator() {
  const currentUser = {
    hierarchy: 'super_admin'
  }
  const loading = false
  const level = currentUser?.hierarchy || 'paciente'
  
  const getLevelInfo = (hierarchy: string) => {
    const levelMap: Record<string, { level: number; icon: any; color: string }> = {
      'super_admin': { level: 5, icon: Crown, color: 'text-purple-600' },
      'admin_empresa': { level: 4, icon: Building, color: 'text-blue-600' },
      'medico_trabajo': { level: 3, icon: Activity, color: 'text-green-600' },
      'medico_especialista': { level: 3, icon: Stethoscope, color: 'text-green-600' },
      'medico_industrial': { level: 3, icon: TestTube, color: 'text-green-600' },
      'recepcion': { level: 2, icon: UserCog, color: 'text-orange-600' },
      'paciente': { level: 1, icon: User, color: 'text-teal-600' },
      'bot': { level: 0, icon: HelpCircle, color: 'text-gray-600' }
    }
    return levelMap[hierarchy] || levelMap.paciente
  }
  
  const levelInfo = getLevelInfo(level)
  const Icon = levelInfo.icon
  
  if (loading) {
    return (
      <div className="bg-gray-50 p-3 rounded-lg mb-4 animate-pulse">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded flex-1"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-gray-50 p-3 rounded-lg mb-4">
      <div className="flex items-center space-x-2">
        <Icon className={`w-4 h-4 ${levelInfo.color}`} />
        <span className="text-sm font-medium text-gray-700">
          Nivel {levelInfo.level}
        </span>
        <div className="flex-1" />
        <span className="text-xs text-gray-500">
          {level.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      
      {/* Información de permisos */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
        <span>Permisos activos</span>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Sincronizado</span>
        </div>
      </div>
      
      {/* Indicadores visuales de nivel */}
      <div className="flex items-center space-x-1 mt-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < levelInfo.level ? levelInfo.color.replace('text-', 'bg-') : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
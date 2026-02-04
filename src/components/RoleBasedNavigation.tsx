// Componente para navegación con permisos por rol
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserRole } from '@/types/auth'

import { motion, AnimatePresence } from 'framer-motion'

interface NavigationItem {
  name: string
  icon: React.ComponentType<any>
  path: string
  badge?: string | number | null
  roles?: string[]
  permissions?: string[]
}

interface Section {
  section: string
  items: NavigationItem[]
}

interface RoleBasedNavigationProps {
  navigationItems: Section[]
  sidebarOpen?: boolean
}

// Configuración de permisos por módulo - SaaS Multi-Tenant
const MODULE_PERMISSIONS = {
  dashboard: {
    roles: ['super_admin', 'admin_saas', 'contador_saas', 'admin_empresa', 'medico', 'enfermera', 'recepcion', 'asistente', 'paciente'],
    permissions: []
  },
  pacientes: {
    roles: ['super_admin', 'admin_saas', 'admin_empresa', 'medico', 'enfermera', 'recepcion', 'asistente'],
    permissions: ['patients_manage']
  },
  agenda: {
    roles: ['super_admin', 'admin_saas', 'admin_empresa', 'medico', 'enfermera', 'recepcion', 'asistente'],
    permissions: []
  },
  examenes: {
    roles: ['super_admin', 'admin_saas', 'admin_empresa', 'medico'],
    permissions: ['exams_manage']
  },
  'rayos-x': {
    roles: ['super_admin', 'admin_saas', 'admin_empresa', 'medico'],
    permissions: ['medical_view', 'exams_manage']
  },
  evaluaciones: {
    roles: ['super_admin', 'admin_saas', 'admin_empresa', 'medico'],
    permissions: ['exams_manage']
  },
  ia: {
    roles: ['super_admin', 'admin_saas', 'admin_empresa', 'medico'],
    permissions: ['medical_view']
  },
  certificaciones: {
    roles: ['super_admin', 'admin_saas', 'admin_empresa', 'medico'],
    permissions: ['exams_manage']
  },
  inventario: {
    roles: ['super_admin', 'admin_saas', 'admin_empresa'],
    permissions: ['inventory_manage']
  },
  facturacion: {
    roles: ['super_admin', 'admin_saas', 'contador_saas', 'admin_empresa', 'recepcion'],
    permissions: ['billing_view']
  },
  reportes: {
    roles: ['super_admin', 'admin_saas', 'contador_saas', 'admin_empresa', 'medico'],
    permissions: ['reports_view']
  },
  configuracion: {
    roles: ['super_admin', 'admin_empresa'],
    permissions: ['system_admin']
  }
}

export function RoleBasedNavigation({ navigationItems, sidebarOpen = true }: RoleBasedNavigationProps) {
  const user = {
    id: 'demo-user',
    email: 'demo@GPMedical.com',
    name: 'Usuario Demo',
    hierarchy: 'super_admin' as UserRole,
    empresa: { nombre: 'GPMedical Demo Corp' },
    sede: { nombre: 'Sede Principal' },
    permissions: ['*']
  }
  const navigate = useNavigate()
  const location = useLocation()

  // DEBUG: Log del usuario actual
  React.useEffect(() => {
    console.log('🔍 DEBUG RoleBasedNavigation - Usuario actual:', {
      hierarchy: user?.hierarchy,
      permissions: user?.permissions,
      name: user?.name,
      isSuperAdmin: user?.hierarchy === 'super_admin',
      hasStarPermission: user?.permissions.includes('*'),
      isMedico: user?.hierarchy === 'medico',
      hasMedicalView: user?.permissions?.includes('medical_view'),
      hasBillingView: user?.permissions?.includes('billing_view'),
      hasPatientsManage: user?.permissions?.includes('patients_manage')
    })

    // DEBUG ESPECÍFICO PARA MÉDICO
    if (user?.hierarchy === 'medico') {
      console.log('👨‍⚕️ MÉDICO CARGADO - Verificando permisos:')
      console.log('  ✅ Tiene medical_view:', user.permissions.includes('medical_view'))
      console.log('  ✅ Tiene patients_manage:', user.permissions.includes('patients_manage'))
      console.log('  ✅ Tiene exams_manage:', user.permissions.includes('exams_manage'))
      console.log('  ✅ Tiene reports_view:', user.permissions.includes('reports_view'))
      console.log('  ✅ Tiene agenda_manage:', user.permissions.includes('agenda_manage'))
      console.log('  ✅ Tiene billing_view:', user.permissions.includes('billing_view'))
    }
  }, [user])

  // Función auxiliar para verificar múltiples roles
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user?.hierarchy) {
      console.log('⚠️ No hay user.hierarchy')
      return false
    }
    const result = roles.includes(user.hierarchy)
    return result
  }

  // Función para verificar si el usuario tiene alguno de los permisos requeridos
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user?.permissions || permissions.length === 0) return true

    const result = permissions.some(perm => user.permissions.includes(perm))
    return result
  }

  // Función para verificar si el usuario puede acceder a una ruta
  const canAccessRoute = (path: string): boolean => {
    if (!user) {
      console.log('⚠️ No hay usuario autenticado')
      return false
    }

    // SUPER ADMIN tiene acceso a TODO sin restricciones
    if (user.hierarchy === 'super_admin' || user.permissions.includes('*')) {
      console.log(`✅ Super admin tiene acceso total a ${path}`)
      return true
    }

    // DEBUG DETALLADO: Log completo del usuario y el path
    console.log(`🔍 Verificando acceso para usuario ${user.hierarchy} a ${path}`)
    console.log('  - Hierarchy:', user.hierarchy)
    console.log('  - Permisos:', user.permissions)

    // LÓGICA ESPECIAL PARA MÉDICO - MÁS PERMISIVO
    if (user.hierarchy === 'medico') {
      console.log('👨‍⚕️ MÉDICO - Aplicando lógica permisiva especial')

      // Si es médico y tiene medical_view, permitir acceso a TODAS las secciones médicas
      const isMedicalRoute = ['dashboard', 'pacientes', 'agenda', 'examenes', 'rayos-x', 'evaluaciones', 'ia', 'certificaciones', 'reportes'].includes(path.replace('/dashboard/', '').replace('/dashboard', 'dashboard'))

      if (isMedicalRoute && (user.permissions.includes('medical_view') || user.permissions.includes('patients_manage') || user.permissions.includes('exams_manage'))) {
        console.log('✅ MÉDICO: Acceso permitido por lógica médica especial')
        return true
      }

      // Para facturación, verificar billing_view
      if (path.includes('facturacion') && user.permissions.includes('billing_view')) {
        console.log('✅ MÉDICO: Acceso a facturación permitido por billing_view')
        return true
      }
    }

    // Mapear path a key de permisos - eliminar /dashboard/ prefix si existe
    let pathKey = path.replace('/dashboard/', '').replace('/dashboard', 'dashboard')
    if (pathKey === '' || pathKey === '/') pathKey = 'dashboard'

    const moduleConfig = MODULE_PERMISSIONS[pathKey as keyof typeof MODULE_PERMISSIONS]

    if (!moduleConfig) {
      // Si no hay configuración específica, permitir acceso por defecto para usuarios autenticados
      console.log(`✅ Permitiendo acceso a ${path} (sin config específica)`)
      return true
    }

    // Verificar roles
    const hasRequiredRole = moduleConfig.roles.length === 0 || hasAnyRole(moduleConfig.roles)

    if (!hasRequiredRole) {
      console.log(`❌ Usuario ${user.hierarchy} no tiene rol requerido para ${path}. Roles requeridos:`, moduleConfig.roles)
      return false
    }

    // Verificar permisos específicos
    if (moduleConfig.permissions.length > 0) {
      const hasRequiredPermissions = hasAnyPermission(moduleConfig.permissions)

      if (!hasRequiredPermissions) {
        console.log(`❌ Usuario no tiene permisos para ${path}. Permisos requeridos:`, moduleConfig.permissions, 'Usuario tiene:', user.permissions)
        return false
      }
    }

    console.log(`✅ Acceso permitido a ${path}`)
    return true
  }

  // Filtrar items de navegación según permisos
  const filteredNavigationItems = navigationItems.map(section => ({
    ...section,
    items: section.items.filter(item => canAccessRoute(item.path))
  })).filter(section => section.items.length > 0) // Remover secciones vacías

  // DEBUG: Log de items filtrados
  React.useEffect(() => {
    console.log('📋 Items de navegación filtrados:', {
      totalSections: filteredNavigationItems.length,
      totalOriginalSections: navigationItems.length,
      sections: filteredNavigationItems.map(s => ({
        name: s.section,
        itemCount: s.items.length,
        items: s.items.map(i => i.name)
      })),
      originalItems: navigationItems.map(s => ({
        name: s.section,
        itemCount: s.items.length,
        items: s.items.map(i => i.name)
      }))
    })
  }, [filteredNavigationItems.length, navigationItems.length, user?.hierarchy])

  if (!user) {
    console.log('⚠️ RoleBasedNavigation: No hay usuario, retornando null')
    return null
  }

  if (filteredNavigationItems.length === 0) {
    console.error('❌ PROBLEMA CRÍTICO: No hay items de navegación para mostrar!')
    console.log('Usuario:', {
      hierarchy: user.hierarchy,
      permissions: user.permissions
    })

    // FALLBACK: Mostrar menú básico para cualquier usuario autenticado
    console.log('🔄 Mostrando menú básico como fallback')
    const basicItems = navigationItems.map(section => ({
      ...section,
      items: section.items.map(item => ({
        ...item,
        path: item.path // Mantener paths originales
      }))
    })).filter(section => section.items.length > 0)

    return (
      <div className="space-y-6">
        {basicItems.map((section) => (
          <div key={section.section}>
            {sidebarOpen && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                {section.section}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 hover:bg-primary/5 hover:text-primary"
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} className="flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="whitespace-nowrap overflow-hidden">
                        {item.name}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {filteredNavigationItems.map((section) => (
        <div key={section.section}>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1"
              >
                {section.section}
              </motion.h3>
            )}
          </AnimatePresence>
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <motion.button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-primary/5 hover:text-primary'
                    }`}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} className="flex-shrink-0" />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {item.badge && sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`px-2 py-0.5 text-xs rounded-full font-medium ${isActive ? 'bg-white/20 text-white' : 'bg-primary text-white'
                          }`}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Hook para verificar permisos específicos
export function useModulePermission(modulePath: string) {
  const user = {
    id: 'demo-user',
    email: 'demo@GPMedical.com',
    name: 'Usuario Demo',
    hierarchy: 'super_admin' as UserRole,
    empresa: { nombre: 'GPMedical Demo Corp' },
    sede: { nombre: 'Sede Principal' },
    permissions: ['*']
  }

  // Función auxiliar para verificar múltiples roles
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user?.hierarchy) return false
    return roles.includes(user.hierarchy)
  }

  const canAccess = React.useCallback((): boolean => {
    if (!user) return false

    // SUPER ADMIN tiene acceso a TODO sin restricciones
    if (user.hierarchy === 'super_admin' || user.permissions.includes('*')) {
      console.log(`✅ Hook useModulePermission: Super admin acceso total a ${modulePath}`)
      return true
    }

    // LÓGICA ESPECIAL PARA MÉDICO
    if (user.hierarchy === 'medico') {
      // Si es médico y tiene medical_view, permitir acceso a TODAS las secciones médicas
      const pathKey = modulePath.replace('/dashboard/', '').replace('/dashboard', 'dashboard')
      const isMedicalRoute = ['dashboard', 'pacientes', 'agenda', 'examenes', 'rayos-x', 'evaluaciones', 'ia', 'certificaciones', 'reportes'].includes(pathKey)

      if (isMedicalRoute && (user.permissions.includes('medical_view') || user.permissions.includes('patients_manage') || user.permissions.includes('exams_manage'))) {
        console.log(`✅ Hook useModulePermission: MÉDICO acceso especial a ${modulePath}`)
        return true
      }

      // Para facturación
      if (pathKey === 'facturacion' && user.permissions.includes('billing_view')) {
        console.log(`✅ Hook useModulePermission: MÉDICO acceso a facturación ${modulePath}`)
        return true
      }
    }

    // Mapear path a key de permisos - eliminar /dashboard/ prefix si existe
    let pathKey = modulePath.replace('/dashboard/', '').replace('/dashboard', 'dashboard')
    if (pathKey === '' || pathKey === '/') pathKey = 'dashboard'

    const moduleConfig = MODULE_PERMISSIONS[pathKey as keyof typeof MODULE_PERMISSIONS]

    if (!moduleConfig) {
      return true // Permitir acceso si no hay configuración específica
    }

    const hasRequiredRole = moduleConfig.roles.length === 0 ||
      hasAnyRole(moduleConfig.roles)

    if (!hasRequiredRole) {
      console.log(`❌ Hook useModulePermission: Usuario ${user.hierarchy} no tiene rol para ${modulePath}`)
      return false
    }

    if (moduleConfig.permissions.length > 0) {
      const hasPermission = moduleConfig.permissions.some(permission =>
        user.permissions.includes(permission)
      )
      if (!hasPermission) {
        console.log(`❌ Hook useModulePermission: Usuario no tiene permisos para ${modulePath}`)
        return false
      }
    }

    console.log(`✅ Hook useModulePermission: Acceso permitido a ${modulePath}`)
    return true
  }, [modulePath, user, hasAnyRole])

  return { canAccess }
}

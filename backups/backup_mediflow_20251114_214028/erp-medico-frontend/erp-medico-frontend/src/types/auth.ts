// Sistema de autenticación y roles para MediFlow
export type UserRole = 'super_admin' | 'admin_empresa' | 'medico' | 'paciente'

export interface User {
  id: string
  email: string
  nombre: string
  apellido_paterno: string
  apellido_materno?: string
  rol: UserRole
  empresa_id?: string
  sede_id?: string
  avatar_url?: string
  telefono?: string
  cedula_profesional?: string
  especialidad?: string
  created_at?: string
  last_login?: string
}

export interface Empresa {
  id: string
  nombre: string
  rfc?: string
  direccion?: string
  telefono?: string
  email?: string
  logo_url?: string
  plan: 'basico' | 'profesional' | 'enterprise'
  activo: boolean
}

export interface Sede {
  id: string
  empresa_id: string
  nombre: string
  direccion?: string
  telefono?: string
  encargado_id?: string
}

// Definición de permisos por rol
export interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[]
}

// Permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // Acceso al Dashboard central
    { resource: 'dashboard', actions: ['read', 'manage'] },
    { resource: 'empresas', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'usuarios', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'sedes', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'pacientes', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'citas', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'examenes', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'reportes', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'facturacion', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'inventario', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'configuracion', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'analytics', actions: ['read', 'manage'] },
    { resource: 'sistema', actions: ['manage'] }
  ],
  admin_empresa: [
    // Dashboard de gestión para empresa
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'usuarios', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'sedes', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'pacientes', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'citas', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'examenes', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reportes', actions: ['create', 'read', 'update'] },
    { resource: 'facturacion', actions: ['create', 'read', 'update'] },
    { resource: 'inventario', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'configuracion', actions: ['read', 'update'] },
    { resource: 'analytics', actions: ['read'] }
  ],
  medico: [
    // Dashboard personal del médico
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'pacientes', actions: ['create', 'read', 'update'] },
    { resource: 'citas', actions: ['create', 'read', 'update'] },
    { resource: 'examenes', actions: ['create', 'read', 'update'] },
    { resource: 'reportes', actions: ['create', 'read'] },
    { resource: 'certificaciones', actions: ['create', 'read'] },
    { resource: 'evaluaciones', actions: ['create', 'read', 'update'] },
    { resource: 'inventario', actions: ['read'] }
  ],
  paciente: [
    // Dashboard básico del paciente (resumen)
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'citas', actions: ['create', 'read'] },
    { resource: 'examenes', actions: ['read'] },
    { resource: 'reportes', actions: ['read'] },
    { resource: 'perfil', actions: ['read', 'update'] }
  ]
}

// Función para verificar permisos
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  const resourcePermission = rolePermissions.find(p => p.resource === resource)
  
  if (!resourcePermission) return false
  
  return resourcePermission.actions.includes(action)
}

// Labels legibles para roles
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrador',
  admin_empresa: 'Administrador de Empresa',
  medico: 'Médico',
  paciente: 'Paciente'
}

// Colores por rol
export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-purple-500',
  admin_empresa: 'bg-blue-500',
  medico: 'bg-green-500',
  paciente: 'bg-orange-500'
}

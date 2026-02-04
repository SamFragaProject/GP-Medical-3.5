// Sistema de autenticación y roles para GPMedical - SaaS Multi-Tenant
// Nivel Plataforma: super_admin, admin_saas, contador_saas
// Nivel Empresa: admin_empresa, medico, enfermera, recepcion, asistente, paciente
export type UserRole =
  // Nivel Plataforma (SaaS)
  | 'super_admin'      // Dueño de la plataforma - Control total
  | 'admin_saas'       // Socio de negocio - Todo excepto config técnica
  | 'contador_saas'    // Finanzas del SaaS
  // Nivel Empresa (Por cada cliente)
  | 'admin_empresa'    // Cliente que contrató el servicio
  | 'medico'           // Médico del trabajo
  | 'enfermera'        // Personal de enfermería  
  | 'recepcion'        // Recepcionista
  | 'asistente'        // Asistente administrativo
  | 'paciente'         // Trabajador/Paciente

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
  empresa?: string
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

// Permisos por rol - Sistema SaaS Multi-Tenant
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // ============== NIVEL PLATAFORMA (SaaS) ==============
  super_admin: [
    // Acceso TOTAL al sistema
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
    { resource: 'sistema', actions: ['manage'] },
    { resource: 'rrhh', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'ia', actions: ['read', 'manage'] },
    { resource: 'tienda', actions: ['create', 'read', 'update', 'delete', 'manage'] }
  ],
  admin_saas: [
    // Socio - Todo EXCEPTO configuración técnica profunda
    { resource: 'dashboard', actions: ['read', 'manage'] },
    { resource: 'empresas', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'usuarios', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'sedes', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'pacientes', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'citas', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'examenes', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reportes', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'facturacion', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'inventario', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'configuracion', actions: ['read'] }, // Solo lectura de config técnica
    { resource: 'analytics', actions: ['read'] },
    { resource: 'rrhh', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'ia', actions: ['read'] },
    { resource: 'tienda', actions: ['create', 'read', 'update', 'delete'] }
  ],
  contador_saas: [
    // Solo finanzas y reportes del SaaS
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'empresas', actions: ['read'] },
    { resource: 'facturacion', actions: ['create', 'read', 'update'] },
    { resource: 'reportes', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] }
  ],

  // ============== NIVEL EMPRESA (Por cada cliente) ==============
  admin_empresa: [
    // Cliente que contrató - Gestión completa de SU empresa
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
    { resource: 'analytics', actions: ['read'] },
    { resource: 'rrhh', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'ia', actions: ['read'] },
    { resource: 'tienda', actions: ['read'] },
    { resource: 'certificaciones', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'evaluaciones', actions: ['create', 'read', 'update', 'delete', 'manage'] }
  ],
  medico: [
    // Médico del trabajo - Atención clínica
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'pacientes', actions: ['create', 'read', 'update'] },
    { resource: 'citas', actions: ['create', 'read', 'update'] },
    { resource: 'examenes', actions: ['create', 'read', 'update'] },
    { resource: 'reportes', actions: ['create', 'read'] },
    { resource: 'certificaciones', actions: ['create', 'read'] },
    { resource: 'evaluaciones', actions: ['create', 'read', 'update'] },
    { resource: 'inventario', actions: ['read'] },
    { resource: 'ia', actions: ['read'] }
  ],
  enfermera: [
    // Personal de enfermería
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'pacientes', actions: ['read', 'update'] },
    { resource: 'citas', actions: ['read', 'update'] },
    { resource: 'examenes', actions: ['read'] }
  ],
  recepcion: [
    // Recepcionista - Atención al público
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'pacientes', actions: ['create', 'read', 'update'] },
    { resource: 'citas', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'facturacion', actions: ['read'] }
  ],
  asistente: [
    // Asistente administrativo
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'pacientes', actions: ['read'] },
    { resource: 'citas', actions: ['read', 'update'] },
    { resource: 'reportes', actions: ['read'] }
  ],
  paciente: [
    // Trabajador/Paciente - Solo sus datos
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
  // Nivel Plataforma
  super_admin: 'Super Administrador',
  admin_saas: 'Administrador SaaS',
  contador_saas: 'Contador SaaS',
  // Nivel Empresa
  admin_empresa: 'Administrador de Empresa',
  medico: 'Médico del Trabajo',
  enfermera: 'Enfermera',
  recepcion: 'Recepcionista',
  asistente: 'Asistente',
  paciente: 'Paciente'
}

// Colores por rol
export const ROLE_COLORS: Record<UserRole, string> = {
  // Nivel Plataforma - Colores más intensos
  super_admin: 'bg-purple-600',
  admin_saas: 'bg-purple-500',
  contador_saas: 'bg-indigo-500',
  // Nivel Empresa
  admin_empresa: 'bg-blue-500',
  medico: 'bg-green-500',
  enfermera: 'bg-pink-500',
  recepcion: 'bg-cyan-500',
  asistente: 'bg-teal-500',
  paciente: 'bg-orange-500'
}

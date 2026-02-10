/**
 * Plantillas de Roles Predefinidos para el Sistema SaaS
 * 
 * Cuando el Super Admin selecciona un tipo de rol, estos permisos
 * se cargan automáticamente. Puede ajustarlos antes de crear el usuario.
 */

// Iconos disponibles para roles (Lucide icons)
export type RoleIcon =
    | 'Crown' | 'Building2' | 'Stethoscope' | 'Heart'
    | 'ClipboardList' | 'Users' | 'User' | 'Headphones'
    | 'Brain' | 'Activity' | 'Shield' | 'UserCog'

// Módulos del sistema disponibles
export const MODULOS_SISTEMA = [
    { codigo: 'dashboard', nombre: 'Dashboard', icono: 'LayoutDashboard', categoria: 'principal' },
    { codigo: 'pacientes', nombre: 'Pacientes', icono: 'Users', categoria: 'operativo' },
    { codigo: 'agenda', nombre: 'Agenda', icono: 'Calendar', categoria: 'operativo' },
    { codigo: 'historial_clinico', nombre: 'Historial Clínico', icono: 'FileText', categoria: 'operativo' },
    { codigo: 'examenes', nombre: 'Exámenes Médicos', icono: 'Microscope', categoria: 'operativo' },
    { codigo: 'certificaciones', nombre: 'Certificaciones', icono: 'Award', categoria: 'operativo' },
    { codigo: 'evaluaciones', nombre: 'Evaluaciones', icono: 'ClipboardCheck', categoria: 'operativo' },
    { codigo: 'farmacia', nombre: 'Farmacia', icono: 'Pill', categoria: 'administrativo' },
    { codigo: 'facturacion', nombre: 'Facturación', icono: 'Receipt', categoria: 'administrativo' },
    { codigo: 'inventario', nombre: 'Inventario', icono: 'Package', categoria: 'administrativo' },
    { codigo: 'reportes', nombre: 'Reportes', icono: 'BarChart3', categoria: 'administrativo' },
    { codigo: 'rrhh', nombre: 'Recursos Humanos', icono: 'UserPlus', categoria: 'administrativo' },
    { codigo: 'configuracion', nombre: 'Configuración', icono: 'Settings', categoria: 'configuracion' },
    { codigo: 'usuarios', nombre: 'Gestión de Usuarios', icono: 'UserCog', categoria: 'configuracion' },
    { codigo: 'analytics', nombre: 'Analytics', icono: 'TrendingUp', categoria: 'especial' },
    { codigo: 'ia', nombre: 'Asistente IA', icono: 'Brain', categoria: 'especial' },
    { codigo: 'campanias', nombre: 'Campañas Masivas', icono: 'ClipboardList', categoria: 'operativo' },
    { codigo: 'cotizaciones', nombre: 'Cotizaciones', icono: 'FileText', categoria: 'administrativo' },
    { codigo: 'cxc', nombre: 'Cuentas por Cobrar', icono: 'DollarSign', categoria: 'administrativo' },
    { codigo: 'espirometria', nombre: 'Espirometría', icono: 'Wind', categoria: 'clinico' },
    { codigo: 'vision', nombre: 'Estudios Visuales', icono: 'Eye', categoria: 'clinico' },
] as const

export type ModuloCodigo = typeof MODULOS_SISTEMA[number]['codigo']

// Acciones disponibles por módulo
export const ACCIONES = [
    { codigo: 'ver', nombre: 'Ver', descripcion: 'Puede visualizar' },
    { codigo: 'crear', nombre: 'Crear', descripcion: 'Puede crear nuevos registros' },
    { codigo: 'editar', nombre: 'Editar', descripcion: 'Puede modificar registros' },
    { codigo: 'borrar', nombre: 'Borrar', descripcion: 'Puede eliminar registros' },
    { codigo: 'exportar', nombre: 'Exportar', descripcion: 'Puede exportar datos' },
    { codigo: 'aprobar', nombre: 'Aprobar', descripcion: 'Puede aprobar documentos' },
    { codigo: 'firmar', nombre: 'Firmar', descripcion: 'Puede firmar documentos' },
    { codigo: 'imprimir', nombre: 'Imprimir', descripcion: 'Puede imprimir documentos' },
] as const

export type AccionCodigo = typeof ACCIONES[number]['codigo']

// Estructura de permisos por módulo
export interface PermisoModulo {
    modulo: ModuloCodigo
    ver: boolean
    crear: boolean
    editar: boolean
    borrar: boolean
    exportar: boolean
    aprobar: boolean
    firmar: boolean
    imprimir: boolean
}

// Plantilla de rol predefinido
export interface RolTemplate {
    id: string
    nombre: string
    descripcion: string
    icono: RoleIcon
    color: string
    gradiente: string
    nivel_jerarquia: number
    es_sistema: boolean
    permisos: PermisoModulo[]
}

// =============================================
// PLANTILLAS DE ROLES PREDEFINIDOS
// =============================================

export const ROLE_TEMPLATES: RolTemplate[] = [
    // ============ NIVEL PLATAFORMA ============
    {
        id: 'super_admin',
        nombre: 'Super Administrador',
        descripcion: 'Control total de la plataforma SaaS',
        icono: 'Crown',
        color: '#8B5CF6',
        gradiente: 'from-purple-600 to-indigo-600',
        nivel_jerarquia: 0,
        es_sistema: true,
        permisos: MODULOS_SISTEMA.map(m => ({
            modulo: m.codigo,
            ver: true, crear: true, editar: true, borrar: true,
            exportar: true, aprobar: true, firmar: true, imprimir: true
        }))
    },

    // ============ NIVEL EMPRESA ============
    {
        id: 'admin_empresa',
        nombre: 'Administrador de Empresa',
        descripcion: 'Gestión completa de su empresa',
        icono: 'Building2',
        color: '#3B82F6',
        gradiente: 'from-blue-500 to-cyan-500',
        nivel_jerarquia: 1,
        es_sistema: true,
        permisos: [
            { modulo: 'dashboard', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'pacientes', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'agenda', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'historial_clinico', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'examenes', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'certificaciones', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'evaluaciones', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'farmacia', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: true, firmar: false, imprimir: true },
            { modulo: 'facturacion', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: true, firmar: false, imprimir: true },
            { modulo: 'inventario', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'reportes', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'rrhh', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: true, firmar: false, imprimir: true },
            { modulo: 'configuracion', ver: true, crear: true, editar: true, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'usuarios', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'analytics', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'ia', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'campanias', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: true, firmar: false, imprimir: true },
            { modulo: 'cotizaciones', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: true, firmar: false, imprimir: true },
            { modulo: 'cxc', ver: true, crear: true, editar: true, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'espirometria', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'vision', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: false, firmar: false, imprimir: true },
        ]
    },

    {
        id: 'medico',
        nombre: 'Médico',
        descripcion: 'Atención clínica y seguimiento de pacientes',
        icono: 'Stethoscope',
        color: '#10B981',
        gradiente: 'from-emerald-500 to-teal-500',
        nivel_jerarquia: 2,
        es_sistema: true,
        permisos: [
            { modulo: 'dashboard', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'pacientes', ver: true, crear: true, editar: true, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'agenda', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'historial_clinico', ver: true, crear: true, editar: true, borrar: false, exportar: true, aprobar: true, firmar: true, imprimir: true },
            { modulo: 'examenes', ver: true, crear: true, editar: true, borrar: false, exportar: true, aprobar: true, firmar: true, imprimir: true },
            { modulo: 'certificaciones', ver: true, crear: true, editar: true, borrar: false, exportar: true, aprobar: true, firmar: true, imprimir: true },
            { modulo: 'evaluaciones', ver: true, crear: true, editar: true, borrar: false, exportar: true, aprobar: true, firmar: true, imprimir: true },
            { modulo: 'farmacia', ver: true, crear: true, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'facturacion', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'inventario', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'reportes', ver: true, crear: true, editar: false, borrar: false, exportar: true, aprobar: false, firmar: true, imprimir: true },
            { modulo: 'rrhh', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'configuracion', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'usuarios', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'analytics', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'ia', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'campanias', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'cotizaciones', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'cxc', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'espirometria', ver: true, crear: true, editar: true, borrar: false, exportar: true, aprobar: false, firmar: true, imprimir: true },
            { modulo: 'vision', ver: true, crear: true, editar: true, borrar: false, exportar: true, aprobar: false, firmar: true, imprimir: true },
        ]
    },

    {
        id: 'enfermera',
        nombre: 'Enfermera',
        descripcion: 'Apoyo médico y atención a pacientes',
        icono: 'Heart',
        color: '#EC4899',
        gradiente: 'from-pink-500 to-rose-500',
        nivel_jerarquia: 3,
        es_sistema: true,
        permisos: [
            { modulo: 'dashboard', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'pacientes', ver: true, crear: false, editar: true, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'agenda', ver: true, crear: true, editar: true, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'historial_clinico', ver: true, crear: true, editar: true, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'examenes', ver: true, crear: true, editar: true, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'certificaciones', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'evaluaciones', ver: true, crear: true, editar: true, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'farmacia', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'facturacion', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'inventario', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'reportes', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'rrhh', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'configuracion', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'usuarios', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'analytics', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'ia', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
        ]
    },

    {
        id: 'recepcion',
        nombre: 'Recepcionista',
        descripcion: 'Atención al público y gestión de citas',
        icono: 'ClipboardList',
        color: '#06B6D4',
        gradiente: 'from-cyan-500 to-blue-500',
        nivel_jerarquia: 4,
        es_sistema: true,
        permisos: [
            { modulo: 'dashboard', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'pacientes', ver: true, crear: true, editar: true, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'agenda', ver: true, crear: true, editar: true, borrar: true, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'historial_clinico', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'examenes', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'certificaciones', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'evaluaciones', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'farmacia', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'facturacion', ver: true, crear: true, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'inventario', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'reportes', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'rrhh', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'configuracion', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'usuarios', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'analytics', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'ia', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
        ]
    },

    {
        id: 'asistente',
        nombre: 'Asistente Administrativo',
        descripcion: 'Apoyo administrativo general',
        icono: 'UserCog',
        color: '#F59E0B',
        gradiente: 'from-amber-500 to-orange-500',
        nivel_jerarquia: 4,
        es_sistema: true,
        permisos: [
            { modulo: 'dashboard', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'pacientes', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'agenda', ver: true, crear: true, editar: true, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'historial_clinico', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'examenes', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'certificaciones', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'evaluaciones', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'farmacia', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'facturacion', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'inventario', ver: true, crear: true, editar: true, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'reportes', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'rrhh', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'configuracion', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'usuarios', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'analytics', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'ia', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
        ]
    },

    {
        id: 'higienista',
        nombre: 'Higienista Industrial',
        descripcion: 'Monitoreo de riesgos laborales, mediciones y cumplimiento NOM',
        icono: 'Shield',
        color: '#14B8A6',
        gradiente: 'from-teal-500 to-cyan-600',
        nivel_jerarquia: 3,
        es_sistema: true,
        permisos: [
            { modulo: 'dashboard', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'pacientes', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'agenda', ver: true, crear: true, editar: true, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'historial_clinico', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'examenes', ver: true, crear: true, editar: true, borrar: false, exportar: true, aprobar: false, firmar: true, imprimir: true },
            { modulo: 'certificaciones', ver: true, crear: true, editar: true, borrar: false, exportar: true, aprobar: true, firmar: true, imprimir: true },
            { modulo: 'evaluaciones', ver: true, crear: true, editar: true, borrar: false, exportar: true, aprobar: true, firmar: true, imprimir: true },
            { modulo: 'farmacia', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'facturacion', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'inventario', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'reportes', ver: true, crear: true, editar: false, borrar: false, exportar: true, aprobar: false, firmar: true, imprimir: true },
            { modulo: 'rrhh', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'configuracion', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'usuarios', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'analytics', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'ia', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
        ]
    },

    {
        id: 'auditor_sst',
        nombre: 'Auditor SST',
        descripcion: 'Auditoría de Seguridad y Salud en el Trabajo (STPS)',
        icono: 'Activity',
        color: '#EF4444',
        gradiente: 'from-red-500 to-rose-600',
        nivel_jerarquia: 2,
        es_sistema: true,
        permisos: [
            { modulo: 'dashboard', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'pacientes', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'agenda', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'historial_clinico', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'examenes', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'certificaciones', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: true, firmar: false, imprimir: true },
            { modulo: 'evaluaciones', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: true, firmar: false, imprimir: true },
            { modulo: 'farmacia', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'facturacion', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'inventario', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'reportes', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: true, firmar: false, imprimir: true },
            { modulo: 'rrhh', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'configuracion', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'usuarios', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'analytics', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'ia', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
        ]
    },

    {
        id: 'paciente',
        nombre: 'Paciente',
        descripcion: 'Acceso a sus propios datos médicos',
        icono: 'User',
        color: '#64748B',
        gradiente: 'from-slate-500 to-gray-500',
        nivel_jerarquia: 5,
        es_sistema: true,
        permisos: [
            { modulo: 'dashboard', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'pacientes', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'agenda', ver: true, crear: true, editar: true, borrar: true, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'historial_clinico', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'examenes', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'certificaciones', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'evaluaciones', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'farmacia', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'facturacion', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'inventario', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'reportes', ver: true, crear: false, editar: false, borrar: false, exportar: true, aprobar: false, firmar: false, imprimir: true },
            { modulo: 'rrhh', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'configuracion', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'usuarios', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'analytics', ver: false, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
            { modulo: 'ia', ver: true, crear: false, editar: false, borrar: false, exportar: false, aprobar: false, firmar: false, imprimir: false },
        ]
    },
]

// =============================================
// HELPERS
// =============================================

/**
 * Obtiene la plantilla de un rol por su ID
 */
export function getRoleTemplate(roleId: string): RolTemplate | undefined {
    return ROLE_TEMPLATES.find(r => r.id === roleId)
}

/**
 * Obtiene los roles disponibles para asignar (excluyendo super_admin)
 */
export function getAssignableRoles(): RolTemplate[] {
    return ROLE_TEMPLATES.filter(r => r.id !== 'super_admin')
}

/**
 * Obtiene los permisos predeterminados para un rol
 */
export function getDefaultPermissions(roleId: string): PermisoModulo[] {
    const template = getRoleTemplate(roleId)
    return template ? [...template.permisos] : []
}

/**
 * Clona los permisos para poder modificarlos sin afectar la plantilla original
 */
export function clonePermissions(permisos: PermisoModulo[]): PermisoModulo[] {
    return permisos.map(p => ({ ...p }))
}

/**
 * Genera un resumen de permisos para mostrar en UI
 */
export function getPermissionSummary(permisos: PermisoModulo[]): {
    modulosActivos: number
    modulosTotal: number
    accesosCompletos: number
    soloLectura: number
} {
    const modulosActivos = permisos.filter(p => p.ver).length
    const accesosCompletos = permisos.filter(p =>
        p.ver && p.crear && p.editar && p.borrar
    ).length
    const soloLectura = permisos.filter(p =>
        p.ver && !p.crear && !p.editar && !p.borrar
    ).length

    return {
        modulosActivos,
        modulosTotal: MODULOS_SISTEMA.length,
        accesosCompletos,
        soloLectura
    }
}

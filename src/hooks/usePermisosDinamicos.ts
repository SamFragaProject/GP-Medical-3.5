/**
 * Hook de Permisos Dinámicos
 * 
 * Este hook reemplaza al anterior useRolePermissions.
 * Ahora consulta los permisos desde Supabase en lugar de un archivo estático.
 * 
 * Mantiene compatibilidad con el código existente pero con permisos dinámicos.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
    obtenerPermisosUsuario,
    verificarPermiso as verificarPermisoService,
    PermisoModulo,
    esSuperAdmin as esSuperAdminFn
} from '@/services/permisosService'
import { AppAbility, defineAbilityFor, defaultAbility } from '@/lib/ability'

// Tipo para las acciones de permisos
type AccionPermiso = 'ver' | 'crear' | 'editar' | 'borrar' | 'exportar' | 'aprobar' | 'firmar' | 'imprimir'

interface PermisosPorModulo {
    canView: boolean
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    canExport: boolean
    canViewAll: boolean
    canApprove: boolean
    canSign: boolean
    canPrint: boolean
}

interface UsePermisosDinamicosReturn {
    // Estado
    loading: boolean
    error: string | null
    isSuperAdmin: boolean

    // Permisos crudos
    permisos: PermisoModulo[]

    // Función genérica para verificar permiso
    puede: (modulo: string, accion: AccionPermiso) => boolean

    // Instancia de CASL Ability
    ability: AppAbility

    // Módulos visibles para el menú
    modulosVisibles: PermisoModulo[]

    // Helpers por módulo (compatibilidad con código existente)
    pacientes: PermisosPorModulo
    citas: PermisosPorModulo
    examenes: PermisosPorModulo
    recetas: PermisosPorModulo
    historial: PermisosPorModulo
    facturacion: PermisosPorModulo
    inventario: PermisosPorModulo
    reportes: PermisosPorModulo
    rayos_x: PermisosPorModulo
    rrhh: PermisosPorModulo
    ia_asistente: PermisosPorModulo
    configuracion: PermisosPorModulo
    usuarios: PermisosPorModulo

    // Funciones de utilidad
    refrescarPermisos: () => Promise<void>
    tieneAccesoA: (ruta: string) => boolean
}

// Permisos vacíos por defecto
const PERMISOS_VACIOS: PermisosPorModulo = {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canViewAll: false,
    canApprove: false,
    canSign: false,
    canPrint: false
}

// Permisos completos para super admin
const PERMISOS_COMPLETOS: PermisosPorModulo = {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    canViewAll: true,
    canApprove: true,
    canSign: true,
    canPrint: true
}

/**
 * Módulos de respaldo (Fallback) para modo Offline o Demo
 * Define qué ve el usuario si no hay conexión con Supabase.
 * 
 * IMPORTANTE: Cada módulo DEBE tener una ruta ÚNICA.
 * Módulos con rutas duplicadas causan doble selección en el sidebar.
 * 
 * Estructura organizada según los 13 pilares del ERP:
 * 1. Núcleo Clínico | 2. Motor de Flujos | 3. Empresas B2B
 * 4. Dictámenes     | 5. Operación/Agenda | 6. Farmacia
 * 7. Facturación    | 8. Reportes         | 9. Cumplimiento
 * 10. Seguridad     | 11. Integraciones   | 12. UX
 * 13. Administración del SaaS
 */
const ALL_MODULES_CATALOG: PermisoModulo[] = [
    // ═══════════════════════════════════════════════════
    // DASHBOARD (visible para todos los roles)
    // ═══════════════════════════════════════════════════
    { modulo_codigo: 'dashboard', modulo_nombre: 'Dashboard', modulo_ruta: '/dashboard', modulo_icono: 'LayoutDashboard', modulo_gradiente: 'from-blue-600 to-indigo-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },

    // ═══════════════════════════════════════════════════
    // 1. NÚCLEO CLÍNICO (Expediente y Acto Médico)
    // ═══════════════════════════════════════════════════
    { modulo_codigo: 'pacientes', modulo_nombre: 'Pacientes', modulo_ruta: '/pacientes', modulo_icono: 'Users', modulo_gradiente: 'from-emerald-500 to-teal-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'estudios_medicos', modulo_nombre: 'Estudios Médicos', modulo_ruta: '/medicina/estudios', modulo_icono: 'Microscope', modulo_gradiente: 'from-red-500 to-orange-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'prescripcion', modulo_nombre: 'Recetas Médicas', modulo_ruta: '/medicina/recetas', modulo_icono: 'Pill', modulo_gradiente: 'from-teal-400 to-green-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'incapacidades', modulo_nombre: 'Incapacidades', modulo_ruta: '/medicina/incapacidades', modulo_icono: 'FileBarChart2', modulo_gradiente: 'from-rose-500 to-pink-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'rayos_x', modulo_nombre: 'Rayos X', modulo_ruta: '/rayos-x', modulo_icono: 'Bone', modulo_gradiente: 'from-slate-500 to-slate-700', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'espirometria', modulo_nombre: 'Espirometría', modulo_ruta: '/espirometria', modulo_icono: 'Wind', modulo_gradiente: 'from-cyan-500 to-blue-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'vision', modulo_nombre: 'Estudios Visuales', modulo_ruta: '/vision', modulo_icono: 'Eye', modulo_gradiente: 'from-teal-500 to-emerald-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'resultados', modulo_nombre: 'Resultados', modulo_ruta: '/resultados', modulo_icono: 'FileCheck', modulo_gradiente: 'from-blue-400 to-cyan-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },

    // ═══════════════════════════════════════════════════
    // 2. MOTOR DE FLUJOS (Episodios y Campañas)
    // ═══════════════════════════════════════════════════
    { modulo_codigo: 'episodios', modulo_nombre: 'Episodios', modulo_ruta: '/episodios/pipeline', modulo_icono: 'ClipboardList', modulo_gradiente: 'from-cyan-500 to-blue-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'campanias', modulo_nombre: 'Campañas Masivas', modulo_ruta: '/campanias', modulo_icono: 'ClipboardList', modulo_gradiente: 'from-orange-500 to-amber-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },

    // ═══════════════════════════════════════════════════
    // 4. DICTÁMENES MÉDICO-LABORALES
    // ═══════════════════════════════════════════════════
    { modulo_codigo: 'dictamenes', modulo_nombre: 'Dictámenes', modulo_ruta: '/medicina/dictamenes', modulo_icono: 'FileText', modulo_gradiente: 'from-emerald-500 to-teal-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'certificaciones', modulo_nombre: 'Certificaciones', modulo_ruta: '/certificaciones', modulo_icono: 'Award', modulo_gradiente: 'from-yellow-500 to-amber-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },

    // ═══════════════════════════════════════════════════
    // 5. OPERACIÓN Y AGENDA
    // ═══════════════════════════════════════════════════
    { modulo_codigo: 'agenda', modulo_nombre: 'Agenda', modulo_ruta: '/agenda', modulo_icono: 'Calendar', modulo_gradiente: 'from-purple-500 to-pink-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'citas', modulo_nombre: 'Citas', modulo_ruta: '/citas', modulo_icono: 'CalendarDays', modulo_gradiente: 'from-purple-500 to-pink-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'alertas', modulo_nombre: 'Alertas', modulo_ruta: '/alertas', modulo_icono: 'Bell', modulo_gradiente: 'from-amber-500 to-orange-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },

    // ═══════════════════════════════════════════════════
    // 6. FARMACIA E INVENTARIOS
    // ═══════════════════════════════════════════════════
    { modulo_codigo: 'inventario', modulo_nombre: 'Inventario', modulo_ruta: '/inventario', modulo_icono: 'Package', modulo_gradiente: 'from-emerald-600 to-green-700', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'tienda', modulo_nombre: 'Tienda', modulo_ruta: '/tienda', modulo_icono: 'ShoppingBag', modulo_gradiente: 'from-pink-400 to-rose-400', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },

    // ═══════════════════════════════════════════════════
    // 7. FACTURACIÓN, COBRANZA Y COSTOS
    // ═══════════════════════════════════════════════════
    { modulo_codigo: 'facturacion', modulo_nombre: 'Facturación', modulo_ruta: '/facturacion', modulo_icono: 'Receipt', modulo_gradiente: 'from-blue-500 to-cyan-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'cotizaciones', modulo_nombre: 'Cotizaciones', modulo_ruta: '/cotizaciones', modulo_icono: 'FileText', modulo_gradiente: 'from-blue-500 to-indigo-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'cxc', modulo_nombre: 'Cuentas por Cobrar', modulo_ruta: '/cxc', modulo_icono: 'DollarSign', modulo_gradiente: 'from-green-500 to-emerald-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },

    // ═══════════════════════════════════════════════════
    // 8. REPORTES E INTELIGENCIA
    // ═══════════════════════════════════════════════════
    { modulo_codigo: 'reportes', modulo_nombre: 'Reportes', modulo_ruta: '/reportes', modulo_icono: 'FileBarChart', modulo_gradiente: 'from-indigo-500 to-purple-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'ia', modulo_nombre: 'Intelligence Bureau', modulo_ruta: '/ia', modulo_icono: 'Brain', modulo_gradiente: 'from-violet-500 to-fuchsia-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },

    // ═══════════════════════════════════════════════════
    // 9. CUMPLIMIENTO LEGAL Y STPS (NOMs)
    // ═══════════════════════════════════════════════════
    { modulo_codigo: 'normatividad', modulo_nombre: 'Normatividad', modulo_ruta: '/normatividad', modulo_icono: 'Scale', modulo_gradiente: 'from-blue-800 to-indigo-900', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'nom011', modulo_nombre: 'NOM-011', modulo_ruta: '/nom-011/programa', modulo_icono: 'Activity', modulo_gradiente: 'from-amber-500 to-orange-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'evaluaciones', modulo_nombre: 'Evaluaciones', modulo_ruta: '/evaluaciones', modulo_icono: 'ClipboardCheck', modulo_gradiente: 'from-green-500 to-emerald-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'matriz_riesgos', modulo_nombre: 'Matriz Riesgos', modulo_ruta: '/medicina/matriz-riesgos', modulo_icono: 'ShieldAlert', modulo_gradiente: 'from-yellow-400 to-amber-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'programa_anual', modulo_nombre: 'Programa Anual', modulo_ruta: '/medicina/programa-anual', modulo_icono: 'CalendarRange', modulo_gradiente: 'from-blue-600 to-cyan-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },

    // ═══════════════════════════════════════════════════
    // 10. RRHH Y TALENTO
    // ═══════════════════════════════════════════════════
    { modulo_codigo: 'rrhh', modulo_nombre: 'RRHH', modulo_ruta: '/rrhh', modulo_icono: 'Users2', modulo_gradiente: 'from-pink-500 to-rose-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'medicos', modulo_nombre: 'Médicos', modulo_ruta: '/medicos', modulo_icono: 'Stethoscope', modulo_gradiente: 'from-teal-500 to-emerald-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },

    // ═══════════════════════════════════════════════════
    // 13. ADMINISTRACIÓN SAAS (Solo Admin)
    // ═══════════════════════════════════════════════════
    { modulo_codigo: 'empresas', modulo_nombre: 'Empresas', modulo_ruta: '/admin/empresas', modulo_icono: 'Building2', modulo_gradiente: 'from-blue-700 to-cyan-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'usuarios', modulo_nombre: 'Usuarios', modulo_ruta: '/admin/usuarios', modulo_icono: 'UserCog', modulo_gradiente: 'from-orange-500 to-amber-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'roles_permisos', modulo_nombre: 'Roles', modulo_ruta: '/admin/roles', modulo_icono: 'Shield', modulo_gradiente: 'from-slate-700 to-slate-900', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'sedes', modulo_nombre: 'Sedes', modulo_ruta: '/sedes', modulo_icono: 'MapPin', modulo_gradiente: 'from-red-500 to-rose-600', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'configuracion', modulo_nombre: 'Configuración', modulo_ruta: '/configuracion', modulo_icono: 'Settings', modulo_gradiente: 'from-gray-500 to-slate-500', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true },
    { modulo_codigo: 'sistema', modulo_nombre: 'Sistema', modulo_ruta: '/admin/dashboard', modulo_icono: 'Server', modulo_gradiente: 'from-slate-800 to-black', puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true }
];

// ═══════════════════════════════════════════════════
// Definición de Roles y sus módulos permitidos en modo Demo
// NOTA: 'historial', 'examen_medico', 'vigilancia_epidemiologica' fueron eliminados
//       del catálogo por compartir rutas con otros módulos.
//       Sus funcionalidades están integradas en:
//       - historial → Tab "Historial" dentro de Expediente Maestro (pacientes)
//       - examen_medico → Flujo dentro de Expediente Maestro (pacientes)
//       - vigilancia_epidemiologica → Sección dentro de Intelligence Bureau (ia)
// ═══════════════════════════════════════════════════
const DEMO_ROLE_PERMISSIONS: Record<string, string[]> = {
    'super_admin': ['*'],
    'admin_saas': ['*'],
    'admin_empresa': [
        'dashboard', 'pacientes', 'estudios_medicos', 'prescripcion', 'incapacidades',
        'rayos_x', 'espirometria', 'vision', 'resultados',
        'episodios', 'campanias',
        'dictamenes', 'certificaciones',
        'agenda', 'citas', 'alertas',
        'inventario', 'tienda',
        'facturacion', 'cotizaciones', 'cxc',
        'reportes', 'ia',
        'normatividad', 'nom011', 'evaluaciones', 'matriz_riesgos', 'programa_anual',
        'rrhh', 'medicos',
        'usuarios', 'sedes', 'configuracion'
    ],
    'medico': [
        'dashboard', 'pacientes', 'estudios_medicos', 'prescripcion', 'incapacidades',
        'rayos_x', 'espirometria', 'vision', 'resultados',
        'episodios', 'campanias',
        'dictamenes', 'certificaciones',
        'agenda', 'citas', 'alertas',
        'reportes', 'ia',
        'normatividad', 'nom011', 'evaluaciones', 'matriz_riesgos', 'programa_anual'
    ],
    'enfermera': [
        'dashboard', 'pacientes', 'estudios_medicos',
        'espirometria', 'vision', 'resultados',
        'agenda', 'citas', 'alertas'
    ],
    'recepcion': [
        'dashboard', 'pacientes',
        'agenda', 'citas',
        'campanias',
        'facturacion', 'cotizaciones', 'cxc',
        'resultados', 'tienda'
    ],
    'asistente': ['dashboard', 'pacientes', 'agenda', 'citas'],
    'higienista': [
        'dashboard', 'pacientes',
        'evaluaciones', 'certificaciones', 'nom011', 'normatividad',
        'matriz_riesgos', 'programa_anual',
        'reportes', 'dictamenes', 'inventario', 'rrhh', 'ia',
        'resultados', 'espirometria', 'vision', 'agenda'
    ],
    'auditor_sst': [
        'dashboard', 'pacientes',
        'evaluaciones', 'certificaciones', 'nom011', 'normatividad',
        'matriz_riesgos', 'programa_anual',
        'reportes', 'dictamenes', 'facturacion', 'inventario', 'rrhh', 'ia',
        'resultados', 'rayos_x', 'cxc', 'agenda'
    ],
    'contador_saas': ['dashboard', 'facturacion', 'reportes', 'cotizaciones', 'cxc'],
    'paciente': ['dashboard']
};

// Helper para obtener módulos según rol en demo
function obtenerModulosDemo(rol: string | undefined): PermisoModulo[] {
    const rolKey = rol || 'medico';
    const permitidos = DEMO_ROLE_PERMISSIONS[rolKey] || DEMO_ROLE_PERMISSIONS['medico'];

    if (permitidos.includes('*')) return ALL_MODULES_CATALOG;

    return ALL_MODULES_CATALOG.filter(m => permitidos.includes(m.modulo_codigo));
}

function convertirPermiso(permiso: PermisoModulo | undefined): PermisosPorModulo {
    if (!permiso) return PERMISOS_VACIOS

    return {
        canView: permiso.puede_ver,
        canCreate: permiso.puede_crear,
        canEdit: permiso.puede_editar,
        canDelete: permiso.puede_borrar,
        canExport: permiso.puede_exportar,
        canViewAll: permiso.puede_ver_todos,
        canApprove: permiso.puede_aprobar,
        canSign: permiso.puede_firmar,
        canPrint: permiso.puede_imprimir
    }
}

export function usePermisosDinamicos(): UsePermisosDinamicosReturn {
    const { user } = useAuth()
    const [permisos, setPermisos] = useState<PermisoModulo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [ability, setAbility] = useState<AppAbility>(defaultAbility)

    // Cargar permisos al iniciar o cuando cambia el usuario
    // ESTRATEGIA: Cargar permisos demo INMEDIATAMENTE basados en el rol del usuario,
    // luego intentar actualizar desde Supabase en background.
    // Esto evita que el dashboard se quede bloqueado si Supabase no responde.
    const cargarPermisos = useCallback(async () => {
        if (!user?.id) {
            setPermisos([])
            setLoading(false)
            return
        }

        // PASO 1: Cargar permisos demo INMEDIATAMENTE para desbloquear la UI
        const esSuper = user.rol === 'super_admin' || user.rol === 'admin_saas';
        const modulosDemo = obtenerModulosDemo(user.rol);

        setIsSuperAdmin(esSuper)
        setPermisos(modulosDemo)
        setAbility(defineAbilityFor(modulosDemo, esSuper))
        setLoading(false) // ← UI se desbloquea AQUÍ, sin esperar Supabase
        setError(null)

        console.log(`✅ Permisos demo cargados para rol: ${user.rol} (${modulosDemo.length} módulos)`)

        // PASO 2: Intentar upgrader a permisos reales desde Supabase (background, no-blocking)
        const isMockUser = user.id.startsWith('mock-') ||
            user.id.startsWith('demo-') ||
            user.id.startsWith('00000000') ||
            user.id.startsWith('u1a1b1c1') ||
            user.id.startsWith('u3a3b3c3');

        if (isMockUser) {
            console.log(`🔓 Usuario mock/demo, omitiendo upgrade de permisos.`)
            return
        }

        // Background upgrade - no bloquea UI
        try {
            const timeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Permisos timeout: Supabase no respondió en 4s')), 4000)
            )

            const permisosReales = await Promise.race([obtenerPermisosUsuario(user.id), timeout])

            // Solo actualizar si obtuvimos datos reales
            if (permisosReales && permisosReales.length > 0) {
                // MERGE PERMISIVO: Combinar permisos de Supabase con demo.
                // Para cada módulo, usar el valor MÁS PERMISIVO entre Supabase y demo.
                // Esto evita que configuraciones restrictivas en Supabase bloqueen la UI.
                // La seguridad real vive en RLS, no en el frontend.
                const demoMap = new Map(modulosDemo.map(m => [m.modulo_codigo, m]))
                const supabaseMap = new Map(permisosReales.map((p: any) => [p.modulo_codigo, p]))

                // Empezar con todos los módulos demo
                const permisosMerged: typeof modulosDemo = modulosDemo.map(demo => {
                    const real = supabaseMap.get(demo.modulo_codigo)
                    if (!real) return demo // No existe en Supabase, usar demo
                    // Existe en ambos: usar el más permisivo (OR lógico)
                    return {
                        ...demo,
                        puede_ver: demo.puede_ver || real.puede_ver,
                        puede_crear: demo.puede_crear || real.puede_crear,
                        puede_editar: demo.puede_editar || real.puede_editar,
                        puede_borrar: demo.puede_borrar || real.puede_borrar,
                        puede_exportar: demo.puede_exportar || real.puede_exportar,
                        puede_ver_todos: demo.puede_ver_todos || real.puede_ver_todos,
                        puede_aprobar: demo.puede_aprobar || real.puede_aprobar,
                        puede_firmar: demo.puede_firmar || real.puede_firmar,
                        puede_imprimir: demo.puede_imprimir || real.puede_imprimir,
                    }
                })

                // Agregar módulos que existen en Supabase pero no en demo
                const demoCodigos = new Set(modulosDemo.map(m => m.modulo_codigo))
                const soloEnSupabase = permisosReales.filter((p: any) => !demoCodigos.has(p.modulo_codigo))
                permisosMerged.push(...soloEnSupabase)

                setPermisos(permisosMerged)
                setAbility(defineAbilityFor(permisosMerged, esSuper))
                console.log(`🔄 Permisos merged (${permisosReales.length} Supabase + ${modulosDemo.length} demo → ${permisosMerged.length} total)`)
            }
        } catch (err) {
            // No pasa nada - ya tenemos los permisos demo funcionando
            console.warn('⚠️ No se pudieron cargar permisos de Supabase, usando modo demo:', err)
        }
    }, [user?.id, user?.rol])

    useEffect(() => {
        if (isSuperAdmin && permisos.length > 0) {
            setAbility(defineAbilityFor(permisos, true))
        }
    }, [isSuperAdmin, permisos])

    useEffect(() => {
        cargarPermisos()
    }, [cargarPermisos])

    // Función para verificar si puede hacer algo
    const puede = useCallback((modulo: string, accion: AccionPermiso): boolean => {
        // Super admin puede todo
        if (isSuperAdmin) return true

        const permiso = permisos.find(p => p.modulo_codigo === modulo)
        if (!permiso) return false

        switch (accion) {
            case 'ver': return permiso.puede_ver
            case 'crear': return permiso.puede_crear
            case 'editar': return permiso.puede_editar
            case 'borrar': return permiso.puede_borrar
            case 'exportar': return permiso.puede_exportar
            case 'aprobar': return permiso.puede_aprobar
            case 'firmar': return permiso.puede_firmar
            case 'imprimir': return permiso.puede_imprimir
            default: return false
        }
    }, [permisos, isSuperAdmin])

    // Módulos visibles para el menú
    const modulosVisibles = useMemo(() => {
        if (isSuperAdmin) return permisos // Super admin ve todo
        return permisos.filter(p => p.puede_ver)
    }, [permisos, isSuperAdmin])

    // Función para verificar acceso a una ruta
    const tieneAccesoA = useCallback((ruta: string): boolean => {
        if (isSuperAdmin) return true

        // Buscar el módulo que corresponde a esta ruta
        const modulo = permisos.find(p => p.modulo_ruta === ruta)
        return modulo?.puede_ver || false
    }, [permisos, isSuperAdmin])

    // Obtener permisos por módulo (para compatibilidad)
    const obtenerPermisoModulo = useCallback((codigo: string): PermisosPorModulo => {
        if (isSuperAdmin) return PERMISOS_COMPLETOS

        const permiso = permisos.find(p => p.modulo_codigo === codigo)
        return convertirPermiso(permiso)
    }, [permisos, isSuperAdmin])

    // Helpers por módulo (compatibilidad con código existente)
    const pacientes = useMemo(() => obtenerPermisoModulo('pacientes'), [obtenerPermisoModulo])
    const citas = useMemo(() => obtenerPermisoModulo('citas'), [obtenerPermisoModulo])
    const examenes = useMemo(() => obtenerPermisoModulo('examenes'), [obtenerPermisoModulo])
    const recetas = useMemo(() => obtenerPermisoModulo('recetas'), [obtenerPermisoModulo])
    const historial = useMemo(() => obtenerPermisoModulo('historial'), [obtenerPermisoModulo])
    const facturacion = useMemo(() => obtenerPermisoModulo('facturacion'), [obtenerPermisoModulo])
    const inventario = useMemo(() => obtenerPermisoModulo('inventario'), [obtenerPermisoModulo])
    const reportes = useMemo(() => obtenerPermisoModulo('reportes'), [obtenerPermisoModulo])
    const rayos_x = useMemo(() => obtenerPermisoModulo('rayos_x'), [obtenerPermisoModulo])
    const rrhh = useMemo(() => obtenerPermisoModulo('rrhh'), [obtenerPermisoModulo])
    const ia_asistente = useMemo(() => obtenerPermisoModulo('ia_asistente'), [obtenerPermisoModulo])
    const configuracion = useMemo(() => obtenerPermisoModulo('configuracion'), [obtenerPermisoModulo])
    const usuarios = useMemo(() => obtenerPermisoModulo('usuarios'), [obtenerPermisoModulo])

    return {
        loading,
        error,
        isSuperAdmin,
        permisos,
        puede,
        ability,
        modulosVisibles,
        pacientes,
        citas,
        examenes,
        recetas,
        historial,
        facturacion,
        inventario,
        reportes,
        rayos_x,
        rrhh,
        ia_asistente,
        configuracion,
        usuarios,
        refrescarPermisos: cargarPermisos,
        tieneAccesoA
    }
}

// =============================================
// HOOK SIMPLIFICADO PARA CASOS ESPECÍFICOS
// =============================================

/**
 * Hook para verificar un solo permiso (útil para condicionales simples)
 */
export function usePuede(modulo: string, accion: AccionPermiso): boolean {
    const { puede, loading, isSuperAdmin } = usePermisosDinamicos()

    if (loading) return false
    if (isSuperAdmin) return true

    return puede(modulo, accion)
}

/**
 * Hook para obtener módulos del menú
 */
export function useMenuModulos() {
    const { user } = useAuth()
    const { modulosVisibles, loading, isSuperAdmin, permisos } = usePermisosDinamicos()

    // Si no hay módulos cargados de Supabase o es un usuario demo, usar fallback (para Modo Offline/Demo)
    const modulos = (modulosVisibles.length === 0) ? obtenerModulosDemo(user?.rol) : modulosVisibles

    return {
        modulos,
        loading,
        isSuperAdmin
    }
}

// =============================================
// ALIAS PARA COMPATIBILIDAD
// =============================================

// Mantener el nombre anterior para no romper imports existentes
export { usePermisosDinamicos as useRolePermissionsDynamic }

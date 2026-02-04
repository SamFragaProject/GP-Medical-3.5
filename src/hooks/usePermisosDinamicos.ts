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
    esSuperAdmin
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
 */
const MODULOS_FALLBACK: PermisoModulo[] = [
    {
        modulo_codigo: 'dashboard',
        modulo_nombre: 'Dashboard',
        modulo_ruta: '/dashboard',
        modulo_icono: 'LayoutDashboard',
        modulo_gradiente: 'from-blue-600 to-indigo-600',
        puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true
    },
    {
        modulo_codigo: 'pacientes',
        modulo_nombre: 'Pacientes',
        modulo_ruta: '/pacientes',
        modulo_icono: 'Users',
        modulo_gradiente: 'from-emerald-500 to-teal-500',
        puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true
    },
    {
        modulo_codigo: 'agenda',
        modulo_nombre: 'Agenda',
        modulo_ruta: '/agenda',
        modulo_icono: 'Calendar',
        modulo_gradiente: 'from-purple-500 to-pink-500',
        puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true
    },
    {
        modulo_codigo: 'examenes',
        modulo_nombre: 'Exámenes',
        modulo_ruta: '/examenes',
        modulo_icono: 'Microscope',
        modulo_gradiente: 'from-red-500 to-orange-500',
        puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true
    },
    {
        modulo_codigo: 'historial',
        modulo_nombre: 'Historial',
        modulo_ruta: '/historial',
        modulo_icono: 'History',
        modulo_gradiente: 'from-slate-600 to-gray-700',
        puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true
    },
    {
        modulo_codigo: 'ia',
        modulo_nombre: 'IA Asistente',
        modulo_ruta: '/ia',
        modulo_icono: 'Sparkles',
        modulo_gradiente: 'from-violet-500 to-fuchsia-500',
        puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true, puede_aprobar: true, puede_firmar: true, puede_imprimir: true
    }
];

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
    const cargarPermisos = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            if (!user?.id) {
                setPermisos([])
                setLoading(false)
                return
            }

            const isMockUser = user.id.startsWith('mock-') || user.id.startsWith('demo-')

            // Si es usuario mock/demo o estamos offline, usar permisos fallback
            if (isMockUser) {
                console.log('🔓 Modo Mock/Offline detectado en usePermisosDinamicos')
                setPermisos(MODULOS_FALLBACK)
                setIsSuperAdmin(user.rol === 'super_admin')
                setAbility(defineAbilityFor(MODULOS_FALLBACK, user.rol === 'super_admin'))
                setLoading(false)
                return
            }

            // Verificar si es super admin (primero por rol en context, luego por DB)
            const esSuperEnContext = user.rol === 'super_admin'

            if (esSuperEnContext) {
                setIsSuperAdmin(true)
                // Para super admin, cargamos todos los módulos con permisos full
                const todosLosModulos = await obtenerPermisosUsuario(user.id)
                setPermisos(todosLosModulos)
                setAbility(defineAbilityFor(todosLosModulos, true))
            } else {
                const isSuperEnDB = await esSuperAdmin(user.id)
                setIsSuperAdmin(isSuperEnDB)

                // Obtener permisos
                const permisosUsuario = await obtenerPermisosUsuario(user.id)
                setPermisos(permisosUsuario)

                // Actualizar Ability
                const newAbility = defineAbilityFor(permisosUsuario, isSuperEnDB)
                setAbility(newAbility)
            }
        } catch (err) {
            console.error('Error cargando permisos:', err)
            // Fallback de emergencia si es super_admin en context o si falla la conexión
            if (user.rol === 'super_admin') {
                setIsSuperAdmin(true)
                setPermisos(MODULOS_FALLBACK)
                setAbility(defineAbilityFor(MODULOS_FALLBACK, true))
            } else {
                setPermisos(MODULOS_FALLBACK) // Dar acceso por defecto en error para no bloquear la UI en demo
                setAbility(defineAbilityFor(MODULOS_FALLBACK, false))
                setError('Error al cargar permisos (Modo Fallback)')
            }
        } finally {
            setLoading(false)
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
    const modulos = (modulosVisibles.length === 0) ? MODULOS_FALLBACK : modulosVisibles

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

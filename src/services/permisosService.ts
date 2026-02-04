/**
 * Servicio de Permisos Dinámicos
 * 
 * Este servicio consulta los permisos desde Supabase en lugar de leerlos
 * de un archivo estático. Permite que el Super Admin cree roles personalizados.
 */

import { supabase } from '@/lib/supabase'

// =============================================
// TIPOS
// =============================================

export interface ModuloSistema {
    id: string
    codigo: string
    nombre: string
    descripcion: string | null
    icono: string
    gradiente: string
    categoria: 'plataforma' | 'operativo' | 'administrativo' | 'configuracion' | 'especial'
    orden: number
    ruta: string | null
    es_premium: boolean
    requiere_licencia_medica: boolean
    activo: boolean
}

export interface AccionSistema {
    id: string
    codigo: string
    nombre: string
    descripcion: string | null
    icono: string
    orden: number
}

export interface PermisoModulo {
    modulo_codigo: string
    modulo_nombre: string
    modulo_ruta: string | null
    modulo_icono: string
    modulo_gradiente: string
    puede_ver: boolean
    puede_crear: boolean
    puede_editar: boolean
    puede_borrar: boolean
    puede_exportar: boolean
    puede_ver_todos: boolean
    puede_aprobar: boolean
    puede_firmar: boolean
    puede_imprimir: boolean
}

export interface RolPersonalizado {
    id: string
    nombre: string
    descripcion: string | null
    color: string
    icono: string
    nivel_jerarquia: number
    es_editable: boolean
    es_sistema: boolean
    empresa_id: string | null
    permisos: PermisoModulo[]
}

export interface NuevoRol {
    nombre: string
    descripcion: string
    color: string
    icono: string
    nivel_jerarquia: number
    empresa_id?: string
    permisos: {
        modulo_codigo: string
        puede_ver: boolean
        puede_crear: boolean
        puede_editar: boolean
        puede_borrar: boolean
        puede_exportar: boolean
        puede_ver_todos: boolean
        puede_aprobar: boolean
        puede_firmar: boolean
        puede_imprimir: boolean
    }[]
}

// =============================================
// CACHÉ DE PERMISOS
// =============================================

// Caché en memoria para no consultar la BD en cada render
const permisosCache: Map<string, { permisos: PermisoModulo[], timestamp: number }> = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

function getCachedPermisos(userId: string): PermisoModulo[] | null {
    const cached = permisosCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.permisos
    }
    return null
}

function setCachedPermisos(userId: string, permisos: PermisoModulo[]): void {
    permisosCache.set(userId, { permisos, timestamp: Date.now() })
}

export function invalidarCachePermisos(userId?: string): void {
    if (userId) {
        permisosCache.delete(userId)
    } else {
        permisosCache.clear()
    }
}

// =============================================
// FUNCIONES DE CONSULTA
// =============================================

/**
 * Obtiene todos los permisos de un usuario desde la base de datos
 */
export async function obtenerPermisosUsuario(userId: string): Promise<PermisoModulo[]> {
    // Verificar caché primero
    const cached = getCachedPermisos(userId)
    if (cached) {
        return cached
    }

    // BYPASS para usuarios DEMO/OFFLINE (evitar error 22P02 de UUID inválido)
    if (userId.startsWith('mock-') || userId.startsWith('demo-')) {
        console.log('🔓 Detectado usuario demo/offline, omitiendo consulta RPC a Supabase')
        // Al retornar [] aquí, usePermisosDinamicos usará MODULOS_FALLBACK
        return []
    }

    try {
        const { data, error } = await supabase
            .rpc('obtener_permisos_usuario', { p_user_id: userId })

        if (error) {
            console.error('Error obteniendo permisos:', error)
            return []
        }

        const permisos = data as PermisoModulo[]
        setCachedPermisos(userId, permisos)
        return permisos
    } catch (err) {
        console.error('Error en obtenerPermisosUsuario:', err)
        return []
    }
}

/**
 * Verifica si un usuario puede realizar una acción específica en un módulo
 */
export async function verificarPermiso(
    userId: string,
    moduloCodigo: string,
    accion: 'ver' | 'crear' | 'editar' | 'borrar' | 'exportar' | 'aprobar' | 'firmar' | 'imprimir'
): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .rpc('verificar_permiso', {
                p_user_id: userId,
                p_modulo_codigo: moduloCodigo,
                p_accion: accion
            })

        if (error) {
            console.error('Error verificando permiso:', error)
            return false
        }

        return data === true
    } catch (err) {
        console.error('Error en verificarPermiso:', err)
        return false
    }
}

/**
 * Obtiene los módulos visibles para un usuario (para construir el menú)
 */
export async function obtenerModulosVisibles(userId: string): Promise<PermisoModulo[]> {
    const permisos = await obtenerPermisosUsuario(userId)
    return permisos.filter(p => p.puede_ver)
}

// =============================================
// FUNCIONES PARA GESTIÓN DE ROLES (Super Admin)
// =============================================

/**
 * Obtiene todos los módulos del sistema (para el Wizard)
 */
export async function obtenerTodosLosModulos(): Promise<ModuloSistema[]> {
    const { data, error } = await supabase
        .from('modulos_sistema')
        .select('*')
        .eq('activo', true)
        .order('orden')

    if (error) {
        console.error('Error obteniendo módulos:', error)
        return []
    }

    return data as ModuloSistema[]
}

/**
 * Obtiene todas las acciones disponibles
 */
export async function obtenerTodasLasAcciones(): Promise<AccionSistema[]> {
    const { data, error } = await supabase
        .from('acciones_sistema')
        .select('*')
        .order('orden')

    if (error) {
        console.error('Error obteniendo acciones:', error)
        return []
    }

    return data as AccionSistema[]
}

/**
 * Obtiene todos los roles (globales y de una empresa específica)
 */
export async function obtenerRoles(empresaId?: string): Promise<RolPersonalizado[]> {
    let query = supabase
        .from('roles')
        .select('*')
        .eq('activo', true)
        .order('nivel_jerarquia')

    // Filtrar por empresa si se especifica
    if (empresaId) {
        query = query.or(`empresa_id.is.null,empresa_id.eq.${empresaId}`)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error obteniendo roles:', error)
        return []
    }

    // Obtener permisos de cada rol
    const rolesConPermisos: RolPersonalizado[] = []

    for (const rol of data) {
        const { data: permisos } = await supabase
            .from('rol_modulo_permisos')
            .select(`
        modulo:modulos_sistema(codigo, nombre, ruta, icono, gradiente),
        puede_ver,
        puede_crear,
        puede_editar,
        puede_borrar,
        puede_exportar,
        puede_ver_todos,
        puede_aprobar,
        puede_firmar,
        puede_imprimir
      `)
            .eq('rol_id', rol.id)

        rolesConPermisos.push({
            id: rol.id,
            nombre: rol.nombre,
            descripcion: rol.descripcion,
            color: rol.color || '#6366f1',
            icono: rol.icono || 'User',
            nivel_jerarquia: rol.nivel_jerarquia || 5,
            es_editable: rol.es_editable !== false,
            es_sistema: rol.es_sistema === true,
            empresa_id: rol.empresa_id,
            permisos: (permisos || []).map((p: any) => ({
                modulo_codigo: p.modulo?.codigo || '',
                modulo_nombre: p.modulo?.nombre || '',
                modulo_ruta: p.modulo?.ruta || null,
                modulo_icono: p.modulo?.icono || 'FileText',
                modulo_gradiente: p.modulo?.gradiente || 'from-gray-500 to-slate-500',
                puede_ver: p.puede_ver || false,
                puede_crear: p.puede_crear || false,
                puede_editar: p.puede_editar || false,
                puede_borrar: p.puede_borrar || false,
                puede_exportar: p.puede_exportar || false,
                puede_ver_todos: p.puede_ver_todos || false,
                puede_aprobar: p.puede_aprobar || false,
                puede_firmar: p.puede_firmar || false,
                puede_imprimir: p.puede_imprimir || false
            }))
        })
    }

    return rolesConPermisos
}

/**
 * Crea un nuevo rol personalizado con sus permisos
 */
export async function crearRolPersonalizado(nuevoRol: NuevoRol): Promise<{ success: boolean, rolId?: string, error?: string }> {
    try {
        // 1. Crear el rol
        const { data: rolCreado, error: errorRol } = await supabase
            .from('roles')
            .insert({
                nombre: nuevoRol.nombre,
                descripcion: nuevoRol.descripcion,
                color: nuevoRol.color,
                icono: nuevoRol.icono,
                nivel_jerarquia: nuevoRol.nivel_jerarquia,
                empresa_id: nuevoRol.empresa_id || null,
                es_editable: true,
                es_sistema: false,
                activo: true
            })
            .select()
            .single()

        if (errorRol) {
            return { success: false, error: errorRol.message }
        }

        // 2. Obtener IDs de los módulos
        const { data: modulos } = await supabase
            .from('modulos_sistema')
            .select('id, codigo')

        if (!modulos) {
            return { success: false, error: 'No se pudieron obtener los módulos' }
        }

        const moduloMap = new Map(modulos.map(m => [m.codigo, m.id]))

        // 3. Crear los permisos para cada módulo
        const permisosAInsertar = nuevoRol.permisos
            .filter(p => moduloMap.has(p.modulo_codigo))
            .map(p => ({
                rol_id: rolCreado.id,
                modulo_id: moduloMap.get(p.modulo_codigo),
                puede_ver: p.puede_ver,
                puede_crear: p.puede_crear,
                puede_editar: p.puede_editar,
                puede_borrar: p.puede_borrar,
                puede_exportar: p.puede_exportar,
                puede_ver_todos: p.puede_ver_todos,
                puede_aprobar: p.puede_aprobar,
                puede_firmar: p.puede_firmar,
                puede_imprimir: p.puede_imprimir
            }))

        if (permisosAInsertar.length > 0) {
            const { error: errorPermisos } = await supabase
                .from('rol_modulo_permisos')
                .insert(permisosAInsertar)

            if (errorPermisos) {
                // Rollback: eliminar el rol creado
                await supabase.from('roles').delete().eq('id', rolCreado.id)
                return { success: false, error: errorPermisos.message }
            }
        }

        // Invalidar caché de todos los usuarios
        invalidarCachePermisos()

        return { success: true, rolId: rolCreado.id }
    } catch (err) {
        console.error('Error creando rol:', err)
        return { success: false, error: 'Error inesperado al crear el rol' }
    }
}

/**
 * Actualiza los permisos de un rol existente
 */
export async function actualizarPermisosRol(
    rolId: string,
    permisos: NuevoRol['permisos']
): Promise<{ success: boolean, error?: string }> {
    try {
        // Verificar que el rol sea editable
        const { data: rol } = await supabase
            .from('roles')
            .select('es_editable, es_sistema')
            .eq('id', rolId)
            .single()

        if (!rol || rol.es_sistema || !rol.es_editable) {
            return { success: false, error: 'Este rol no se puede editar' }
        }

        // Obtener IDs de los módulos
        const { data: modulos } = await supabase
            .from('modulos_sistema')
            .select('id, codigo')

        if (!modulos) {
            return { success: false, error: 'No se pudieron obtener los módulos' }
        }

        const moduloMap = new Map(modulos.map(m => [m.codigo, m.id]))

        // Eliminar permisos existentes
        await supabase
            .from('rol_modulo_permisos')
            .delete()
            .eq('rol_id', rolId)

        // Insertar nuevos permisos
        const permisosAInsertar = permisos
            .filter(p => moduloMap.has(p.modulo_codigo))
            .map(p => ({
                rol_id: rolId,
                modulo_id: moduloMap.get(p.modulo_codigo),
                puede_ver: p.puede_ver,
                puede_crear: p.puede_crear,
                puede_editar: p.puede_editar,
                puede_borrar: p.puede_borrar,
                puede_exportar: p.puede_exportar,
                puede_ver_todos: p.puede_ver_todos,
                puede_aprobar: p.puede_aprobar,
                puede_firmar: p.puede_firmar,
                puede_imprimir: p.puede_imprimir
            }))

        if (permisosAInsertar.length > 0) {
            const { error } = await supabase
                .from('rol_modulo_permisos')
                .insert(permisosAInsertar)

            if (error) {
                return { success: false, error: error.message }
            }
        }

        // Invalidar caché
        invalidarCachePermisos()

        return { success: true }
    } catch (err) {
        console.error('Error actualizando permisos:', err)
        return { success: false, error: 'Error inesperado al actualizar permisos' }
    }
}

/**
 * Actualiza los datos básicos y permisos de un rol
 */
export async function actualizarRol(
    rolId: string,
    datos: Partial<NuevoRol>
): Promise<{ success: boolean, error?: string }> {
    try {
        // 1. Actualizar datos básicos si existen
        const updates: any = {}
        if (datos.nombre) updates.nombre = datos.nombre
        if (datos.descripcion !== undefined) updates.descripcion = datos.descripcion
        if (datos.color) updates.color = datos.color
        if (datos.icono) updates.icono = datos.icono
        if (datos.nivel_jerarquia !== undefined) updates.nivel_jerarquia = datos.nivel_jerarquia

        if (Object.keys(updates).length > 0) {
            const { error: errorRol } = await supabase
                .from('roles')
                .update(updates)
                .eq('id', rolId)

            if (errorRol) return { success: false, error: errorRol.message }
        }

        // 2. Actualizar permisos si existen
        if (datos.permisos) {
            const resultadoPermisos = await actualizarPermisosRol(rolId, datos.permisos)
            if (!resultadoPermisos.success) return resultadoPermisos
        }

        invalidarCachePermisos()
        return { success: true }
    } catch (err) {
        console.error('Error en actualizarRol:', err)
        return { success: false, error: 'Error inesperado al actualizar el rol' }
    }
}

/**
 * Elimina un rol personalizado
 */
export async function eliminarRol(rolId: string): Promise<{ success: boolean, error?: string }> {
    try {
        // Verificar que el rol sea eliminable
        const { data: rol } = await supabase
            .from('roles')
            .select('es_editable, es_sistema, nombre')
            .eq('id', rolId)
            .single()

        if (!rol) {
            return { success: false, error: 'Rol no encontrado' }
        }

        if (rol.es_sistema) {
            return { success: false, error: 'No se pueden eliminar roles del sistema' }
        }

        // Verificar que no haya usuarios con este rol
        const { data: usuarios } = await supabase
            .from('user_roles')
            .select('id')
            .eq('role_id', rolId)
            .eq('activo', true)
            .limit(1)

        if (usuarios && usuarios.length > 0) {
            return { success: false, error: 'No se puede eliminar un rol que tiene usuarios asignados' }
        }

        // Eliminar el rol (los permisos se eliminan en cascada)
        const { error } = await supabase
            .from('roles')
            .delete()
            .eq('id', rolId)

        if (error) {
            return { success: false, error: error.message }
        }

        invalidarCachePermisos()
        return { success: true }
    } catch (err) {
        console.error('Error eliminando rol:', err)
        return { success: false, error: 'Error inesperado al eliminar el rol' }
    }
}

// =============================================
// HELPERS
// =============================================

/**
 * Verifica rápidamente si el usuario es Super Admin
 */
export async function esSuperAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
        .from('user_roles')
        .select('roles!inner(nombre)')
        .eq('user_id', userId)
        .eq('activo', true)
        .single()

    return (data as any)?.roles?.nombre === 'super_admin'
}

/**
 * Obtiene el nivel de jerarquía del usuario
 */
export async function obtenerNivelJerarquia(userId: string): Promise<number> {
    const { data } = await supabase
        .from('user_roles')
        .select('roles!inner(nivel_jerarquia)')
        .eq('user_id', userId)
        .eq('activo', true)
        .single()

    return (data as any)?.roles?.nivel_jerarquia || 10
}

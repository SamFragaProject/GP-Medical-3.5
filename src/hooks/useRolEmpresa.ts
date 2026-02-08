/**
 * Hook para Permisos Dinámicos por Empresa
 * GPMedical ERP Pro
 * 
 * Este hook consulta los permisos del usuario desde el sistema de roles
 * por empresa, permitiendo verificaciones granulares.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { rolesEmpresaService, RolEmpresa, PermisoRol } from '@/services/tenantService'
import { supabase } from '@/lib/supabase'

interface PermisoModulo {
    modulo: string
    puede_ver: boolean
    puede_crear: boolean
    puede_editar: boolean
    puede_borrar: boolean
    puede_exportar: boolean
    puede_aprobar: boolean
    puede_firmar: boolean
    puede_imprimir: boolean
}

interface UseRolEmpresaReturn {
    loading: boolean
    rol: RolEmpresa | null
    permisos: PermisoModulo[]
    isSuperAdmin: boolean
    isAdminEmpresa: boolean
    puede: (modulo: string, accion: 'ver' | 'crear' | 'editar' | 'borrar' | 'exportar' | 'aprobar' | 'firmar' | 'imprimir') => boolean
    puedeAcceder: (modulo: string) => boolean
    recargarPermisos: () => Promise<void>
}

// Cache de permisos en memoria
const permisosCache: Map<string, { permisos: PermisoModulo[], rol: RolEmpresa | null, timestamp: number }> = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useRolEmpresa(): UseRolEmpresaReturn {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [rol, setRol] = useState<RolEmpresa | null>(null)
    const [permisos, setPermisos] = useState<PermisoModulo[]>([])

    // Verificar si es super admin
    const isSuperAdmin = user?.rol === 'super_admin'
    const isAdminEmpresa = rol?.codigo === 'admin_empresa' || user?.rol === 'admin_empresa'

    // Cargar permisos del usuario
    const cargarPermisos = useCallback(async () => {
        if (!user?.id) {
            setLoading(false)
            return
        }

        // Super admin tiene todos los permisos
        if (isSuperAdmin) {
            setLoading(false)
            return
        }

        // Verificar cache
        const cached = permisosCache.get(user.id)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setRol(cached.rol)
            setPermisos(cached.permisos)
            setLoading(false)
            return
        }

        try {
            // Obtener el perfil con su rol
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select(`
          rol_empresa_id,
          rol:roles_empresa(
            id,
            codigo,
            nombre,
            color,
            icono,
            nivel_jerarquia,
            permisos:permisos_rol(*)
          )
        `)
                .eq('id', user.id)
                .single()

            if (profileError || !profile?.rol) {
                // Fallback a permisos del rol legacy
                setLoading(false)
                return
            }

            const rolData = profile.rol as unknown as RolEmpresa
            setRol(rolData)

            // Transformar permisos
            const permisosTransformados: PermisoModulo[] = (rolData.permisos || []).map((p: any) => ({
                modulo: p.modulo_codigo,
                puede_ver: p.puede_ver,
                puede_crear: p.puede_crear,
                puede_editar: p.puede_editar,
                puede_borrar: p.puede_borrar,
                puede_exportar: p.puede_exportar,
                puede_aprobar: p.puede_aprobar,
                puede_firmar: p.puede_firmar,
                puede_imprimir: p.puede_imprimir
            }))

            setPermisos(permisosTransformados)

            // Guardar en cache
            permisosCache.set(user.id, {
                permisos: permisosTransformados,
                rol: rolData,
                timestamp: Date.now()
            })

        } catch (error) {
            console.error('Error cargando permisos:', error)
        } finally {
            setLoading(false)
        }
    }, [user?.id, isSuperAdmin])

    // Cargar al montar
    useEffect(() => {
        cargarPermisos()
    }, [cargarPermisos])

    // Verificar permiso específico
    const puede = useCallback((
        modulo: string,
        accion: 'ver' | 'crear' | 'editar' | 'borrar' | 'exportar' | 'aprobar' | 'firmar' | 'imprimir'
    ): boolean => {
        // Super admin tiene todos los permisos
        if (isSuperAdmin) return true

        // Admin de empresa tiene todos los permisos en su empresa
        if (isAdminEmpresa) return true

        const permiso = permisos.find(p => p.modulo === modulo)
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
    }, [isSuperAdmin, isAdminEmpresa, permisos])

    // Verificar acceso a un módulo (solo lectura)
    const puedeAcceder = useCallback((modulo: string): boolean => {
        return puede(modulo, 'ver')
    }, [puede])

    // Recargar permisos (invalidar cache)
    const recargarPermisos = useCallback(async () => {
        if (user?.id) {
            permisosCache.delete(user.id)
            await cargarPermisos()
        }
    }, [user?.id, cargarPermisos])

    return {
        loading,
        rol,
        permisos,
        isSuperAdmin,
        isAdminEmpresa,
        puede,
        puedeAcceder,
        recargarPermisos
    }
}

// Helper para invalidar cache de un usuario específico
export function invalidarCachePermisos(userId?: string) {
    if (userId) {
        permisosCache.delete(userId)
    } else {
        permisosCache.clear()
    }
}

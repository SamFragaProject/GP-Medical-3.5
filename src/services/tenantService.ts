/**
 * Servicio de Gestión de Empresas y Roles
 * GPMedical ERP Pro - Multi-Tenant Management
 * 
 * Este servicio maneja:
 * - Creación de empresas con auto-provisión de roles
 * - Gestión de roles por empresa
 * - Invitación y onboarding de usuarios
 */

import { supabase } from '@/lib/supabase'

// =====================================================
// TIPOS
// =====================================================

export interface Empresa {
    id: string
    nombre: string
    rfc?: string
    razon_social?: string
    direccion?: string
    telefono?: string
    email?: string
    logo_url?: string
    plan: 'trial' | 'basico' | 'profesional' | 'enterprise'
    activo: boolean
    fecha_inicio?: string
    fecha_vencimiento?: string
    limite_usuarios?: number
    limite_pacientes?: number
    created_at: string
}

export interface RolEmpresa {
    id: string
    empresa_id: string | null
    codigo: string
    nombre: string
    descripcion: string | null
    color: string
    icono: string
    nivel_jerarquia: number
    es_sistema: boolean
    es_editable: boolean
    activo: boolean
    permisos?: PermisoRol[]
}

export interface PermisoRol {
    id?: string
    rol_id: string
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
    filtro_sede: boolean
}

export interface UsuarioEmpresa {
    id: string
    email: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string
    empresa_id: string | null
    rol_empresa_id: string | null
    rol?: RolEmpresa
    sedes_acceso: string[]
    cargo?: string
    fecha_ingreso?: string
    activo: boolean
    avatar_url?: string
    ultimo_acceso?: string
    created_at: string
}

export interface InvitacionUsuario {
    id: string
    empresa_id: string
    email: string
    nombre?: string
    rol_empresa_id: string
    rol?: RolEmpresa
    sedes_acceso: string[]
    cargo?: string
    token: string
    expira_en: string
    usado: boolean
    creado_por: string
    created_at: string
}

export interface CrearEmpresaDTO {
    nombre: string
    rfc?: string
    razon_social?: string
    direccion?: string
    telefono?: string
    email?: string
    plan?: 'trial' | 'basico' | 'profesional' | 'enterprise'
    // Primer usuario admin
    admin_email: string
    admin_nombre: string
    admin_password?: string
    // Roles a habilitar (opcionales, si no se especifican se crean todos los base)
    roles_habilitados?: string[] // ['medico', 'enfermera', 'recepcion', 'asistente']
}

export interface InvitarUsuarioDTO {
    email: string
    nombre?: string
    rol_empresa_id: string
    sedes_acceso?: string[]
    cargo?: string
}

// =====================================================
// SERVICIO DE EMPRESAS
// =====================================================

export const empresaService = {
    /**
     * Obtiene todas las empresas (solo Super Admin)
     */
    async getAll(): Promise<Empresa[]> {
        const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .order('nombre')

        if (error) throw error
        return data as Empresa[]
    },

    /**
     * Obtiene una empresa por ID
     */
    async getById(id: string): Promise<Empresa | null> {
        const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', id)
            .single()

        if (error) return null
        return data as Empresa
    },

    /**
     * Crea una nueva empresa con auto-provisión de roles
     * El trigger de Supabase creará automáticamente los roles base
     */
    async crear(dto: CrearEmpresaDTO): Promise<{ success: boolean; empresaId?: string; error?: string }> {
        try {
            // 1. Crear la empresa
            const { data: empresa, error: empresaError } = await supabase
                .from('empresas')
                .insert({
                    nombre: dto.nombre,
                    rfc: dto.rfc,
                    razon_social: dto.razon_social,
                    direccion: dto.direccion,
                    telefono: dto.telefono,
                    email: dto.email,
                    plan: dto.plan || 'trial',
                    activo: true,
                    fecha_inicio: new Date().toISOString(),
                    fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días trial
                })
                .select()
                .single()

            if (empresaError) throw empresaError

            // 2. Esperar un momento para que el trigger cree los roles
            await new Promise(resolve => setTimeout(resolve, 500))

            // 3. Obtener el rol de admin creado automáticamente
            const { data: rolAdmin, error: rolError } = await supabase
                .from('roles_empresa')
                .select('id')
                .eq('empresa_id', empresa.id)
                .eq('codigo', 'admin_empresa')
                .single()

            if (rolError || !rolAdmin) {
                // Si falla el trigger, crear roles manualmente
                await supabase.rpc('crear_roles_base_empresa', { p_empresa_id: empresa.id })

                // Reintentar obtener el rol
                const { data: rolAdminRetry } = await supabase
                    .from('roles_empresa')
                    .select('id')
                    .eq('empresa_id', empresa.id)
                    .eq('codigo', 'admin_empresa')
                    .single()

                if (!rolAdminRetry) throw new Error('No se pudieron crear los roles base')
            }

            // 4. Si hay roles específicos para deshabilitar
            if (dto.roles_habilitados && dto.roles_habilitados.length > 0) {
                const rolesADeshabilitar = ['medico', 'enfermera', 'recepcion', 'asistente']
                    .filter(r => !dto.roles_habilitados!.includes(r))

                if (rolesADeshabilitar.length > 0) {
                    await supabase
                        .from('roles_empresa')
                        .update({ activo: false })
                        .eq('empresa_id', empresa.id)
                        .in('codigo', rolesADeshabilitar)
                }
            }

            // 5. Crear usuario admin si se proporciona contraseña
            if (dto.admin_password) {
                // Registrar usuario en Supabase Auth
                const { data: authUser, error: authError } = await supabase.auth.signUp({
                    email: dto.admin_email,
                    password: dto.admin_password,
                    options: {
                        data: {
                            nombre: dto.admin_nombre,
                            empresa_id: empresa.id
                        }
                    }
                })

                if (authError) throw authError

                // Actualizar perfil con empresa y rol
                if (authUser.user) {
                    const { data: nuevoRolAdmin } = await supabase
                        .from('roles_empresa')
                        .select('id')
                        .eq('empresa_id', empresa.id)
                        .eq('codigo', 'admin_empresa')
                        .single()

                    await supabase
                        .from('profiles')
                        .upsert({
                            id: authUser.user.id,
                            email: dto.admin_email,
                            nombre: dto.admin_nombre.split(' ')[0],
                            apellido_paterno: dto.admin_nombre.split(' ').slice(1).join(' ') || '',
                            empresa_id: empresa.id,
                            rol_empresa_id: nuevoRolAdmin?.id,
                            rol: 'admin_empresa',
                            activo: true
                        })
                }
            }

            return { success: true, empresaId: empresa.id }
        } catch (error: any) {
            console.error('Error creando empresa:', error)
            return { success: false, error: error.message }
        }
    },

    /**
     * Actualiza una empresa
     */
    async actualizar(id: string, datos: Partial<Empresa>): Promise<{ success: boolean; error?: string }> {
        const { error } = await supabase
            .from('empresas')
            .update({
                ...datos,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) return { success: false, error: error.message }
        return { success: true }
    },

    /**
     * Activa o desactiva una empresa
     */
    async toggleStatus(id: string, activo: boolean): Promise<{ success: boolean; error?: string }> {
        const { error } = await supabase
            .from('empresas')
            .update({ activo })
            .eq('id', id)

        if (error) return { success: false, error: error.message }
        return { success: true }
    }
}

// =====================================================
// SERVICIO DE ROLES POR EMPRESA
// =====================================================

export const rolesEmpresaService = {
    /**
     * Obtiene los roles de una empresa
     */
    async getByEmpresa(empresaId: string): Promise<RolEmpresa[]> {
        const { data, error } = await supabase
            .from('roles_empresa')
            .select(`
        *,
        permisos:permisos_rol(*)
      `)
            .eq('empresa_id', empresaId)
            .order('nivel_jerarquia')

        if (error) throw error
        return data as RolEmpresa[]
    },

    /**
     * Obtiene roles activos de una empresa (para dropdown de asignación)
     */
    async getActivosByEmpresa(empresaId: string): Promise<RolEmpresa[]> {
        const { data, error } = await supabase
            .from('roles_empresa')
            .select('id, codigo, nombre, color, icono, nivel_jerarquia')
            .eq('empresa_id', empresaId)
            .eq('activo', true)
            .order('nivel_jerarquia')

        if (error) throw error
        return data as RolEmpresa[]
    },

    /**
     * Crea un rol personalizado
     */
    async crear(empresaId: string, rol: Partial<RolEmpresa>, permisos: PermisoRol[]): Promise<{ success: boolean; rolId?: string; error?: string }> {
        try {
            // Crear rol
            const { data: nuevoRol, error: rolError } = await supabase
                .from('roles_empresa')
                .insert({
                    empresa_id: empresaId,
                    codigo: rol.codigo,
                    nombre: rol.nombre,
                    descripcion: rol.descripcion,
                    color: rol.color || '#3B82F6',
                    icono: rol.icono || 'user',
                    nivel_jerarquia: rol.nivel_jerarquia || 5,
                    es_sistema: false,
                    es_editable: true
                })
                .select()
                .single()

            if (rolError) throw rolError

            // Crear permisos
            if (permisos.length > 0) {
                const permisosConRol = permisos.map(p => ({
                    ...p,
                    rol_id: nuevoRol.id
                }))

                const { error: permisosError } = await supabase
                    .from('permisos_rol')
                    .insert(permisosConRol)

                if (permisosError) throw permisosError
            }

            return { success: true, rolId: nuevoRol.id }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    },

    /**
     * Actualiza un rol existente
     */
    async actualizar(rolId: string, rol: Partial<RolEmpresa>, permisos?: PermisoRol[]): Promise<{ success: boolean; error?: string }> {
        try {
            // Actualizar rol
            const { error: rolError } = await supabase
                .from('roles_empresa')
                .update({
                    nombre: rol.nombre,
                    descripcion: rol.descripcion,
                    color: rol.color,
                    icono: rol.icono,
                    nivel_jerarquia: rol.nivel_jerarquia,
                    updated_at: new Date().toISOString()
                })
                .eq('id', rolId)
                .eq('es_editable', true)

            if (rolError) throw rolError

            // Actualizar permisos si se proporcionan
            if (permisos) {
                // Eliminar permisos existentes
                await supabase
                    .from('permisos_rol')
                    .delete()
                    .eq('rol_id', rolId)

                // Insertar nuevos permisos
                if (permisos.length > 0) {
                    const permisosConRol = permisos.map(p => ({
                        ...p,
                        rol_id: rolId
                    }))

                    await supabase
                        .from('permisos_rol')
                        .insert(permisosConRol)
                }
            }

            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    },

    /**
     * Elimina un rol (solo si es editable y no tiene usuarios)
     */
    async eliminar(rolId: string): Promise<{ success: boolean; error?: string }> {
        // Verificar que no tenga usuarios asignados
        const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('rol_empresa_id', rolId)

        if (count && count > 0) {
            return { success: false, error: 'No se puede eliminar un rol con usuarios asignados' }
        }

        const { error } = await supabase
            .from('roles_empresa')
            .delete()
            .eq('id', rolId)
            .eq('es_editable', true)
            .eq('es_sistema', false)

        if (error) return { success: false, error: error.message }
        return { success: true }
    },

    /**
     * Activa o desactiva un rol
     */
    async toggleStatus(rolId: string, activo: boolean): Promise<{ success: boolean; error?: string }> {
        const { error } = await supabase
            .from('roles_empresa')
            .update({ activo })
            .eq('id', rolId)

        if (error) return { success: false, error: error.message }
        return { success: true }
    }
}

// =====================================================
// SERVICIO DE USUARIOS POR EMPRESA
// =====================================================

export const usuariosEmpresaService = {
    /**
     * Obtiene todos los usuarios de una empresa
     */
    async getByEmpresa(empresaId: string): Promise<UsuarioEmpresa[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
        *,
        rol:roles_empresa(id, codigo, nombre, color, icono)
      `)
            .eq('empresa_id', empresaId)
            .order('nombre')

        if (error) throw error
        return data as unknown as UsuarioEmpresa[]
    },

    /**
     * Obtiene un usuario por ID
     */
    async getById(userId: string): Promise<UsuarioEmpresa | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
        *,
        rol:roles_empresa(*)
      `)
            .eq('id', userId)
            .single()

        if (error) return null
        return data as unknown as UsuarioEmpresa
    },

    /**
     * Actualiza un usuario
     */
    async actualizar(userId: string, datos: Partial<UsuarioEmpresa>): Promise<{ success: boolean; error?: string }> {
        const { error } = await supabase
            .from('profiles')
            .update({
                nombre: datos.nombre,
                apellido_paterno: datos.apellido_paterno,
                apellido_materno: datos.apellido_materno,
                rol_empresa_id: datos.rol_empresa_id,
                sedes_acceso: datos.sedes_acceso,
                cargo: datos.cargo,
                activo: datos.activo
            })
            .eq('id', userId)

        if (error) return { success: false, error: error.message }
        return { success: true }
    },

    /**
     * Desactiva un usuario
     */
    async desactivar(userId: string): Promise<{ success: boolean; error?: string }> {
        const { error } = await supabase
            .from('profiles')
            .update({ activo: false })
            .eq('id', userId)

        if (error) return { success: false, error: error.message }
        return { success: true }
    },

    /**
     * Reactiva un usuario
     */
    async reactivar(userId: string): Promise<{ success: boolean; error?: string }> {
        const { error } = await supabase
            .from('profiles')
            .update({ activo: true })
            .eq('id', userId)

        if (error) return { success: false, error: error.message }
        return { success: true }
    }
}

// =====================================================
// SERVICIO DE INVITACIONES
// =====================================================

export const invitacionesService = {
    /**
     * Obtiene invitaciones pendientes de una empresa
     */
    async getPendientes(empresaId: string): Promise<InvitacionUsuario[]> {
        const { data, error } = await supabase
            .from('invitaciones_usuario')
            .select(`
        *,
        rol:roles_empresa(id, codigo, nombre, color)
      `)
            .eq('empresa_id', empresaId)
            .eq('usado', false)
            .gt('expira_en', new Date().toISOString())
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as unknown as InvitacionUsuario[]
    },

    /**
     * Crea una nueva invitación
     */
    async crear(empresaId: string, dto: InvitarUsuarioDTO, creadoPor: string): Promise<{ success: boolean; token?: string; error?: string }> {
        try {
            // Generar token único
            const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')

            const { data, error } = await supabase
                .from('invitaciones_usuario')
                .insert({
                    empresa_id: empresaId,
                    email: dto.email.toLowerCase(),
                    nombre: dto.nombre,
                    rol_empresa_id: dto.rol_empresa_id,
                    sedes_acceso: dto.sedes_acceso || [],
                    cargo: dto.cargo,
                    token,
                    expira_en: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
                    creado_por: creadoPor
                })
                .select()
                .single()

            if (error) throw error

            // TODO: Enviar email con enlace de invitación
            // await sendInvitationEmail(dto.email, token, empresaId)

            return { success: true, token }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    },

    /**
     * Cancela una invitación
     */
    async cancelar(invitacionId: string): Promise<{ success: boolean; error?: string }> {
        const { error } = await supabase
            .from('invitaciones_usuario')
            .delete()
            .eq('id', invitacionId)

        if (error) return { success: false, error: error.message }
        return { success: true }
    },

    /**
     * Verifica si un token de invitación es válido
     */
    async verificarToken(token: string): Promise<InvitacionUsuario | null> {
        const { data, error } = await supabase
            .from('invitaciones_usuario')
            .select(`
        *,
        rol:roles_empresa(id, codigo, nombre, color),
        empresa:empresas(id, nombre, logo_url)
      `)
            .eq('token', token)
            .eq('usado', false)
            .gt('expira_en', new Date().toISOString())
            .single()

        if (error) return null
        return data as unknown as InvitacionUsuario
    },

    /**
     * Acepta una invitación (llamado después del signup)
     */
    async aceptar(token: string, userId: string): Promise<{ success: boolean; error?: string }> {
        const { data, error } = await supabase
            .rpc('aceptar_invitacion', {
                p_token: token,
                p_user_id: userId
            })

        if (error || !data) {
            return { success: false, error: error?.message || 'Invitación inválida o expirada' }
        }

        return { success: true }
    }
}

// =====================================================
// EXPORT
// =====================================================

export const tenantService = {
    empresas: empresaService,
    roles: rolesEmpresaService,
    usuarios: usuariosEmpresaService,
    invitaciones: invitacionesService
}

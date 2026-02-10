
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        const { email, password, nombre, apellido_paterno, empresa_id, rol, permisos } = await req.json()

        // 1. Validar datos obligatorios
        if (!email || !password || !empresa_id || !rol) {
            throw new Error('Faltan campos obligatorios: email, password, empresa_id, rol')
        }

        // 2. Crear usuario en Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { nombre, apellido_paterno, empresa_id, rol }
        })

        if (authError) throw authError
        if (!authUser.user) throw new Error('No se pudo crear el usuario en Auth')

        const userId = authUser.user.id

        // 3. Crear perfil en tabla 'profiles'
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: userId,
                email,
                nombre,
                apellido_paterno,
                empresa_id,
                rol_principal: rol,
                activo: true
            })

        if (profileError) {
            await supabaseAdmin.auth.admin.deleteUser(userId)
            throw new Error(`Error creando perfil: ${profileError.message}`)
        }

        // 4. Asignar Rol en tabla 'user_roles'
        const { data: roleData } = await supabaseAdmin
            .from('roles')
            .select('id')
            .eq('nombre', rol)
            .single()

        if (roleData) {
            const { error: userRoleError } = await supabaseAdmin
                .from('user_roles')
                .insert({ user_id: userId, role_id: roleData.id, empresa_id })

            if (userRoleError) {
                console.error('Error asignando rol en user_roles:', userRoleError)
            }
        } else {
            console.warn(`Rol '${rol}' no encontrado en tabla roles, saltando asignación`)
        }

        // 5. Guardar permisos granulares (si se enviaron)
        if (permisos && Array.isArray(permisos) && permisos.length > 0) {
            const permisosRows = permisos.map((p: any) => ({
                user_id: userId,
                empresa_id,
                modulo: p.modulo,
                ver: p.ver ?? false,
                crear: p.crear ?? false,
                editar: p.editar ?? false,
                borrar: p.borrar ?? false,
                exportar: p.exportar ?? false,
                aprobar: p.aprobar ?? false,
                firmar: p.firmar ?? false,
                imprimir: p.imprimir ?? false,
            }))

            const { error: permisosError } = await supabaseAdmin
                .from('user_permissions')
                .insert(permisosRows)

            if (permisosError) {
                console.error('Error guardando permisos granulares:', permisosError)
            }
        }

        // 6. Enviar Email de Bienvenida
        try {
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: [email],
                    subject: 'Bienvenido a GPMedical',
                    html: `
                        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                            <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 40px; border-radius: 16px 16px 0 0;">
                                <h1 style="color: #fff; margin: 0; font-size: 28px;">🏥 GPMedical</h1>
                                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Sistema Integral de Medicina Ocupacional</p>
                            </div>
                            <div style="background: #fff; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
                                <p style="font-size: 18px;">Hola <strong>${nombre} ${apellido_paterno}</strong>,</p>
                                <p>Tu cuenta ha sido creada exitosamente en el sistema.</p>
                                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #7c3aed;">
                                    <p style="margin: 0; font-weight: 600;">📋 Rol asignado: <span style="color: #7c3aed;">${rol}</span></p>
                                    <p style="margin: 12px 0 0;">🔑 Contraseña temporal: <code style="background: #e5e7eb; padding: 2px 8px; border-radius: 4px;">${password}</code></p>
                                </div>
                                <p style="color: #ef4444; font-weight: 600;">⚠️ Cambia tu contraseña inmediatamente al iniciar sesión.</p>
                                <a href="${req.headers.get('origin') || 'https://gpmedical.app'}" style="background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: 600; margin-top: 16px;">Acceder al Sistema →</a>
                            </div>
                            <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
                                GPMedical 3.5 • Intelligence Bureau • Medicina Ocupacional
                            </div>
                        </div>
                    `
                })
            })
        } catch (emailError) {
            console.error('Error invocando send-email:', emailError)
        }

        // 7. Devolver éxito
        return new Response(
            JSON.stringify({
                user: authUser.user,
                message: 'Usuario creado exitosamente',
                permisos_guardados: permisos?.length || 0
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})

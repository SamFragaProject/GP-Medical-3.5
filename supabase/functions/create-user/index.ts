
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        const { email, password, nombre, apellido_paterno, empresa_id, rol, permisos } = await req.json()

        // 1. Validar datos
        if (!email || !password || !empresa_id || !rol) {
            throw new Error('Faltan campos obligatorios: email, password, empresa_id, rol')
        }

        // 2. Crear usuario en Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto confirmar
            user_metadata: {
                nombre,
                apellido_paterno,
                empresa_id,
                rol // Guardamos el rol como metadata también
            }
        })

        if (authError) throw authError
        if (!authUser.user) throw new Error('No se pudo crear el usuario en Auth')

        const userId = authUser.user.id

        // 3. Crear perfil en tabla 'profiles'
        // Nota: Usamos 'profiles' según 000_init_schema.sql
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
            // Rollback: Eliminar usuario de Auth si falla la creación del perfil
            await supabaseAdmin.auth.admin.deleteUser(userId)
            throw new Error(`Error creando perfil: ${profileError.message}`)
        }

        // 4. Asignar Rol en tabla 'user_roles'
        // Buscar ID del rol por nombre
        const { data: roleData, error: roleError } = await supabaseAdmin
            .from('roles')
            .select('id')
            .eq('nombre', rol)
            .single()

        if (roleData) {
            const { error: userRoleError } = await supabaseAdmin
                .from('user_roles')
                .insert({
                    user_id: userId,
                    role_id: roleData.id,
                    empresa_id: empresa_id
                })

            if (userRoleError) {
                console.error('Error asignando rol en user_roles:', userRoleError)
                // No hacemos rollback completo aquí, pero es importante notarlo
            }
        } else {
            console.warn(`Rol '${rol}' no encontrado en tabla roles, saltando asignación en user_roles`)
        }

        // 5. Enviar Email de Bienvenida
        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        if (resendApiKey) {
            // Import dinámico si es necesario, pero mejor arriba. Añadire el import arriba en otro chunk o asumo que puedo ponerlo aqui?
            // Mejor usar un bloque de reemplazo grande para incluir el import arriba es arriesgado.
            // Voy a usar fetch directo a la funcion 'send-email' para reutilizar logica? 
            // No, mejor usar la libreria aqui directamente.

            // NOTA: Para este environment, necesitamos importar Resend arriba. 
            // Voy a hacer esto en dos pasos o usar fetch a la API de Resend directamente para no depender de la libreria npm si hay problemas de importacion complejos, 
            // pero Deno soporta npm: imports bien.
        }

        // Mejor voy a invocar la funcion 'send-email' que acabo de crear! Asi reutilizo codigo y configuracion.
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
                        <div style="font-family: sans-serif; color: #333;">
                            <h1 style="color: #0ea5e9;">Bienvenido a GPMedical</h1>
                            <p>Hola <strong>${nombre} ${apellido_paterno}</strong>,</p>
                            <p>Tu cuenta ha sido creada exitosamente en el sistema.</p>
                            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>Rol asignado:</strong> ${rol}</p>
                                <p style="margin: 10px 0 0;"><strong>Contraseña temporal:</strong> ${password}</p>
                            </div>
                            <p>Por favor ingresa al sistema y cambia tu contraseña inmediatamente.</p>
                            <a href="${req.headers.get('origin') || 'https://gpmedical.app'}" style="background: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ir al Sistema</a>
                        </div>
                    `
                })
            })
        } catch (emailError) {
            console.error('Error invocando send-email:', emailError)
        }

        // 6. Devolver éxito
        return new Response(
            JSON.stringify({
                user: authUser.user,
                message: 'Usuario creado exitosamente'
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

// Función edge para obtener información del usuario desde Supabase
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token de autorización requerido');
    }

    const token = authHeader.substring(7);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verificar token con Supabase
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Token inválido');
    }

    const userData = await userResponse.json();

    // Obtener información adicional del usuario desde nuestra tabla
    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/saas_users?email=eq.${userData.email}&select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      },
    });

    const dbUsers = await dbResponse.json();
    if (!dbUsers || dbUsers.length === 0) {
      throw new Error('Usuario no encontrado en la base de datos');
    }

    const dbUser = dbUsers[0];

    // Obtener permisos del usuario
    const permissionsResponse = await fetch(
      `${supabaseUrl}/rest/v1/saas_user_permissions?user_id=eq.${dbUser.id}&select=saas_permissions(name,description)`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const permissions = await permissionsResponse.json();
    const userPermissions = permissions.map((p: any) => p.saas_permissions.name);

    const user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      hierarchy: dbUser.hierarchy,
      enterpriseId: dbUser.enterprise_id,
      enterpriseName: dbUser.enterprise_name,
      sede: dbUser.sede,
      phone: dbUser.phone,
      permissions: userPermissions,
      isActive: dbUser.is_active,
      lastLogin: dbUser.last_login
    };

    return new Response(JSON.stringify({ data: user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    const errorResponse = {
      error: {
        code: 'USER_FETCH_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

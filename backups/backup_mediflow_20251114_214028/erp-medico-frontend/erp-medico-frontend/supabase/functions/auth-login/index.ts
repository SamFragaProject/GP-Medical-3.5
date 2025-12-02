// Función edge para manejar el login con Supabase
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
    const { email, password } = await req.json();

    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Autenticar con Supabase Auth
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!authResponse.ok) {
      throw new Error('Credenciales incorrectas');
    }

    const authData = await authResponse.json();

    // Buscar usuario en nuestra tabla personalizada
    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/saas_users?email=eq.${email}&is_active=eq.true&select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      },
    });

    const dbUsers = await dbResponse.json();
    if (!dbUsers || dbUsers.length === 0) {
      throw new Error('Usuario no encontrado o inactivo');
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

    // Actualizar último login
    await fetch(`${supabaseUrl}/rest/v1/saas_users?id=eq.${dbUser.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        last_login: new Date().toISOString(),
      }),
    });

    // Crear sesión
    const sessionResponse = await fetch(`${supabaseUrl}/rest/v1/user_sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: dbUser.id,
        session_token: authData.access_token,
        ip_address: '127.0.0.1', // En producción se obtendría del request
        user_agent: 'erp-medico-frontend',
        expires_at: new Date(Date.now() + authData.expires_in * 1000).toISOString(),
      }),
    });

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
      accessToken: authData.access_token,
      refreshToken: authData.refresh_token,
      expiresAt: authData.expires_in
    };

    return new Response(JSON.stringify({ data: user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en login:', error);
    const errorResponse = {
      error: {
        code: 'LOGIN_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

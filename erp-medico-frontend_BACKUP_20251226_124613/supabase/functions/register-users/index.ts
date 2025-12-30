// Función edge para registrar usuarios en Supabase Auth
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Usuarios a registrar
    const users = [
      { email: 'admin@clinicaroma.com', password: 'demo123' },
      { email: 'medico@clinicaroma.com', password: 'demo123' },
      { email: 'recepcion@clinicaroma.com', password: 'demo123' },
      { email: 'paciente@clinicaroma.com', password: 'demo123' }
    ];

    const results = [];
    
    for (const userData of users) {
      try {
        // Crear usuario en Supabase Auth
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
            phone_confirm: true
          }),
        });

        if (authResponse.ok) {
          const authUser = await authResponse.json();
          results.push({ email: userData.email, success: true, id: authUser.user.id });
        } else {
          const error = await authResponse.json();
          results.push({ email: userData.email, success: false, error: error.message });
        }
      } catch (error) {
        results.push({ email: userData.email, success: false, error: error.message });
      }
    }

    return new Response(JSON.stringify({ data: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error registrando usuarios:', error);
    const errorResponse = {
      error: {
        code: 'REGISTER_USERS_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

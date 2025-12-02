// =============================================
// CHATBOT SUPERINTELIGENTE - Edge Function
// Procesamiento inteligente de mensajes con IA
// =============================================

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
        const { mensaje, conversacion_id, tipo_conversacion, contexto_pagina, rol_usuario } = await req.json();

        if (!mensaje) {
            throw new Error('Mensaje requerido');
        }

        // Obtener claves de entorno
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Configuración de Supabase faltante');
        }

        // Obtener usuario del token de autorización
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Token de autorización requerido');
        }

        const token = authHeader.replace('Bearer ', '');
        
        // Verificar usuario
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Token inválido');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Obtener información del usuario y empresa
        const userInfoResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*,empresa_id`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        const userInfo = await userInfoResponse.json();
        if (!userInfo || userInfo.length === 0) {
            throw new Error('Usuario no encontrado');
        }

        const user = userInfo[0];
        const empresaId = user.empresa_id;

        // Crear o obtener conversación
        let conversacionId = conversacion_id;
        
        if (!conversacionId) {
            // Crear nueva conversación
            const sessionId = crypto.randomUUID();
            const nuevaConversacion = {
                empresa_id: empresaId,
                user_id: userId,
                session_id: sessionId,
                tipo_conversacion: tipo_conversacion || 'asistente_usuario',
                contexto_pagina: contexto_pagina || 'dashboard',
                rol_usuario: rol_usuario || 'usuario',
                estado: 'activa'
            };

            const conversacionResponse = await fetch(`${supabaseUrl}/rest/v1/conversaciones_chatbot`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(nuevaConversacion)
            });

            if (!conversacionResponse.ok) {
                throw new Error('Error al crear conversación');
            }

            const conversacionData = await conversacionResponse.json();
            conversacionId = conversacionData[0].id;
        }

        // Guardar mensaje del usuario
        const mensajeUsuario = {
            conversacion_id: conversacionId,
            mensaje: mensaje,
            es_usuario: true,
            tipo_mensaje: 'texto'
        };

        await fetch(`${supabaseUrl}/rest/v1/mensajes_chatbot`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mensajeUsuario)
        });

        // Analizar intención y sentiment
        const { intent, sentiment, confidence } = await analizarMensaje(mensaje);

        // Buscar en base de conocimiento
        const respuestaConocimiento = await buscarEnBaseConocimiento(
            mensaje, 
            rol_usuario,
            tipo_conversacion,
            supabaseUrl,
            serviceRoleKey
        );

        let respuestaBot = '';
        let metadatos = {};

        if (respuestaConocimiento) {
            respuestaBot = respuestaConocimiento.contenido;
            metadatos = { fuente: 'base_conocimiento', id_conocimiento: respuestaConocimiento.id };
        } else if (openaiApiKey) {
            // Usar OpenAI si está disponible
            respuestaBot = await generarRespuestaIA(
                mensaje,
                rol_usuario,
                contexto_pagina,
                tipo_conversacion,
                openaiApiKey
            );
            metadatos = { fuente: 'openai_gpt' };
        } else {
            // Respuesta genérica
            respuestaBot = await generarRespuestaGenerica(intent, tipo_conversacion, rol_usuario);
            metadatos = { fuente: 'respuesta_generica' };
        }

        // Guardar respuesta del bot
        const mensajeBot = {
            conversacion_id: conversacionId,
            mensaje: respuestaBot,
            es_usuario: false,
            tipo_mensaje: 'texto',
            sentiment: sentiment,
            confidence_score: confidence,
            intent_detectado: intent,
            metadatos: metadatos
        };

        await fetch(`${supabaseUrl}/rest/v1/mensajes_chatbot`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mensajeBot)
        });

        // Actualizar conversación
        await fetch(`${supabaseUrl}/rest/v1/conversaciones_chatbot?id=eq.${conversacionId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fecha_ultimo_mensaje: new Date().toISOString(),
                total_mensajes: 2, // Temporal, se debería calcular
                sentiment_general: sentiment
            })
        });

        // Verificar si necesita escalación
        const necesitaEscalacion = await verificarEscalacion(sentiment, intent, confidence);
        
        return new Response(JSON.stringify({
            data: {
                respuesta: respuestaBot,
                conversacion_id: conversacionId,
                intent: intent,
                sentiment: sentiment,
                confidence: confidence,
                escalacion_requerida: necesitaEscalacion,
                metadatos: metadatos
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error en chatbot:', error);

        const errorResponse = {
            error: {
                code: 'CHATBOT_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// =============================================
// FUNCIONES AUXILIARES
// =============================================

async function analizarMensaje(mensaje) {
    // Análisis básico de intención sin dependencias externas
    const mensajeNorm = mensaje.toLowerCase();
    
    let intent = 'general';
    let sentiment = 'neutral';
    let confidence = 0.7;

    // Detectar intenciones comunes
    if (mensajeNorm.includes('cita') || mensajeNorm.includes('agenda')) {
        intent = 'agendar_cita';
    } else if (mensajeNorm.includes('certificado') || mensajeNorm.includes('documento')) {
        intent = 'generar_certificado';
    } else if (mensajeNorm.includes('examen') || mensajeNorm.includes('ocupacional')) {
        intent = 'consulta_examen';
    } else if (mensajeNorm.includes('plan') || mensajeNorm.includes('precio') || mensajeNorm.includes('suscripción')) {
        intent = 'info_comercial';
    } else if (mensajeNorm.includes('problema') || mensajeNorm.includes('error') || mensajeNorm.includes('falla')) {
        intent = 'soporte_tecnico';
    } else if (mensajeNorm.includes('queja') || mensajeNorm.includes('sugerencia')) {
        intent = 'feedback';
    }

    // Detectar sentimiento básico
    const palabrasPositivas = ['gracias', 'excelente', 'perfecto', 'bueno', 'genial'];
    const palabrasNegativas = ['problema', 'error', 'mal', 'falla', 'molesto', 'frustrado'];
    
    if (palabrasPositivas.some(palabra => mensajeNorm.includes(palabra))) {
        sentiment = 'positivo';
    } else if (palabrasNegativas.some(palabra => mensajeNorm.includes(palabra))) {
        sentiment = 'negativo';
    }

    return { intent, sentiment, confidence };
}

async function buscarEnBaseConocimiento(mensaje, rol, tipoConversacion, supabaseUrl, serviceKey) {
    try {
        // Buscar en base de conocimiento usando full text search
        const query = `${supabaseUrl}/rest/v1/base_conocimiento?and=(activo.eq.true,or(empresa_id.is.null))&order=relevancia.desc&limit=1`;
        
        const response = await fetch(query, {
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return null;

        const resultados = await response.json();
        
        // Búsqueda simple por palabras clave
        const mensajeNorm = mensaje.toLowerCase();
        for (const item of resultados) {
            const palabrasClave = item.palabras_clave || [];
            if (palabrasClave.some(palabra => mensajeNorm.includes(palabra.toLowerCase()))) {
                return item;
            }
        }

        return null;
    } catch (error) {
        console.error('Error buscando en base de conocimiento:', error);
        return null;
    }
}

async function generarRespuestaIA(mensaje, rol, contexto, tipo, openaiKey) {
    try {
        const prompt = `Eres un asistente médico especializado en medicina del trabajo. 
Usuario: ${rol}, Contexto: ${contexto}, Tipo: ${tipo}
Pregunta: ${mensaje}

Responde de manera profesional, concisa y útil. Si es sobre medicina del trabajo, incluye información relevante sobre normativas mexicanas cuando aplique.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('Error en API de OpenAI');
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error('Error generando respuesta IA:', error);
        return await generarRespuestaGenerica('general', tipo, rol);
    }
}

async function generarRespuestaGenerica(intent, tipo, rol) {
    const respuestas = {
        'agendar_cita': 'Para agendar una cita, ve al módulo "Agenda & Citas" y selecciona "Nueva Cita". Podrás elegir el paciente, tipo de examen y horario disponible.',
        
        'generar_certificado': 'Para generar un certificado médico, ve al expediente del paciente, selecciona el examen completado y haz clic en "Generar Certificado".',
        
        'consulta_examen': 'Los exámenes ocupacionales incluyen: ingreso, periódicos, egreso y especiales. Cada tipo tiene protocolos específicos según el puesto de trabajo.',
        
        'info_comercial': 'Tenemos 3 planes: Básico ($499/mes), Profesional ($999/mes) y Enterprise ($2,499/mes). Cada uno incluye diferentes funcionalidades y límites.',
        
        'soporte_tecnico': 'Estoy aquí para ayudarte. ¿Podrías describir con más detalle el problema que estás experimentando?',
        
        'feedback': 'Agradecemos tu feedback. Si tienes una queja o sugerencia específica, puedo ayudarte a crear un ticket de soporte.',
        
        'general': 'Soy tu asistente inteligente de MediFlow. Puedo ayudarte con: agendar citas, generar certificados, información sobre exámenes ocupacionales, planes comerciales y soporte técnico. ¿En qué puedo asistirte?'
    };

    return respuestas[intent] || respuestas['general'];
}

async function verificarEscalacion(sentiment, intent, confidence) {
    // Escalación automática en casos específicos
    if (sentiment === 'negativo' && (intent === 'soporte_tecnico' || intent === 'feedback')) {
        return true;
    }
    
    if (confidence < 0.3) {
        return true;
    }
    
    return false;
}
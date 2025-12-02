// =============================================
// GESTIÓN DE TICKETS DE SOPORTE - Edge Function
// Sistema de tickets integrado con chatbot
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
        const requestData = await req.json();
        const { action, ...params } = requestData;

        // Obtener configuración
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Configuración de Supabase faltante');
        }

        // Verificar autorización
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

        let resultado;

        switch (action) {
            case 'crear_ticket':
                resultado = await crearTicket(params, userId, supabaseUrl, serviceRoleKey);
                break;
            case 'actualizar_ticket':
                resultado = await actualizarTicket(params, userId, supabaseUrl, serviceRoleKey);
                break;
            case 'responder_ticket':
                resultado = await responderTicket(params, userId, supabaseUrl, serviceRoleKey);
                break;
            case 'cerrar_ticket':
                resultado = await cerrarTicket(params, userId, supabaseUrl, serviceRoleKey);
                break;
            case 'escalar_conversacion':
                resultado = await escalarConversacion(params, userId, supabaseUrl, serviceRoleKey);
                break;
            case 'listar_tickets':
                resultado = await listarTickets(params, userId, supabaseUrl, serviceRoleKey);
                break;
            default:
                throw new Error('Acción no soportada');
        }

        return new Response(JSON.stringify({
            data: resultado
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error en gestión de tickets:', error);

        const errorResponse = {
            error: {
                code: 'TICKET_MANAGEMENT_ERROR',
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
// FUNCIONES DE GESTIÓN DE TICKETS
// =============================================

async function crearTicket(params, userId, supabaseUrl, serviceKey) {
    const { titulo, descripcion, categoria, prioridad, conversacion_id } = params;

    if (!titulo || !descripcion || !categoria) {
        throw new Error('Título, descripción y categoría son requeridos');
    }

    // Obtener información del usuario
    const userInfoResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
        }
    });

    const userInfo = await userInfoResponse.json();
    if (!userInfo || userInfo.length === 0) {
        throw new Error('Usuario no encontrado');
    }

    const user = userInfo[0];

    // Generar número de ticket único
    const numeroTicket = await generarNumeroTicket(user.empresa_id, supabaseUrl, serviceKey);

    // Calcular SLA según categoría y prioridad
    const sla = calcularSLA(categoria, prioridad);

    // Crear ticket
    const nuevoTicket = {
        empresa_id: user.empresa_id,
        conversacion_id: conversacion_id,
        usuario_id: userId,
        numero_ticket: numeroTicket,
        titulo: titulo,
        descripcion: descripcion,
        categoria: categoria,
        prioridad: prioridad || 'normal',
        estado: 'abierto',
        tiempo_respuesta_sla: sla.respuesta,
        tiempo_resolucion_sla: sla.resolucion,
        tags: categorizarTicket(titulo, descripcion)
    };

    const ticketResponse = await fetch(`${supabaseUrl}/rest/v1/tickets_soporte`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(nuevoTicket)
    });

    if (!ticketResponse.ok) {
        const errorText = await ticketResponse.text();
        throw new Error(`Error creando ticket: ${errorText}`);
    }

    const ticketCreado = await ticketResponse.json();

    // Crear respuesta inicial automática
    await crearRespuestaAutomatica(ticketCreado[0].id, categoria, supabaseUrl, serviceKey);

    // Asignar automáticamente si es posible
    await asignarTicketAutomatico(ticketCreado[0].id, categoria, user.empresa_id, supabaseUrl, serviceKey);

    // Enviar notificaciones
    await enviarNotificacionTicket(ticketCreado[0], 'creado', supabaseUrl, serviceKey);

    return {
        ticket_id: ticketCreado[0].id,
        numero_ticket: numeroTicket,
        estado: 'abierto',
        sla_respuesta: sla.respuesta,
        sla_resolucion: sla.resolucion,
        mensaje: 'Ticket creado exitosamente. Recibirás una respuesta según el SLA establecido.'
    };
}

async function actualizarTicket(params, userId, supabaseUrl, serviceKey) {
    const { ticket_id, ...actualizaciones } = params;

    if (!ticket_id) {
        throw new Error('ID del ticket requerido');
    }

    // Verificar permisos
    const ticket = await verificarPermisosTicket(ticket_id, userId, supabaseUrl, serviceKey);

    // Actualizar ticket
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/tickets_soporte?id=eq.${ticket_id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(actualizaciones)
    });

    if (!updateResponse.ok) {
        throw new Error('Error actualizando ticket');
    }

    const ticketActualizado = await updateResponse.json();

    return {
        ticket_id: ticket_id,
        cambios_aplicados: Object.keys(actualizaciones),
        estado_actual: ticketActualizado[0].estado
    };
}

async function responderTicket(params, userId, supabaseUrl, serviceKey) {
    const { ticket_id, mensaje, es_interno } = params;

    if (!ticket_id || !mensaje) {
        throw new Error('ID del ticket y mensaje son requeridos');
    }

    // Verificar que el ticket existe
    const ticket = await verificarPermisosTicket(ticket_id, userId, supabaseUrl, serviceKey);

    // Crear respuesta
    const nuevaRespuesta = {
        ticket_id: ticket_id,
        usuario_id: userId,
        mensaje: mensaje,
        es_interno: es_interno || false
    };

    const respuestaResponse = await fetch(`${supabaseUrl}/rest/v1/respuestas_ticket`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(nuevaRespuesta)
    });

    if (!respuestaResponse.ok) {
        throw new Error('Error creando respuesta');
    }

    // Actualizar estado del ticket y timestamp de primera respuesta
    const actualizaciones = {
        estado: ticket.estado === 'abierto' ? 'en_progreso' : ticket.estado
    };

    if (!ticket.fecha_primera_respuesta && !es_interno) {
        actualizaciones.fecha_primera_respuesta = new Date().toISOString();
    }

    await fetch(`${supabaseUrl}/rest/v1/tickets_soporte?id=eq.${ticket_id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(actualizaciones)
    });

    const respuestaCreada = await respuestaResponse.json();

    return {
        respuesta_id: respuestaCreada[0].id,
        ticket_id: ticket_id,
        estado_ticket: actualizaciones.estado,
        es_primera_respuesta: !ticket.fecha_primera_respuesta && !es_interno
    };
}

async function cerrarTicket(params, userId, supabaseUrl, serviceKey) {
    const { ticket_id, comentarios_cierre, satisfaccion_usuario } = params;

    if (!ticket_id) {
        throw new Error('ID del ticket requerido');
    }

    // Verificar permisos
    await verificarPermisosTicket(ticket_id, userId, supabaseUrl, serviceKey);

    // Cerrar ticket
    const actualizaciones = {
        estado: 'cerrado',
        fecha_resolucion: new Date().toISOString(),
        comentarios_cierre: comentarios_cierre,
        satisfaccion_usuario: satisfaccion_usuario
    };

    const closeResponse = await fetch(`${supabaseUrl}/rest/v1/tickets_soporte?id=eq.${ticket_id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(actualizaciones)
    });

    if (!closeResponse.ok) {
        throw new Error('Error cerrando ticket');
    }

    const ticketCerrado = await closeResponse.json();

    // Actualizar métricas
    await actualizarMetricasTicket(ticketCerrado[0], supabaseUrl, serviceKey);

    return {
        ticket_id: ticket_id,
        estado: 'cerrado',
        fecha_resolucion: actualizaciones.fecha_resolucion,
        satisfaccion: satisfaccion_usuario
    };
}

async function escalarConversacion(params, userId, supabaseUrl, serviceKey) {
    const { conversacion_id, motivo_escalacion } = params;

    if (!conversacion_id) {
        throw new Error('ID de conversación requerido');
    }

    // Obtener conversación
    const conversacionResponse = await fetch(`${supabaseUrl}/rest/v1/conversaciones_chatbot?id=eq.${conversacion_id}`, {
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
        }
    });

    const conversaciones = await conversacionResponse.json();
    if (!conversaciones || conversaciones.length === 0) {
        throw new Error('Conversación no encontrada');
    }

    const conversacion = conversaciones[0];

    // Obtener mensajes de la conversación
    const mensajesResponse = await fetch(`${supabaseUrl}/rest/v1/mensajes_chatbot?conversacion_id=eq.${conversacion_id}&order=created_at.asc`, {
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
        }
    });

    const mensajes = await mensajesResponse.json();

    // Crear ticket automáticamente
    const descripcionTicket = `Escalación desde chatbot.\nMotivo: ${motivo_escalacion}\n\nHistorial de conversación:\n${
        mensajes.map(m => `${m.es_usuario ? 'Usuario' : 'Bot'}: ${m.mensaje}`).join('\n')
    }`;

    const ticketParams = {
        titulo: 'Escalación desde chatbot',
        descripcion: descripcionTicket,
        categoria: 'soporte_tecnico',
        prioridad: 'alta',
        conversacion_id: conversacion_id
    };

    const ticketCreado = await crearTicket(ticketParams, userId, supabaseUrl, serviceKey);

    // Marcar conversación como escalada
    await fetch(`${supabaseUrl}/rest/v1/conversaciones_chatbot?id=eq.${conversacion_id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            escalado_a_humano: true,
            estado: 'escalada'
        })
    });

    return {
        ticket_creado: ticketCreado,
        conversacion_escalada: true,
        numero_ticket: ticketCreado.numero_ticket
    };
}

async function listarTickets(params, userId, supabaseUrl, serviceKey) {
    const { estado, categoria, limit, offset } = params;

    // Construir query
    let query = `${supabaseUrl}/rest/v1/tickets_soporte?usuario_id=eq.${userId}`;
    
    if (estado) query += `&estado=eq.${estado}`;
    if (categoria) query += `&categoria=eq.${categoria}`;
    
    query += `&order=created_at.desc`;
    query += `&limit=${limit || 20}`;
    query += `&offset=${offset || 0}`;

    const ticketsResponse = await fetch(query, {
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
        }
    });

    if (!ticketsResponse.ok) {
        throw new Error('Error obteniendo tickets');
    }

    const tickets = await ticketsResponse.json();

    return {
        tickets: tickets,
        total: tickets.length,
        filtros_aplicados: { estado, categoria }
    };
}

// =============================================
// FUNCIONES AUXILIARES
// =============================================

async function generarNumeroTicket(empresaId, supabaseUrl, serviceKey) {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    
    // Obtener contador de tickets del mes
    const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString();
    const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toISOString();
    
    const countResponse = await fetch(
        `${supabaseUrl}/rest/v1/tickets_soporte?empresa_id=eq.${empresaId}&created_at=gte.${inicioMes}&created_at=lte.${finMes}&select=count`, {
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Accept': 'application/vnd.pgrst.object+json'
        }
    });

    const count = await countResponse.json();
    const consecutivo = (count.count + 1).toString().padStart(4, '0');
    
    return `TK-${año}${mes}-${consecutivo}`;
}

function calcularSLA(categoria, prioridad) {
    const slaMatrix = {
        'bug': { 'baja': { respuesta: 240, resolucion: 72 }, 'normal': { respuesta: 120, resolucion: 48 }, 'alta': { respuesta: 60, resolucion: 24 }, 'critica': { respuesta: 30, resolucion: 8 } },
        'soporte_tecnico': { 'baja': { respuesta: 480, resolucion: 96 }, 'normal': { respuesta: 240, resolucion: 72 }, 'alta': { respuesta: 120, resolucion: 48 }, 'critica': { respuesta: 60, resolucion: 24 } },
        'queja': { 'baja': { respuesta: 360, resolucion: 120 }, 'normal': { respuesta: 180, resolucion: 72 }, 'alta': { respuesta: 120, resolucion: 48 }, 'critica': { respuesta: 60, resolucion: 24 } },
        'sugerencia': { 'baja': { respuesta: 720, resolucion: 168 }, 'normal': { respuesta: 480, resolucion: 120 }, 'alta': { respuesta: 240, resolucion: 72 }, 'critica': { respuesta: 120, resolucion: 48 } }
    };

    return slaMatrix[categoria]?.[prioridad] || { respuesta: 240, resolucion: 72 };
}

function categorizarTicket(titulo, descripcion) {
    const texto = (titulo + ' ' + descripcion).toLowerCase();
    const tags = [];

    // Categorización automática
    if (texto.includes('error') || texto.includes('falla') || texto.includes('problema')) {
        tags.push('bug');
    }
    if (texto.includes('lento') || texto.includes('performance') || texto.includes('velocidad')) {
        tags.push('performance');
    }
    if (texto.includes('login') || texto.includes('acceso') || texto.includes('contraseña')) {
        tags.push('autenticacion');
    }
    if (texto.includes('certificado') || texto.includes('documento') || texto.includes('reporte')) {
        tags.push('documentos');
    }
    if (texto.includes('pago') || texto.includes('factura') || texto.includes('suscripción')) {
        tags.push('facturacion');
    }

    return tags;
}

async function verificarPermisosTicket(ticketId, userId, supabaseUrl, serviceKey) {
    const ticketResponse = await fetch(`${supabaseUrl}/rest/v1/tickets_soporte?id=eq.${ticketId}`, {
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
        }
    });

    const tickets = await ticketResponse.json();
    if (!tickets || tickets.length === 0) {
        throw new Error('Ticket no encontrado');
    }

    const ticket = tickets[0];
    
    // Verificar que el usuario puede acceder al ticket
    if (ticket.usuario_id !== userId) {
        // Aquí se podrían agregar más verificaciones de permisos (admin, soporte, etc.)
        throw new Error('No tienes permisos para acceder a este ticket');
    }

    return ticket;
}

async function crearRespuestaAutomatica(ticketId, categoria, supabaseUrl, serviceKey) {
    const respuestasAutomaticas = {
        'bug': 'Gracias por reportar este problema. Nuestro equipo técnico lo revisará y te contactará pronto.',
        'soporte_tecnico': 'Hemos recibido tu solicitud de soporte. Te ayudaremos a resolver tu consulta lo antes posible.',
        'queja': 'Lamentamos cualquier inconveniente. Tu queja es importante para nosotros y será revisada por nuestro equipo de calidad.',
        'sugerencia': 'Agradecemos tu sugerencia. Todas las ideas son valiosas para mejorar nuestro servicio.'
    };

    const mensaje = respuestasAutomaticas[categoria] || 'Hemos recibido tu ticket y será atendido según nuestro SLA.';

    // Crear respuesta automática del sistema
    await fetch(`${supabaseUrl}/rest/v1/respuestas_ticket`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ticket_id: ticketId,
            usuario_id: '00000000-0000-0000-0000-000000000000', // Sistema
            mensaje: mensaje,
            es_interno: false
        })
    });
}

async function asignarTicketAutomatico(ticketId, categoria, empresaId, supabaseUrl, serviceKey) {
    // Lógica simple de asignación automática
    // En un sistema real, esto sería más sofisticado
    
    const asignacionesDefault = {
        'bug': null, // Se asigna manualmente
        'soporte_tecnico': null, // Se asigna al primer agente disponible
        'queja': null, // Se asigna al responsable de calidad
        'sugerencia': null // Se asigna al equipo de producto
    };

    const asignadoA = asignacionesDefault[categoria];
    
    if (asignadoA) {
        await fetch(`${supabaseUrl}/rest/v1/tickets_soporte?id=eq.${ticketId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ asignado_a: asignadoA })
        });
    }
}

async function enviarNotificacionTicket(ticket, accion, supabaseUrl, serviceKey) {
    // Placeholder para sistema de notificaciones
    // Aquí se implementarían notificaciones por email, SMS, etc.
    console.log(`Notificación: Ticket ${ticket.numero_ticket} ${accion}`);
}

async function actualizarMetricasTicket(ticket, supabaseUrl, serviceKey) {
    // Calcular métricas del ticket cerrado
    const tiempoResolucion = ticket.fecha_resolucion && ticket.created_at
        ? Math.round((new Date(ticket.fecha_resolucion) - new Date(ticket.created_at)) / (1000 * 60 * 60)) // horas
        : null;

    const tiempoRespuesta = ticket.fecha_primera_respuesta && ticket.created_at
        ? Math.round((new Date(ticket.fecha_primera_respuesta) - new Date(ticket.created_at)) / (1000 * 60)) // minutos
        : null;

    // Aquí se actualizarían las métricas agregadas
    console.log(`Métricas - Ticket: ${ticket.numero_ticket}, Tiempo respuesta: ${tiempoRespuesta}min, Tiempo resolución: ${tiempoResolucion}h`);
}
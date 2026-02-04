/**
 * 🤖 SERVICIO DE CHATBOT V2
 * 
 * Integración con OpenAI para respuestas inteligentes
 */

import { supabase } from '@/lib/supabase';

export interface Mensaje {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Conversacion {
  id: string;
  empresaId: string;
  usuarioId?: string;
  titulo?: string;
  mensajes: Mensaje[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotResponse {
  mensaje: string;
  sugerencias?: string[];
  acciones?: {
    tipo: 'navegar' | 'abrir_modal' | 'crear';
    destino?: string;
    datos?: any;
  }[];
}

class ChatbotService {
  private readonly API_URL = import.meta.env.VITE_OPENAI_API_KEY 
    ? 'https://api.openai.com/v1/chat/completions'
    : null;

  private readonly SYSTEM_PROMPT = `Eres MediBot, un asistente virtual especializado en medicina ocupacional y el sistema MediFlow ERP.

CAPACIDADES:
- Responder preguntas sobre medicina del trabajo
- Ayudar con el uso del sistema MediFlow
- Proporcionar información sobre normativas (NOM-035, NOM-006, etc.)
- Asistir en la navegación del sistema
- Dar consejos de salud ocupacional

REGLAS:
- Sé profesional, claro y conciso
- Si no sabes algo, admítelo honestamente
- No des diagnósticos médicos específicos
- Sugiere consultar a un profesional cuando sea necesario
- Usa emojis ocasionalmente para hacer la conversación amigable

CONTEXTO DEL SISTEMA:
- MediFlow es un ERP médico para medicina ocupacional
- Módulos: Pacientes, Agenda, Inventario, Facturación, Reportes
- Cumple con normativas mexicanas de salud ocupacional`;

  /**
   * Enviar mensaje al chatbot
   */
  async enviarMensaje(
    mensaje: string,
    conversacionId?: string,
    contexto?: {
      paginaActual?: string;
      usuarioRol?: string;
      empresaId?: string;
    }
  ): Promise<ChatbotResponse> {
    // Si no hay API key de OpenAI, usar respuestas simuladas inteligentes
    if (!this.API_URL) {
      return this.respuestaSimulada(mensaje, contexto);
    }

    try {
      // Obtener historial de conversación
      const historial = conversacionId 
        ? await this.getHistorial(conversacionId)
        : [];

      // Construir mensajes para OpenAI
      const messages = [
        { role: 'system', content: this.SYSTEM_PROMPT },
        ...historial.slice(-10), // Últimos 10 mensajes
        { role: 'user', content: this.enriquecerContexto(mensaje, contexto) },
      ];

      // Llamar a OpenAI
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la API de OpenAI');
      }

      const data = await response.json();
      const respuesta = data.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';

      // Guardar en base de datos
      const nuevaConversacionId = await this.guardarMensaje(
        conversacionId,
        contexto?.empresaId || '',
        mensaje,
        respuesta
      );

      return {
        mensaje: respuesta,
        sugerencias: this.generarSugerencias(mensaje),
      };

    } catch (error) {
      console.error('Error en chatbot:', error);
      return this.respuestaSimulada(mensaje, contexto);
    }
  }

  /**
   * Respuestas simuladas inteligentes (fallback)
   */
  private respuestaSimulada(
    mensaje: string,
    contexto?: any
  ): ChatbotResponse {
    const lowerMsg = mensaje.toLowerCase();

    // Preguntas comunes
    if (lowerMsg.includes('hola') || lowerMsg.includes('buenos días')) {
      return {
        mensaje: '¡Hola! 👋 Soy MediBot, tu asistente de MediFlow. ¿En qué puedo ayudarte hoy?',
        sugerencias: ['Ver pacientes', 'Crear cita', 'Ver inventario', 'Generar reporte'],
      };
    }

    if (lowerMsg.includes('paciente') || lowerMsg.includes('pacientes')) {
      return {
        mensaje: 'Puedes gestionar pacientes desde el módulo de Pacientes. Allí puedes ver el listado, crear nuevos, editar información y ver su historial clínico.',
        sugerencias: ['Ver listado de pacientes', 'Crear nuevo paciente', 'Buscar paciente'],
        acciones: [{ tipo: 'navegar', destino: '/pacientes' }],
      };
    }

    if (lowerMsg.includes('cita') || lowerMsg.includes('agenda')) {
      return {
        mensaje: 'El módulo de Agenda te permite programar citas, ver el calendario y gestionar disponibilidad de médicos.',
        sugerencias: ['Ver agenda de hoy', 'Crear nueva cita', 'Ver disponibilidad'],
        acciones: [{ tipo: 'navegar', destino: '/agenda' }],
      };
    }

    if (lowerMsg.includes('inventario') || lowerMsg.includes('medicamento')) {
      return {
        mensaje: 'En el inventario puedes controlar stock de medicamentos y materiales. Te avisaré cuando algo esté por agotarse. 📦',
        sugerencias: ['Ver inventario', 'Productos bajo stock', 'Registrar entrada'],
        acciones: [{ tipo: 'navegar', destino: '/inventario' }],
      };
    }

    if (lowerMsg.includes('factura') || lowerMsg.includes('facturar')) {
      return {
        mensaje: 'El módulo de facturación permite crear CFDIs válidos ante el SAT, gestionar clientes fiscales y enviar facturas por email.',
        sugerencias: ['Crear factura', 'Ver facturas', 'Clientes fiscales'],
        acciones: [{ tipo: 'navegar', destino: '/facturacion' }],
      };
    }

    if (lowerMsg.includes('reporte') || lowerMsg.includes('estadística')) {
      return {
        mensaje: 'Puedes generar reportes de pacientes, citas, inventario y más. También hay análisis predictivos disponibles. 📊',
        sugerencias: ['Reporte de pacientes', 'Estadísticas', 'Análisis predictivo'],
        acciones: [{ tipo: 'navegar', destino: '/reportes' }],
      };
    }

    if (lowerMsg.includes('nom-035') || lowerMsg.includes('nom 035')) {
      return {
        mensaje: 'La NOM-035 es la norma oficial mexicana sobre factores de riesgo psicosocial. En MediFlow puedes aplicar cuestionarios de evaluación y generar reportes de cumplimiento.',
        sugerencias: ['Aplicar cuestionario', 'Ver resultados', 'Reporte de cumplimiento'],
      };
    }

    if (lowerMsg.includes('examen') || lowerMsg.includes('ocupacional')) {
      return {
        mensaje: 'Los exámenes ocupacionales incluyen: ingreso, periódicos, egreso, y específicos según el puesto. Puedes programarlos y registrar resultados en el sistema.',
        sugerencias: ['Programar examen', 'Ver resultados', 'Certificados'],
      };
    }

    if (lowerMsg.includes('ayuda') || lowerMsg.includes('help')) {
      return {
        mensaje: `Puedo ayudarte con:
        
• Navegación del sistema
• Información sobre módulos (Pacientes, Agenda, Inventario, Facturación)
• Normativas de medicina ocupacional
• Consejos generales de salud laboral

¿Sobre qué tema necesitas información? 🤔`,
        sugerencias: ['Ver pacientes', 'Crear cita', 'Ver inventario', 'Generar factura'],
      };
    }

    // Respuesta por defecto
    return {
      mensaje: 'Entiendo. Para ayudarte mejor, ¿podrías darme más detalles? Puedo asistirte con navegación del sistema, información sobre normativas, o funcionalidades específicas de MediFlow.',
      sugerencias: ['Ver agenda', 'Consultar pacientes', 'Ver inventario', 'Ayuda general'],
    };
  }

  /**
   * Enriquecer mensaje con contexto
   */
  private enriquecerContexto(mensaje: string, contexto?: any): string {
    let contextoStr = '';
    
    if (contexto?.paginaActual) {
      contextoStr += `[Usuario está en: ${contexto.paginaActual}] `;
    }
    if (contexto?.usuarioRol) {
      contextoStr += `[Rol: ${contexto.usuarioRol}] `;
    }

    return contextoStr + mensaje;
  }

  /**
   * Generar sugerencias basadas en el mensaje
   */
  private generarSugerencias(mensaje: string): string[] {
    const sugerencias: string[] = [];
    const lowerMsg = mensaje.toLowerCase();

    if (lowerMsg.includes('paciente')) {
      sugerencias.push('Ver pacientes', 'Crear paciente');
    }
    if (lowerMsg.includes('cita')) {
      sugerencias.push('Ver agenda', 'Crear cita');
    }
    if (lowerMsg.includes('inventario')) {
      sugerencias.push('Ver inventario', 'Productos bajo stock');
    }

    return sugerencias.length > 0 ? sugerencias : ['Ver agenda', 'Ver pacientes'];
  }

  /**
   * Obtener historial de conversación
   */
  private async getHistorial(conversacionId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('chatbot_mensajes')
      .select('*')
      .eq('conversacion_id', conversacionId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map(m => ({
      role: m.role,
      content: m.content,
    }));
  }

  /**
   * Guardar mensaje en base de datos
   */
  private async guardarMensaje(
    conversacionId: string | undefined,
    empresaId: string,
    mensajeUsuario: string,
    respuesta: string
  ): Promise<string> {
    // Crear conversación si no existe
    let convId = conversacionId;
    
    if (!convId) {
      const { data: conv } = await supabase
        .from('chatbot_conversaciones')
        .insert([{
          empresa_id: empresaId,
          titulo: mensajeUsuario.substring(0, 50),
        }])
        .select()
        .single();
      
      convId = conv?.id;
    }

    // Guardar mensajes
    await supabase.from('chatbot_mensajes').insert([
      {
        conversacion_id: convId,
        role: 'user',
        content: mensajeUsuario,
      },
      {
        conversacion_id: convId,
        role: 'assistant',
        content: respuesta,
      },
    ]);

    return convId!;
  }

  /**
   * Obtener conversaciones del usuario
   */
  async getConversaciones(empresaId: string): Promise<Conversacion[]> {
    const { data, error } = await supabase
      .from('chatbot_conversaciones')
      .select(`
        *,
        mensajes:chatbot_mensajes(*)
      `)
      .eq('empresa_id', empresaId)
      .order('updated_at', { ascending: false });

    if (error || !data) return [];

    return data.map(c => ({
      id: c.id,
      empresaId: c.empresa_id,
      usuarioId: c.usuario_id,
      titulo: c.titulo,
      mensajes: (c.mensajes || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.created_at,
      })),
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
  }
}

export const chatbotService = new ChatbotService();

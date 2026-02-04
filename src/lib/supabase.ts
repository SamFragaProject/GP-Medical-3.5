// Cliente de Supabase para ERP Médico
import { createClient } from '@supabase/supabase-js'

// Usar variables de entorno con fallback a valores por defecto (solo para desarrollo local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kftxftikoydldcexkady.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validar configuración en producción
if (import.meta.env.PROD && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.error('❌ ERROR FATAL: Variables de entorno de Supabase no configuradas en producción.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos base para el sistema
export interface User {
  id: string
  email: string
  nombre: string
  apellido_paterno: string
  apellido_materno?: string
  empresa_id: string
  sede_id?: string
  rol?: string
  avatar_url?: string
  cedula_profesional?: string
  especialidad?: string
  created_at?: string
}

export interface MensajeChatbot {
  id: string
  conversacion_id: string
  mensaje: string
  es_usuario: boolean
  tipo_mensaje: string
  sentiment?: string
  confidence_score?: number
  modelo_usado?: string
  created_at: string
}

// Funciones del chatbot con LLM local (Ollama + CUDA)
import ollamaService from '../services/ollamaService'

export const chatbot = {
  /**
   * Envía un mensaje al LLM local y persiste la conversación en Supabase
   * Soporta multimodalidad: Texto e Imágenes (Vision)
   */
  async enviarMensaje(
    mensaje: string,
    conversacionId?: string,
    tipoConversacion = 'asistente_usuario',
    userId?: string,
    empresaId?: string,
    mediaFile?: { type: 'imagen' | 'audio', data: string } // data en base64 o URL
  ) {
    console.log('Procesando mensaje IA multimodal:', { mensaje, mediaType: mediaFile?.type })

    // Contextos técnicos y médicos según el canal
    const contextosSistema: Record<string, string> = {
      'soporte_tecnico': `Eres soporte técnico de GPMedical. Ayudas con errores del sistema y guías de uso.`,
      'asistente_usuario': `Eres GPMedical EX, el cerebro de inteligencia artificial de este ERP Médico. Analizas datos médicos y normativas.`,
      'atc_comercial': `Eres asesor comercial de GPMedical. Conoces planes y precios del ERP.`,
      'quejas_sugerencias': `Eres asistente de feedback. Empático y profesional.`
    }

    const sistemaContexto = contextosSistema[tipoConversacion] || contextosSistema['asistente_usuario']

    try {
      // 1. Obtener o crear conversación en Supabase
      let activeConvId = conversacionId
      if (!activeConvId && userId && empresaId) {
        const { data: newConv } = await supabase
          .from('conversaciones_chatbot')
          .insert({
            user_id: userId,
            empresa_id: empresaId,
            tipo_conversacion: tipoConversacion,
            session_id: `session-${Date.now()}`
          })
          .select()
          .single()

        if (newConv) activeConvId = newConv.id
      }

      // 2. Guardar mensaje del usuario
      if (activeConvId) {
        await supabase.from('mensajes_chatbot').insert({
          conversacion_id: activeConvId,
          mensaje: mensaje || (mediaFile?.type === 'imagen' ? '[Imagen Médica Enviada]' : '[Audio Enviado]'),
          es_usuario: true,
          tipo_mensaje: mediaFile?.type || 'texto',
          file_url: mediaFile?.data ? 'file_persisted_in_logic' : null
        })
      }

      let resultadoIA: { success: boolean, response?: string, error?: string, model_used?: string, duration_ms?: number };

      // 3. Procesamiento según tipo de medio
      if (mediaFile?.type === 'imagen') {
        // Usar Visión Médica
        resultadoIA = await ollamaService.analyzeMedicalImage(mediaFile.data, mensaje)
      } else {
        // Usar Chat Convencional
        resultadoIA = await ollamaService.chatWithOllama(mensaje, {
          context: sistemaContexto,
          temperature: 0.7
        })
      }

      if (resultadoIA.success && resultadoIA.response) {
        const analisis = await ollamaService.analyzeMessage(resultadoIA.response)

        // 4. Guardar respuesta de la IA
        if (activeConvId) {
          await supabase.from('mensajes_chatbot').insert({
            conversacion_id: activeConvId,
            mensaje: resultadoIA.response,
            es_usuario: false,
            tipo_mensaje: 'texto',
            sentiment: analisis.sentiment,
            confidence_score: analisis.confidence
          })
        }

        return {
          respuesta: resultadoIA.response,
          conversacion_id: activeConvId || `local-${Date.now()}`,
          tipo_mensaje: 'respuesta_bot',
          sentiment: analisis.sentiment,
          confidence: analisis.confidence,
          escalacion_requerida: analisis.sentiment === 'negative' && analisis.confidence > 0.7,
          modelo_usado: resultadoIA.model_used,
          tiempo_respuesta_ms: resultadoIA.duration_ms
        }
      }

      throw new Error(resultadoIA.error || 'Ollama no disponible')

    } catch (error) {
      console.error('Error en chatbot persistence multimodal:', error)
      return {
        respuesta: `El cerebro IA está procesando mucha información o no está disponible. Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        conversacion_id: conversacionId || 'error-conv',
        tipo_mensaje: 'respuesta_bot',
        sentiment: 'neutral',
        confidence: 0.5,
        escalacion_requerida: true
      }
    }
  },

  async obtenerHistorial(conversacionId: string) {
    if (!conversacionId || conversacionId.startsWith('local-')) return []

    const { data, error } = await supabase
      .from('mensajes_chatbot')
      .select('*')
      .eq('conversacion_id', conversacionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error cargando historial:', error)
      return []
    }
    return data
  },

  async escalarConversacion(conversacionId: string, motivo: string) {
    console.log('Escalando conversación:', conversacionId, motivo)

    if (conversacionId && !conversacionId.startsWith('local-')) {
      await supabase
        .from('conversaciones_chatbot')
        .update({ estado: 'escalada' })
        .eq('id', conversacionId)
    }

    return {
      success: true,
      ticket_id: `TKT-${Math.floor(Date.now() / 1000)}`,
      numero_ticket: `MF-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    }
  },

  async verificarEstado() {
    const disponible = await ollamaService.isOllamaAvailable()
    const modelos = disponible ? await ollamaService.getInstalledModels() : []
    return {
      disponible,
      modelos,
      motor: 'ollama',
      aceleracion: 'CUDA/GPU'
    }
  }
}

// Funciones para dashboard v3.5
export const dashboard = {
  async obtenerEstadisticas(empresaId: string) {
    // Intenta obtener de vista_dashboard_empresa
    const { data, error } = await supabase
      .from('vista_dashboard_empresa')
      .select('*')
      .eq('empresa_id', empresaId)
      .single()

    if (!error && data) return data

    // Fallback Mock
    return {
      total_pacientes: 150,
      examenes_pendientes: 12,
      alertas_activas: 3,
      ultimo_update: new Date().toISOString()
    }
  },

  async obtenerAlertas(empresaId: string) {
    const { data } = await supabase
      .from('alertas_riesgo')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('estado', 'activa')
      .order('prioridad', { ascending: false })

    return data || []
  }
}

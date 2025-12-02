// Cliente de Supabase para ERP Médico
import { createClient } from '@supabase/supabase-js'

// Usar variables de entorno con fallback a valores por defecto (para desarrollo)
// ⚠️ IMPORTANTE: En producción, siempre usar variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kbbnxcbsbusatsddrpaw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYm54Y2JzYnVzYXRzZGRycGF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjMzOTIsImV4cCI6MjA3NzQzOTM5Mn0.9vnb0Jzuy4WO4xBX1Zx1fwsviazBZsp5ogKPtwKFCJQ'

// Validar que las variables estén configuradas (solo en producción)
if (import.meta.env.PROD && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.error('⚠️ Variables de entorno de Supabase no configuradas en producción')
  throw new Error('Variables de entorno de Supabase requeridas')
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
}

export interface MensajeChatbot {
  id: string
  conversacion_id: string
  mensaje: string
  es_usuario: boolean
  tipo_mensaje: string
  sentiment?: string
  confidence_score?: number
  created_at: string
}

// Funciones básicas para el chatbot (sin edge functions)
export const chatbot = {
  async enviarMensaje(mensaje: string, conversacionId?: string, tipoConversacion = 'asistente_usuario', contexto?: string) {
    // Simulación básica sin edge functions
    console.log('Simulando envío de mensaje:', mensaje)
    return {
      respuesta: `Lo siento, el sistema de chat está en modo demo. Tu mensaje fue: "${mensaje}". Por favor contacta al administrador para activar el chatbot completo.`,
      conversacion_id: conversacionId || 'demo-conv-1',
      tipo_mensaje: 'respuesta_bot',
      sentiment: 'neutral',
      confidence: 0.5,
      escalacion_requerida: false
    }
  },

  async obtenerHistorial(conversacionId: string) {
    // Retorna historial vacío para evitar errores
    console.log('Obteniendo historial para:', conversacionId)
    return []
  },

  async escalarConversacion(conversacionId: string, motivo: string) {
    // Simulación básica
    console.log('Escalando conversación:', conversacionId, motivo)
    return { 
      success: true, 
      ticket_id: 'demo-ticket-1',
      numero_ticket: 'DEMO-001'
    }
  }
}

// Funciones básicas para dashboard (sin edge functions)
export const dashboard = {
  async obtenerEstadisticas(empresaId: string) {
    // Retorna estadísticas básicas demo
    console.log('Obteniendo estadísticas para empresa:', empresaId)
    return {
      total_pacientes: 150,
      examenes_pendientes: 12,
      alertas_activas: 3,
      ultimo_update: new Date().toISOString()
    }
  },

  async obtenerAlertas(empresaId: string) {
    // Retorna alertas demo
    console.log('Obteniendo alertas para empresa:', empresaId)
    return []
  }
}

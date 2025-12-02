// Cliente demo sin Supabase - VERSIÓN SOLO DEMO
// Esta configuración está deshabilitada para evitar conflictos
// El sistema funciona completamente en modo demo local

// Cliente de Supabase deshabilitado
export const supabase = null

// API de autenticación demo sin llamadas externas
export const authAPI = {
  async login(email: string, password: string) {
    // Esta función está deshabilitada - usar sistema demo local
    throw new Error('Sistema configurado para modo demo - no usar API externa')
  },

  async getUser(token: string) {
    // Esta función está deshabilitada - usar sistema demo local
    throw new Error('Sistema configurado para modo demo - no usar API externa')
  },

  async logout(token: string) {
    // Esta función está deshabilitada - usar sistema demo local
    throw new Error('Sistema configurado para modo demo - no usar API externa')
  }
}

// Tipos base para el sistema (mantenidos para compatibilidad)
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

export interface Empresa {
  id: string
  nombre: string
  rfc?: string
  email?: string
  telefono?: string
  direccion?: string
  logo_url?: string
  plan_id?: string
  activa: boolean
}

export interface Paciente {
  id: string
  empresa_id: string
  numero_empleado: string
  nombre: string
  apellido_paterno: string
  apellido_materno?: string
  fecha_nacimiento: string
  genero: string
  email?: string
  telefono?: string
  puesto_trabajo_id?: string
  estatus: string
  nss?: string
  curp?: string
}

export interface ExamenOcupacional {
  id: string
  empresa_id: string
  paciente_id: string
  tipo_examen: string
  fecha_programada?: string
  fecha_realizada?: string
  estado: string
  aptitud_medica?: string
  observaciones_medicas?: string
  fecha_vigencia?: string
}

export interface ConversacionChatbot {
  id: string
  empresa_id: string
  user_id: string
  session_id: string
  tipo_conversacion: string
  contexto_pagina?: string
  rol_usuario?: string
  estado: string
  sentiment_general?: string
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

// Chatbot deshabilitado - usar versión demo
export const chatbot = {
  async enviarMensaje() {
    throw new Error('Chatbot deshabilitado - usar sistema demo')
  },
  async obtenerHistorial() {
    return []
  },
  async escalarConversacion() {
    throw new Error('Escalación deshabilitada - usar sistema demo')
  }
}

// Análisis predictivo deshabilitado - usar datos demo
export const analisisPredictivo = {
  async analizarRiesgoIndividual() {
    throw new Error('Análisis predictivo deshabilitado - usar sistema demo')
  },
  async analizarRiesgoEmpresa() {
    throw new Error('Análisis predictivo deshabilitado - usar sistema demo')
  }
}

// Gestión de pacientes deshabilitada - usar datos demo
export const pacientes = {
  async obtenerPacientes() {
    throw new Error('Base de datos deshabilitada - usar sistema demo')
  },
  async obtenerHistorialMedico() {
    throw new Error('Base de datos deshabilitada - usar sistema demo')
  }
}

// Exámenes ocupacionales deshabilitados - usar datos demo
export const examenes = {
  async obtenerExamenesPaciente() {
    throw new Error('Base de datos deshabilitada - usar sistema demo')
  },
  async crearExamen() {
    throw new Error('Base de datos deshabilitada - usar sistema demo')
  }
}

// Dashboard deshabilitado - usar datos demo
export const dashboard = {
  async obtenerEstadisticas() {
    throw new Error('Base de datos deshabilitada - usar sistema demo')
  },
  async obtenerAlertas() {
    throw new Error('Base de datos deshabilitada - usar sistema demo')
  }
}
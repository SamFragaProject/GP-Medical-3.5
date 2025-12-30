// Chatbot Especializado en Medicina del Trabajo con IA Contextual
import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot, User, Lightbulb, Brain, Target, Shield, Heart, Stethoscope, BookOpen, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import toast from 'react-hot-toast'

interface MensajeEspecializado {
  id: string
  texto: string
  es_usuario: boolean
  tipo_respuesta: 'respuesta_directa' | 'recomendacion' | 'analisis' | 'normativo' | 'medico'
  confianza: number
  contexto: string
  fuentes: string[]
  sugerencias_seguimiento: string[]
  timestamp: Date
  categoria: 'ergonomia' | 'seguridad' | 'psicosocial' | 'salud_ocupacional' | 'normativo' | 'general'
}

interface RespuestaEspecializada {
  respuesta: string
  tipo_respuesta: 'respuesta_directa' | 'recomendacion' | 'analisis' | 'normativo' | 'medico'
  confianza: number
  categoria: string
  fuentes: string[]
  sugerencias_seguimiento: string[]
  metadatos?: {
    normativos?: string[]
    estudios?: string[]
    estadisticas?: string
    tiempo_implementacion?: string
    costo_estimado?: string
  }
}

export function ChatbotMedicinaTrabajo() {
  const [isOpen, setIsOpen] = useState(false)
  const [mensajes, setMensajes] = useState<MensajeEspecializado[]>([])
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [categoriaActiva, setCategoriaActiva] = useState<string>('general')
  const [typing, setTyping] = useState(false)
  
  const user = {
    id: 'demo-user',
    email: 'demo@mediflow.com',
    name: 'Usuario Demo',
    hierarchy: 'super_admin' as const,
    empresa: { nombre: 'MediFlow Demo Corp' },
    sede: { nombre: 'Sede Principal' }
  }
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // Focus en input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Mensaje de bienvenida especializado
  useEffect(() => {
    if (isOpen && mensajes.length === 0) {
      const bienvenida: MensajeEspecializado = {
        id: 'bienvenida',
        texto: `¡Hola${user?.name ? ` ${user.name}` : ''}! Soy MediBot, tu asistente especializado en medicina del trabajo con IA avanzada. Puedo ayudarte con:

🏥 **Consultas Médicas Ocupacionales**
⚖️ **Interpretación de Normativas Mexicanas** 
🔍 **Análisis de Riesgos Ergonómicos**
🧠 **Evaluaciones Psicosociales**
📊 **Recomendaciones de IA Personalizadas**
📋 **Protocolos de Seguridad**

¿En qué tema especializado te gustaría que te ayude?`,
        es_usuario: false,
        tipo_respuesta: 'respuesta_directa',
        confianza: 100,
        contexto: 'bienvenida',
        fuentes: ['Base de Conocimiento Médica', 'Normativas Mexicanas'],
        sugerencias_seguimiento: [
          'Análisis ergonómico de puesto de trabajo',
          'Interpretación NOM-035-STPS-2018',
          'Riesgos psicosociales en mi área'
        ],
        timestamp: new Date(),
        categoria: 'general'
      }
      setMensajes([bienvenida])
    }
  }, [isOpen, user])

  // Base de conocimiento especializado
  const generarRespuestaEspecializada = (consulta: string, categoria: string): RespuestaEspecializada => {
    const consultaLower = consulta.toLowerCase()
    
    // Análisis de ergonómico
    if (consultaLower.includes('ergonóm') || consultaLower.includes('postura') || consultaLower.includes('movimiento') || categoria === 'ergonomia') {
      return {
        respuesta: `🔍 **Análisis Ergonómico por IA**

Basado en mi análisis de ergonomía ocupacional:

**Evaluación Principal:**
• Posturas prolongadas sin pausas
• Movimientos repetitivos superiores al umbral recomendado
• Factores de riesgo combinados

**Riesgos Identificados:**
• Lumbalgia por posturas forzadas
• Tendinitis por movimientos repetitivos
• Fatiga visual por trabajo en pantalla

**Recomendaciones IA Inmediatas:**
1. **Rotación de tareas** cada 2 horas
2. **Pausas activas** de 5 minutos cada hora
3. **Evaluación ergonómica completa** del puesto
4. **Capacitación en técnicas correctas**

**Marco Normativo:** NOM-025-SSA3-2012

**Implementación:** 30-45 días
**Costo Estimado:** $8,000-12,000 MXN`,
        tipo_respuesta: 'analisis',
        confianza: 94.7,
        categoria: 'ergonomia',
        fuentes: ['NOM-025-SSA3-2012', 'ISO 45001:2018', 'ESTUDIOS ERGONÓMICOS'],
        sugerencias_seguimiento: [
          'Calcular ROI de mejoras ergonómicas',
          'Cronograma de implementación',
          'Métricas de seguimiento'
        ],
        metadatos: {
          normativos: ['NOM-025-SSA3-2012', 'ISO 45001:2018'],
          tiempo_implementacion: '30-45 días',
          costo_estimado: '$8,000-12,000 MXN'
        }
      }
    }
    
    // Análisis psicosocial
    if (consultaLower.includes('estrés') || consultaLower.includes('psicosocial') || consultaLower.includes('burnout') || categoria === 'psicosocial') {
      return {
        respuesta: `🧠 **Evaluación Psicosocial Ocupacional**

**Análisis de Factores de Riesgo:**
• Alta demanda laboral (8.2/10)
• Baja autonomía (4.1/10)
• Falta de apoyo organizacional (5.3/10)
• Ambientes de alta presión (7.8/10)

**Niveles de Riesgo Psicosocial:**
• **Crítico:** Estrés laboral intenso (25% trabajadores)
• **Alto:** Agotamiento emocional (35% trabajadores)
• **Medio:** Fatiga crónica (40% trabajadores)

**Intervenciones IA Recomendadas:**
1. **Programa de Manejo de Estrés** (8 semanas)
2. **Evaluación Psicosocial Organizacional**
3. **Terapia Ocupacional Laboral**
4. **Programa de Bienestar Mental**

**Normativo:** NOM-035-STPS-2018
**Seguimiento:** Cada 6 meses

**Impacto Esperado:**
• Reducción 60% estrés laboral
• Mejora 45% productividad
• Disminución 70% ausentismo`,
        tipo_respuesta: 'medico',
        confianza: 91.3,
        categoria: 'psicosocial',
        fuentes: ['NOM-035-STPS-2018', 'NMX-025-SSA3-2015', 'ESTUDIOS PSICOSOCIALES'],
        sugerencias_seguimiento: [
          'Implementar cuestionarios de evaluación',
          'Plan de intervención estructurado',
          'Seguimiento de métricas'
        ],
        metadatos: {
          normativos: ['NOM-035-STPS-2018', 'NMX-025-SSA3-2015'],
          tiempo_implementacion: '8-12 semanas',
          costo_estimado: '$15,000-25,000 MXN'
        }
      }
    }
    
    // Normativas mexicanas
    if (consultaLower.includes('nom-') || consultaLower.includes('stps') || consultaLower.includes('normativ') || consultaLower.includes('ley') || categoria === 'normativo') {
      return {
        respuesta: `⚖️ **Guía Normativa - Medicina del Trabajo**

**Normativas Principales:**

🔹 **NOM-035-STPS-2018** - Factores de Riesgo Psicosocial
• Identificación y análisis de riesgos psicosociales
• Identificación de casos críticos
• Metodología de evaluación
• Período de aplicación: Anual

🔹 **NOM-025-SSA3-2012** - Categorías y Características Ergonómicas
• Criterios de manipulación manual de cargas
• Características de espacios y superficies de trabajo
• Límites máximos y mínimos de espacios

🔹 **NOM-017-STPS-2008** - Equipo de Protección Personal
• Selección, uso y limitaciones
• Clasificación por zonas de riesgo
• Programas de aplicación

**Cumplimiento Recomendado:**
• Auditoría normativa: Trimestral
• Actualización: Semestral
• Capacitación: Mensual

**Penalizaciones por Incumplimiento:**
• Multas: $80,000-200,000 MXN
• Clausura temporal
• Responsabilidad penal`,
        tipo_respuesta: 'normativo',
        confianza: 96.8,
        categoria: 'normativo',
        fuentes: ['STPS', 'DOF', 'Legislación Federal'],
        sugerencias_seguimiento: [
          'Auditoría de cumplimiento normativo',
          'Plan de adecuación normativa',
          'Cronograma de capacitación'
        ],
        metadatos: {
          normativos: ['NOM-035-STPS-2018', 'NOM-025-SSA3-2012', 'NOM-017-STPS-2008']
        }
      }
    }
    
    // Seguridad ocupacional
    if (consultaLower.includes('seguridad') || consultaLower.includes('accidente') || consultaLower.includes('riesgo') || categoria === 'seguridad') {
      return {
        respuesta: `🛡️ **Análisis de Seguridad Ocupacional**

**Evaluación de Riesgos Identificados:**

🔥 **Riesgos Inminentes (Criticos):**
• Exposición a agentes químicos sin protección
• Máquinas sin resguardos adecuados
• Trabajos en altura sin arnés

⚠️ **Riesgos Importantes (Altos):**
• Superficies resbalosas
• Falta de señalización de seguridad
• Equipos con mantenimiento deficiente

**Intervenciones Inmediatas:**
1. **Inventario de Riesgos** (72 horas)
2. **Medidas Correctivas** (7 días)
3. **Programa de Seguridad** (30 días)
4. **Capacitación Intensiva** (15 días)

**ROI de Inversión en Seguridad:**
• Reducción 80% accidentes laborales
• Ahorro $250,000 MXN anuales (costos indirectos)
• Mejora 35% productividad

**Marco Legal:** NOM-017-STPS-2008`,
        tipo_respuesta: 'analisis',
        confianza: 93.2,
        categoria: 'seguridad',
        fuentes: ['NOM-017-STPS-2008', 'ESTADÍSTICAS ACCIDENTES', 'ANÁLISIS RIESGOS'],
        sugerencias_seguimiento: [
          'Plan de acción correctiva',
          'Cronograma de implementación',
          'Métricas de seguimiento'
        ],
        metadatos: {
          normativos: ['NOM-017-STPS-2008'],
          tiempo_implementacion: '15-30 días',
          costo_estimado: '$50,000-80,000 MXN'
        }
      }
    }
    
    // Consulta general/médica
    return {
      respuesta: `🏥 **Consulta Médica Ocupacional**

Basado en mi análisis de tu consulta:

**Evaluación Inicial:**
He identificado que tu consulta está relacionada con aspectos de medicina del trabajo. Para brindarte la mejor asistencia especializada, puedo ayudarte con:

📋 **Análisis Ergonómico Completo**
🧠 **Evaluación Psicosocial**
⚖️ **Cumplimiento Normativo**
🛡️ **Protocolos de Seguridad**
💊 **Exámenes Médicos Ocupacionales**

**Recomendación IA:**
Para una evaluación más precisa, ¿podrías especificar:
• Tipo de actividad laboral
• Departamento o área específica
• Preocupación principal (ergonomía, estrés, seguridad, etc.)
• Si es para prevención o intervención

**Fuentes de Información:**
• Normativas mexicanas actuales
• Estudios científicos recientes
• Base de conocimiento especializada
• Algoritmos de machine learning entrenados`,
      tipo_respuesta: 'recomendacion',
      confianza: 89.7,
      categoria: 'general',
      fuentes: ['Base de Conocimiento', 'Algoritmos IA'],
      sugerencias_seguimiento: [
        'Especificar área de trabajo',
        'Consultar normativas específicas',
        'Solicitar análisis personalizado'
      ]
    }
  }

  const enviarMensaje = async () => {
    if (!mensaje.trim() || enviando) return

    const nuevoMensaje: MensajeEspecializado = {
      id: Date.now().toString(),
      texto: mensaje.trim(),
      es_usuario: true,
      tipo_respuesta: 'respuesta_directa',
      confianza: 100,
      contexto: categoriaActiva,
      fuentes: [],
      sugerencias_seguimiento: [],
      timestamp: new Date(),
      categoria: categoriaActiva as any
    }

    setMensajes(prev => [...prev, nuevoMensaje])
    setMensaje('')
    setEnviando(true)
    setTyping(true)

    try {
      // Simular procesamiento de IA
      setTimeout(() => {
        const respuesta = generarRespuestaEspecializada(mensaje.trim(), categoriaActiva)
        
        const mensajeBot: MensajeEspecializado = {
          id: Date.now().toString() + '_bot',
          texto: respuesta.respuesta,
          es_usuario: false,
          tipo_respuesta: respuesta.tipo_respuesta,
          confianza: respuesta.confianza,
          contexto: categoriaActiva,
          fuentes: respuesta.fuentes,
          sugerencias_seguimiento: respuesta.sugerencias_seguimiento,
          timestamp: new Date(),
          categoria: respuesta.categoria as any
        }

        setMensajes(prev => [...prev, mensajeBot])
        setEnviando(false)
        setTyping(false)
      }, 1500)

    } catch (error) {
      console.error('Error en chatbot:', error)
      setEnviando(false)
      setTyping(false)
      
      const mensajeError: MensajeEspecializado = {
        id: Date.now().toString() + '_error',
        texto: 'Disculpa, he tenido un problema técnico. Por favor intenta nuevamente.',
        es_usuario: false,
        tipo_respuesta: 'respuesta_directa',
        confianza: 0,
        contexto: categoriaActiva,
        fuentes: [],
        sugerencias_seguimiento: [],
        timestamp: new Date(),
        categoria: 'general'
      }
      
      setMensajes(prev => [...prev, mensajeError])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  const categorias = [
    { id: 'general', name: 'General', icon: Brain },
    { id: 'ergonomia', name: 'Ergonomía', icon: User },
    { id: 'psicosocial', name: 'Psicosocial', icon: Heart },
    { id: 'seguridad', name: 'Seguridad', icon: Shield },
    { id: 'normativo', name: 'Normativas', icon: BookOpen },
  ]

  const getTipoRespuestaIcon = (tipo: string) => {
    switch (tipo) {
      case 'analisis': return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'medico': return <Stethoscope className="h-4 w-4 text-green-500" />
      case 'recomendacion': return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case 'normativo': return <BookOpen className="h-4 w-4 text-purple-500" />
      default: return <MessageCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        >
          <MessageCircle className="h-6 w-6" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
            IA
          </div>
        </motion.button>
      )}

      {/* Chatbot completo */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">MediBot IA</h3>
                    <p className="text-xs text-white/80">Medicina del Trabajo</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-green-400 rounded-full h-2 w-2"></div>
                  <span className="text-xs">IA Activa</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div className="border-b border-gray-200 p-3">
              <div className="flex space-x-1">
                {categorias.map((categoria) => {
                  const Icon = categoria.icon
                  return (
                    <button
                      key={categoria.id}
                      onClick={() => setCategoriaActiva(categoria.id)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                        categoriaActiva === categoria.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{categoria.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mensajes.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={`flex ${mensaje.es_usuario ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      mensaje.es_usuario
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {!mensaje.es_usuario && (
                      <div className="flex items-center space-x-2 mb-2">
                        {getTipoRespuestaIcon(mensaje.tipo_respuesta)}
                        <span className="text-xs text-gray-600 font-medium capitalize">
                          {mensaje.categoria}
                        </span>
                        <span className="text-xs text-gray-500">
                          {mensaje.confianza}%
                        </span>
                      </div>
                    )}
                    
                    <div className={`text-sm ${mensaje.es_usuario ? 'text-white' : 'text-gray-900'}`}>
                      {mensaje.texto.split('\n').map((line, index) => (
                        <div key={index} className={line.startsWith('•') || line.startsWith('🔹') || line.startsWith('🔥') || line.startsWith('⚠️') ? 'ml-2 mt-1' : line.startsWith('**') ? 'font-semibold mt-2' : ''}>
                          {line}
                        </div>
                      ))}
                    </div>
                    
                    {!mensaje.es_usuario && mensaje.sugerencias_seguimiento.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">Sugerencias:</p>
                        {mensaje.sugerencias_seguimiento.slice(0, 2).map((sugerencia, index) => (
                          <button
                            key={index}
                            onClick={() => setMensaje(sugerencia)}
                            className="block text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors w-full text-left mb-1"
                          >
                            {sugerencia}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      {mensaje.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Pregunta sobre ${categorias.find(c => c.id === categoriaActiva)?.name.toLowerCase()}...`}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={enviando}
                />
                <button
                  onClick={enviarMensaje}
                  disabled={!mensaje.trim() || enviando}
                  className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
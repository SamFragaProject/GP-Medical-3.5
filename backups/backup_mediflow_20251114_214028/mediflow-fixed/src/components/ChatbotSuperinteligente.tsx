// Chatbot Superinteligente - Siempre visible en la esquina inferior derecha
import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Phone, AlertCircle, ThumbsUp, ThumbsDown, User, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
// Importación deshabilitada - usar versión demo local
// import { chatbot, MensajeChatbot } from '@/lib/supabase'
import { MensajeChatbot } from '@/lib/supabase'
import { useSaaSAuth } from '@/contexts/SaaSAuthContext'
import toast from 'react-hot-toast'

interface ChatbotProps {
  contexto?: string
  tipoConversacion?: 'soporte_tecnico' | 'asistente_usuario' | 'atc_comercial' | 'quejas_sugerencias'
}

export function ChatbotSuperinteligente({ 
  contexto = 'dashboard', 
  tipoConversacion = 'asistente_usuario' 
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mensajes, setMensajes] = useState<MensajeChatbot[]>([])
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [conversacionId, setConversacionId] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)
  const [modoConversacion, setModoConversacion] = useState(tipoConversacion)
  
  const { user } = useSaaSAuth()
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

  // Mensaje de bienvenida
  useEffect(() => {
    if (isOpen && mensajes.length === 0) {
      const bienvenida: MensajeChatbot = {
        id: 'bienvenida',
        conversacion_id: '',
        mensaje: `¡Hola${user?.name ? ` ${user.name}` : ''}! Soy tu asistente inteligente de MediFlow. ¿En qué puedo ayudarte hoy?`,
        es_usuario: false,
        tipo_mensaje: 'texto',
        created_at: new Date().toISOString()
      }
      setMensajes([bienvenida])
    }
  }, [isOpen, user])

  const enviarMensaje = async () => {
    if (!mensaje.trim() || enviando) return

    const nuevoMensaje: MensajeChatbot = {
      id: Date.now().toString(),
      conversacion_id: conversacionId || '',
      mensaje: mensaje.trim(),
      es_usuario: true,
      tipo_mensaje: 'texto',
      created_at: new Date().toISOString()
    }

    setMensajes(prev => [...prev, nuevoMensaje])
    setMensaje('')
    setEnviando(true)
    setTyping(true)

    try {
      // Simular respuesta de chatbot demo
      const respuestaDemo = {
        conversacion_id: conversacionId || `demo_${Date.now()}`,
        respuesta: 'Hola! Soy el asistente de MediFlow en modo demo. ¿En qué puedo ayudarte con la gestión de pacientes, exámenes ocupacionales, agenda o reportes?'
      }

      // Actualizar conversación ID si es nueva
      if (respuestaDemo.conversacion_id && !conversacionId) {
        setConversacionId(respuestaDemo.conversacion_id)
      }

      // Simular typing delay
      setTimeout(() => {
        const mensajeBot: MensajeChatbot = {
          id: Date.now().toString() + '_bot',
          conversacion_id: respuestaDemo.conversacion_id || '',
          mensaje: respuestaDemo.respuesta,
          es_usuario: false,
          tipo_mensaje: 'texto',
          sentiment: 'neutral', // Demo
          confidence_score: 0.8, // Demo
          created_at: new Date().toISOString()
        }

        setMensajes(prev => [...prev, mensajeBot])
        setTyping(false)

        // No hay sugerencias de escalación en modo demo
      }, 1000 + Math.random() * 1000) // 1-2 segundos de delay realista

    } catch (error) {
      console.error('Error enviando mensaje:', error)
      toast.error('Error comunicándose con el asistente')
      
      const errorMsg: MensajeChatbot = {
        id: Date.now().toString() + '_error',
        conversacion_id: '',
        mensaje: 'Lo siento, hay un problema técnico. Por favor intenta de nuevo o contacta soporte.',
        es_usuario: false,
        tipo_mensaje: 'texto',
        created_at: new Date().toISOString()
      }
      
      setMensajes(prev => [...prev, errorMsg])
      setTyping(false)
    } finally {
      setEnviando(false)
    }
  }

  const mostrarOpcionesEscalacion = () => {
    const opcionesMsg: MensajeChatbot = {
      id: Date.now().toString() + '_escalacion',
      conversacion_id: conversacionId || '',
      mensaje: 'Parece que necesitas ayuda adicional. ¿Te gustaría hablar con un agente humano?',
      es_usuario: false,
      tipo_mensaje: 'opciones',
      created_at: new Date().toISOString()
    }
    
    setMensajes(prev => [...prev, opcionesMsg])
  }

  const escalarAHumano = async () => {
    if (!conversacionId) {
      toast.error('No hay conversación activa para escalar')
      return
    }

    try {
      // Simular escalación demo
      const resultadoDemo = {
        numero_ticket: 'TKT-' + Date.now(),
        status: 'creado'
      }

      const confirmacionMsg: MensajeChatbot = {
        id: Date.now().toString() + '_confirmacion',
        conversacion_id: conversacionId,
        mensaje: `Perfecto. He creado el ticket ${resultadoDemo.numero_ticket} y un agente humano te contactará pronto. Mientras tanto, puedes seguir preguntándome cualquier cosa.`,
        es_usuario: false,
        tipo_mensaje: 'texto',
        created_at: new Date().toISOString()
      }

      setMensajes(prev => [...prev, confirmacionMsg])
      console.log('Escalación demo simulada - no hay Supabase configurado')
      toast.success('Ticket demo creado correctamente')

    } catch (error) {
      console.error('Error escalando conversación:', error)
      toast.error('Error creando ticket de soporte')
    }
  }

  const cambiarModoConversacion = (modo: typeof modoConversacion) => {
    setModoConversacion(modo)
    
    const modos = {
      'soporte_tecnico': 'modo soporte técnico',
      'asistente_usuario': 'modo asistente personal',
      'atc_comercial': 'modo comercial',
      'quejas_sugerencias': 'modo feedback'
    }

    const cambioMsg: MensajeChatbot = {
      id: Date.now().toString() + '_modo',
      conversacion_id: conversacionId || '',
      mensaje: `Perfecto, he cambiado a ${modos[modo]}. ¿En qué puedo ayudarte?`,
      es_usuario: false,
      tipo_mensaje: 'texto',
      created_at: new Date().toISOString()
    }

    setMensajes(prev => [...prev, cambioMsg])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg transition-colors duration-200 relative"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          
          {/* Indicador de nuevo mensaje */}
          {!isOpen && mensajes.length > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-danger w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
            >
              {mensajes.filter(m => !m.es_usuario).length}
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Panel del chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot size={20} className="text-secondary-200" />
                  <div>
                    <h3 className="font-semibold">Asistente MediFlow</h3>
                    <p className="text-xs text-secondary-200">
                      {modoConversacion === 'soporte_tecnico' && 'Soporte Técnico'}
                      {modoConversacion === 'asistente_usuario' && 'Asistente Personal'}
                      {modoConversacion === 'atc_comercial' && 'Asesor Comercial'}
                      {modoConversacion === 'quejas_sugerencias' && 'Feedback'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-secondary-200 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modos de conversación */}
              <div className="flex gap-1 mt-3">
                {[
                  { key: 'asistente_usuario', label: 'Asistente', icon: User },
                  { key: 'soporte_tecnico', label: 'Soporte', icon: AlertCircle },
                  { key: 'atc_comercial', label: 'Comercial', icon: ThumbsUp },
                  { key: 'quejas_sugerencias', label: 'Feedback', icon: ThumbsDown }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => cambiarModoConversacion(key as typeof modoConversacion)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      modoConversacion === key 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'bg-primary-700 text-secondary-200 hover:bg-primary-600'
                    }`}
                  >
                    <Icon size={12} className="inline mr-1" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {mensajes.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.es_usuario ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.es_usuario
                        ? 'bg-primary text-primary-foreground ml-8'
                        : 'bg-white border shadow-sm mr-8'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.mensaje}</p>
                    
                    {/* Opciones de escalación */}
                    {msg.tipo_mensaje === 'opciones' && (
                      <div className="mt-3 space-y-2">
                        <button
                          onClick={escalarAHumano}
                          className="w-full bg-primary text-primary-foreground text-sm py-2 px-3 rounded hover:bg-primary/90 transition-colors"
                        >
                          <Phone size={14} className="inline mr-2" />
                          Hablar con un agente
                        </button>
                        <button
                          onClick={() => setMensajes(prev => prev.filter(m => m.tipo_mensaje !== 'opciones'))}
                          className="w-full bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded hover:bg-gray-200 transition-colors"
                        >
                          Continuar con el bot
                        </button>
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <p className={`text-xs mt-1 ${msg.es_usuario ? 'text-secondary-200' : 'text-gray-500'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border shadow-sm p-3 rounded-lg mr-8">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Escribe tu mensaje (${modoConversacion === 'soporte_tecnico' ? 'soporte' : modoConversacion === 'atc_comercial' ? 'comercial' : 'asistente'})...`}
                  disabled={enviando}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                />
                <button
                  onClick={enviarMensaje}
                  disabled={!mensaje.trim() || enviando}
                  className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Presiona Enter para enviar • Shift+Enter para nueva línea
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
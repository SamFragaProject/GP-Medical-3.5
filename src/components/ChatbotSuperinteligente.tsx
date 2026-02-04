// Chatbot Superinteligente - GPMedical EX (AI-Centered)
import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Phone, AlertCircle, ThumbsUp, ThumbsDown, User, Bot, Image as ImageIcon, Mic, StopCircle, Paperclip, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatbot, MensajeChatbot } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

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

  // Multimedia states
  const [isRecording, setIsRecording] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const user = {
    id: 'demo-user',
    email: 'demo@GPMedical.com',
    name: 'Usuario Demo',
    hierarchy: 'super_admin' as const,
    empresa: { id: 'demo-company-id', nombre: 'GPMedical Demo Corp' },
  }
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && mensajes.length === 0) {
      const bienvenida: MensajeChatbot = {
        id: 'bienvenida',
        conversacion_id: '',
        mensaje: `¡Hola${user?.name ? ` ${user.name}` : ''}! Soy GPMedical EX, el cerebro IA de tu ERP. 
        Puedo ayudarte a analizar Rayos X, predecir riesgos de salud o gestionar tus sedes. ¿Qué necesitas hoy?`,
        es_usuario: false,
        tipo_mensaje: 'texto',
        created_at: new Date().toISOString()
      }
      setMensajes([bienvenida])
    }
  }, [isOpen, user])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        toast.success('Imagen lista para análisis médico')
      }
      reader.readAsDataURL(file)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      toast.success('Escuchando...')
    } catch (err) {
      toast.error('No se pudo acceder al micrófono')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success('Audio capturado (En desarrollo STT)')
      // Aquí se enviaría el blob a un servicio de Speech-to-Text
    }
  }

  const enviarMensaje = async () => {
    if ((!mensaje.trim() && !selectedImage) || enviando) return

    const id = Date.now().toString()
    const nuevoMensaje: MensajeChatbot = {
      id,
      conversacion_id: conversacionId || '',
      mensaje: mensaje.trim() || (selectedImage ? '[Analizando Imagen Médica...]' : ''),
      es_usuario: true,
      tipo_mensaje: selectedImage ? 'imagen' : 'texto',
      created_at: new Date().toISOString()
    }

    setMensajes(prev => [...prev, nuevoMensaje])
    const promptTemp = mensaje
    setMensaje('')
    const imageTemp = selectedImage
    setSelectedImage(null)
    setEnviando(true)
    setTyping(true)

    try {
      const respuesta = await chatbot.enviarMensaje(
        promptTemp,
        conversacionId || undefined,
        modoConversacion,
        user.id,
        user.empresa.id,
        imageTemp ? { type: 'imagen', data: imageTemp } : undefined
      )

      if (respuesta.conversacion_id && !conversacionId) {
        setConversacionId(respuesta.conversacion_id)
      }

      setTimeout(() => {
        const mensajeBot: MensajeChatbot = {
          id: Date.now().toString() + '_bot',
          conversacion_id: respuesta.conversacion_id || '',
          mensaje: respuesta.respuesta,
          es_usuario: false,
          tipo_mensaje: 'texto',
          sentiment: respuesta.sentiment,
          confidence_score: respuesta.confidence,
          created_at: new Date().toISOString()
        }

        setMensajes(prev => [...prev, mensajeBot])
        setTyping(false)

        if (respuesta.escalacion_requerida) {
          mostrarOpcionesEscalacion()
        }
      }, 800)

    } catch (error) {
      console.error('Error enviando mensaje:', error)
      toast.error('Error en el cerebro IA')
      setTyping(false)
    } finally {
      setEnviando(false)
    }
  }

  const mostrarOpcionesEscalacion = () => {
    const opcionesMsg: MensajeChatbot = {
      id: Date.now().toString() + '_escalacion',
      conversacion_id: conversacionId || '',
      mensaje: 'He detectado una situación compleja. ¿Prefieres escalar este caso a un médico especialista humano?',
      es_usuario: false,
      tipo_mensaje: 'opciones',
      created_at: new Date().toISOString()
    }
    setMensajes(prev => [...prev, opcionesMsg])
  }

  const escalarAHumano = async () => {
    if (!conversacionId) return
    try {
      const resultado = await chatbot.escalarConversacion(conversacionId, 'Solicitud de especialista')
      const confirmacionMsg: MensajeChatbot = {
        id: Date.now().toString() + '_confirmacion',
        conversacion_id: conversacionId,
        mensaje: `Entendido. He notificado al Especialista de Turno. Ticket: ${resultado.numero_ticket}.`,
        es_usuario: false,
        tipo_mensaje: 'texto',
        created_at: new Date().toISOString()
      }
      setMensajes(prev => [...prev, confirmacionMsg])
      toast.success('Médico notificado')
    } catch (error) { toast.error('Error al escalar') }
  }

  const cambiarModoConversacion = (modo: typeof modoConversacion) => {
    setModoConversacion(modo)
    setMensajes(prev => [...prev, {
      id: Date.now().toString(),
      conversacion_id: conversacionId || '',
      mensaje: `Cambiando cerebro a modo: ${modo.replace('_', ' ')}`,
      es_usuario: false,
      tipo_mensaje: 'texto',
      created_at: new Date().toISOString()
    }])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  return (
    <>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-4 shadow-[0_10px_30px_rgba(16,185,129,0.4)] transition-all relative group border border-emerald-400/30"
        >
          {isOpen ? <X size={24} /> : (
            <div className="relative">
              <Bot size={24} />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-emerald-600"
              />
            </div>
          )}
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold tracking-widest">
            AIR BRAIN READY
          </span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 100, scale: 0.9, filter: 'blur(10px)' }}
            className="fixed bottom-24 right-6 w-[400px] h-[650px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 flex flex-col z-50 overflow-hidden"
          >
            {/* Header Cyber-style */}
            <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-800 p-6 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Bot size={120} />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                    <Bot size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-black tracking-tight text-lg">GPMedical <span className="text-emerald-400">EX</span></h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Neural ERP Engine</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-1">
                {[
                  { key: 'asistente_usuario', label: 'Cerebro', icon: Bot },
                  { key: 'soporte_tecnico', label: 'Técnico', icon: Zap },
                  { key: 'quejas_sugerencias', label: 'Feedback', icon: ThumbsUp }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => cambiarModoConversacion(key as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${modoConversacion === key
                      ? 'bg-emerald-500 text-slate-900 border-emerald-400'
                      : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10'
                      }`}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mensajes con estilo Premium */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
              {mensajes.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.es_usuario ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.es_usuario ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.es_usuario ? 'order-1' : 'order-2'}`}>
                    <div className={`p-4 rounded-2xl shadow-sm ${msg.es_usuario
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                      }`}>
                      {msg.tipo_mensaje === 'imagen' && (
                        <div className="mb-2 p-2 bg-black/10 rounded-lg">
                          <ImageIcon size={40} className="text-white/50" />
                          <p className="text-[10px] font-bold mt-1 uppercase">Imagen Médica en Proceso...</p>
                        </div>
                      )}
                      <p className="text-sm font-medium leading-relaxed">{msg.mensaje}</p>

                      {msg.tipo_mensaje === 'opciones' && (
                        <div className="mt-4 space-y-2">
                          <Button onClick={escalarAHumano} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 rounded-xl text-xs h-auto uppercase tracking-wider">
                            <Phone size={14} className="mr-2" /> Hablar con Especialista
                          </Button>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block px-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.modelo_usado && ` • ${msg.modelo_usado}`}
                    </span>
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border p-4 rounded-2xl rounded-tl-none flex space-x-1 items-center">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Multimodal */}
            <div className="p-6 bg-white border-t border-slate-100">
              {selectedImage && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-4 relative w-20 h-20 group">
                  <img src={selectedImage} className="w-full h-full object-cover rounded-xl border-2 border-emerald-500 shadow-lg" alt="Upload" />
                  <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                    <X size={12} />
                  </button>
                </motion.div>
              )}

              <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl">
                <div className="flex items-center gap-1 pl-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-white rounded-xl"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    className={`p-2 transition-all rounded-xl ${isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-primary hover:bg-white'}`}
                  >
                    {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                  </button>
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Instrucciones al Cerebro IA..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 font-medium"
                  disabled={enviando}
                />

                <button
                  onClick={enviarMensaje}
                  disabled={(!mensaje.trim() && !selectedImage) || enviando}
                  className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg hover:shadow-emerald-500/30 disabled:opacity-30 transition-all flex items-center justify-center hover:bg-emerald-700"
                >
                  <Send size={18} />
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />

              <p className="text-[9px] font-black text-slate-400 mt-3 text-center uppercase tracking-[0.2em]">
                GPMedical EX • Acelerado por GPULocal CUDA
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

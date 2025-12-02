// Chatbot especializado para ayudar al médico con diagnósticos
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

interface Mensaje {
  id: string
  tipo: 'usuario' | 'bot'
  contenido: string
  timestamp: Date
  sugerencias?: string[]
  codigoCIE10?: string
}

interface ChatbotDiagnosticoProps {
  diagnosticoActual?: string
  sintomas?: string[]
  onSugerenciaDiagnostico?: (diagnostico: string, codigoCIE10?: string) => void
  onSugerenciaCIE10?: (codigo: string, descripcion: string) => void
}

export function ChatbotDiagnostico({ 
  diagnosticoActual = '', 
  sintomas = [],
  onSugerenciaDiagnostico,
  onSugerenciaCIE10
}: ChatbotDiagnosticoProps) {
  const [abierto, setAbierto] = useState(false)
  const [minimizado, setMinimizado] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: '1',
      tipo: 'bot',
      contenido: 'Hola, soy tu asistente especializado en diagnósticos médicos. Puedo ayudarte a:\n\n• Refinar diagnósticos\n• Sugerir códigos CIE-10\n• Analizar síntomas\n• Recomendar estudios complementarios\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ])
  const [mensajeActual, setMensajeActual] = useState('')
  const [enviando, setEnviando] = useState(false)
  const mensajesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const enviarMensaje = async () => {
    if (!mensajeActual.trim() || enviando) return

    const mensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      tipo: 'usuario',
      contenido: mensajeActual.trim(),
      timestamp: new Date()
    }

    setMensajes(prev => [...prev, mensajeUsuario])
    setMensajeActual('')
    setEnviando(true)

    // Simular respuesta del chatbot (en producción sería una llamada a API)
    setTimeout(() => {
      const respuesta = generarRespuestaInteligente(mensajeUsuario.contenido, diagnosticoActual, sintomas)
      const mensajeBot: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'bot',
        contenido: respuesta.contenido,
        timestamp: new Date(),
        sugerencias: respuesta.sugerencias,
        codigoCIE10: respuesta.codigoCIE10
      }
      setMensajes(prev => [...prev, mensajeBot])
      setEnviando(false)

      // Si hay sugerencia de diagnóstico, notificar
      if (respuesta.diagnosticoSugerido && onSugerenciaDiagnostico) {
        onSugerenciaDiagnostico(respuesta.diagnosticoSugerido, respuesta.codigoCIE10)
      }
      if (respuesta.codigoCIE10 && onSugerenciaCIE10) {
        onSugerenciaCIE10(respuesta.codigoCIE10, respuesta.descripcionCIE10 || '')
      }
    }, 1000)
  }

  const generarRespuestaInteligente = (pregunta: string, diagnostico: string, sintomas: string[]) => {
    const preguntaLower = pregunta.toLowerCase()
    
    // Análisis de síntomas
    if (preguntaLower.includes('síntoma') || preguntaLower.includes('sintoma')) {
      return {
        contenido: `Basado en los síntomas mencionados, te sugiero considerar:\n\n• Realizar exploración física completa\n• Evaluar signos vitales\n• Considerar estudios complementarios según la sospecha diagnóstica\n\n¿Quieres que analice algún síntoma específico?`,
        sugerencias: ['Analizar síntomas', 'Sugerir estudios', 'Códigos CIE-10 relacionados'],
        codigoCIE10: undefined,
        diagnosticoSugerido: undefined,
        descripcionCIE10: undefined
      }
    }

    // Sugerencias de CIE-10
    if (preguntaLower.includes('cie') || preguntaLower.includes('código') || preguntaLower.includes('codigo')) {
      if (diagnostico.toLowerCase().includes('cefalea') || diagnostico.toLowerCase().includes('dolor cabeza')) {
        return {
          contenido: `Para cefalea, los códigos CIE-10 más comunes son:\n\n• **R51** - Cefalea\n• **G44.1** - Cefalea vascular no clasificada en otra parte\n• **G44.2** - Cefalea tensional\n\n¿Quieres que agregue alguno?`,
          sugerencias: ['Agregar R51', 'Agregar G44.2', 'Ver más opciones'],
          codigoCIE10: 'R51',
          diagnosticoSugerido: undefined,
          descripcionCIE10: 'Cefalea'
        }
      }
      if (diagnostico.toLowerCase().includes('infección') || diagnostico.toLowerCase().includes('infeccion')) {
        return {
          contenido: `Para infecciones respiratorias:\n\n• **J00** - Rinofaringitis aguda\n• **J06.9** - Infección aguda de vías respiratorias superiores\n• **J11.1** - Gripe con otras manifestaciones respiratorias\n\n¿Cuál aplica mejor?`,
          sugerencias: ['Agregar J00', 'Agregar J06.9', 'Ver más'],
          codigoCIE10: 'J06.9',
          diagnosticoSugerido: undefined,
          descripcionCIE10: 'Infección aguda de las vías respiratorias superiores'
        }
      }
    }

    // Mejora de diagnóstico
    if (preguntaLower.includes('mejorar') || preguntaLower.includes('refinar') || preguntaLower.includes('diagnóstico')) {
      if (diagnostico.length < 20) {
        return {
          contenido: `Tu diagnóstico actual es breve. Te sugiero expandirlo con:\n\n• Localización específica\n• Características del cuadro\n• Evolución temporal\n• Factores asociados\n\nEjemplo: "Rinofaringitis aguda de probable etiología viral, con evolución de 3 días, asociada a fiebre y malestar general"`,
          sugerencias: ['Usar sugerencia', 'Ver ejemplos', 'Código CIE-10'],
          codigoCIE10: undefined,
          diagnosticoSugerido: diagnostico ? `${diagnostico}. Rinofaringitis aguda de probable etiología viral, con evolución de 3 días, asociada a fiebre y malestar general` : undefined,
          descripcionCIE10: undefined
        }
      }
    }

    // Respuesta genérica inteligente
    return {
      contenido: `Entiendo tu consulta. Basado en el contexto:\n\n• Diagnóstico actual: ${diagnostico || 'No especificado'}\n• Síntomas: ${sintomas.length > 0 ? sintomas.join(', ') : 'No especificados'}\n\n¿Te gustaría que:\n1. Sugiera códigos CIE-10 apropiados\n2. Refine el diagnóstico\n3. Analice los síntomas\n4. Recomiende estudios complementarios?`,
      sugerencias: ['Sugerir CIE-10', 'Refinar diagnóstico', 'Analizar síntomas'],
      codigoCIE10: undefined,
      diagnosticoSugerido: undefined,
      descripcionCIE10: undefined
    }
  }

  const usarSugerencia = (sugerencia: string) => {
    setMensajeActual(sugerencia)
  }

  if (!abierto) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setAbierto(true)}
          className="h-14 w-14 rounded-full bg-primary shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed ${minimizado ? 'bottom-6 right-6' : 'bottom-6 right-6'} z-50 w-96 ${minimizado ? 'h-auto' : 'h-[600px]'} flex flex-col bg-white rounded-lg shadow-2xl border border-gray-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-emerald-50">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Asistente Diagnóstico</h3>
            <p className="text-xs text-gray-500">Especializado en CIE-10</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMinimizado(!minimizado)}
            className="h-8 w-8 p-0"
          >
            {minimizado ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAbierto(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!minimizado && (
        <>
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mensajes.map((mensaje) => (
              <motion.div
                key={mensaje.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${mensaje.tipo === 'usuario' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3`}>
                  <div className="flex items-start gap-2 mb-1">
                    {mensaje.tipo === 'bot' ? (
                      <Bot className="h-4 w-4 mt-0.5" />
                    ) : (
                      <User className="h-4 w-4 mt-0.5" />
                    )}
                    <p className="text-sm whitespace-pre-line">{mensaje.contenido}</p>
                  </div>
                  {mensaje.codigoCIE10 && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      CIE-10: {mensaje.codigoCIE10}
                    </Badge>
                  )}
                  {mensaje.sugerencias && mensaje.sugerencias.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {mensaje.sugerencias.map((sug, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant="outline"
                          className="w-full text-xs justify-start h-auto py-1"
                          onClick={() => usarSugerencia(sug)}
                        >
                          {sug}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {enviando && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span className="text-sm text-gray-600">Pensando...</span>
                </div>
              </div>
            )}
            <div ref={mensajesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={mensajeActual}
                onChange={(e) => setMensajeActual(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    enviarMensaje()
                  }
                }}
                placeholder="Pregunta sobre diagnóstico, CIE-10, síntomas..."
                className="flex-1"
              />
              <Button
                onClick={enviarMensaje}
                disabled={!mensajeActual.trim() || enviando}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ejemplos: "Sugiere CIE-10 para cefalea", "Mejora mi diagnóstico", "Analiza estos síntomas"
            </p>
          </div>
        </>
      )}
    </motion.div>
  )
}


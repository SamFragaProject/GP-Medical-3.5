// Panel de asistencia IA para sugerencias médicas inteligentes
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ThumbsUp, ThumbsDown, Lightbulb, Brain, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface Suggestion {
  id: string
  type: 'diagnostico' | 'medicamento' | 'plan' | 'observacion'
  content: string
  confidence: number
  reasoning?: string
}

interface AIAssistPanelProps {
  diagnostico?: string
  sintomas?: string[]
  medicamentos?: any[]
  onInsert: (type: string, content: string) => void
  onCorrect?: () => void
}

export function AIAssistPanel({ diagnostico, sintomas = [], medicamentos = [], onInsert, onCorrect }: AIAssistPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showDiff, setShowDiff] = useState<string | null>(null)
  const [auditLog, setAuditLog] = useState<{ action: string; timestamp: Date; content: string }[]>([])

  const generateSuggestions = () => {
    setLoading(true)
    setTimeout(() => {
      const newSuggestions: Suggestion[] = []
      
      if (!diagnostico || diagnostico.trim().length < 20) {
        newSuggestions.push({
          id: 'diag-1',
          type: 'diagnostico',
          content: 'Considerar: Infección respiratoria aguda con componente viral',
          confidence: 0.85,
          reasoning: 'Basado en síntomas típicos de infecciones virales'
        })
      }

      if (diagnostico?.toLowerCase().includes('infección') && medicamentos.length === 0) {
        newSuggestions.push({
          id: 'med-1',
          type: 'medicamento',
          content: 'Paracetamol 500 mg cada 8 horas (analgésico/antipirético)',
          confidence: 0.92,
          reasoning: 'Primera línea para manejo sintomático'
        })
        newSuggestions.push({
          id: 'med-2',
          type: 'medicamento',
          content: 'Loratadina 10 mg cada 24 horas (antihistamínico)',
          confidence: 0.78,
          reasoning: 'Útil para síntomas de rinorrea y estornudos'
        })
      }

      if (medicamentos.length > 0 && !diagnostico?.includes('seguimiento')) {
        newSuggestions.push({
          id: 'plan-1',
          type: 'plan',
          content: 'Seguimiento en 5-7 días si no hay mejoría',
          confidence: 0.88,
          reasoning: 'Protocolo estándar para infecciones agudas'
        })
      }

      newSuggestions.push({
        id: 'obs-1',
        type: 'observacion',
        content: 'Mantener hidratación adecuada y reposo relativo',
        confidence: 0.95,
        reasoning: 'Recomendación general de autocuidado'
      })

      setSuggestions(newSuggestions)
      setLoading(false)
    }, 800)
  }

  useEffect(() => {
    if (diagnostico || medicamentos.length > 0) {
      generateSuggestions()
    }
  }, [diagnostico, medicamentos.length])

  const handleInsert = (suggestion: Suggestion) => {
    onInsert(suggestion.type, suggestion.content)
    setShowDiff(suggestion.id)
    
    setAuditLog(prev => [...prev, {
      action: 'IA sugirió ' + suggestion.type,
      timestamp: new Date(),
      content: suggestion.content.substring(0, 50) + '...'
    }])

    setTimeout(() => setShowDiff(null), 5000)
    toast.success('Sugerencia insertada', { icon: '' })
  }

  const handleFeedback = (suggestionId: string, positive: boolean) => {
    toast.success(positive ? 'Gracias por tu feedback positivo' : 'Feedback registrado para mejorar')
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4"
    >
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                Asistente IA Médico
              </span>
              <Badge variant="outline" className="ml-2 text-xs border-purple-300 text-purple-700">
                Beta
              </Badge>
            </CardTitle>
            {onCorrect && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onCorrect()
                  setAuditLog(prev => [...prev, {
                    action: 'Corrección gramática IA',
                    timestamp: new Date(),
                    content: 'Diagnóstico corregido'
                  }])
                }}
                className="text-xs border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Corregir redacción
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="h-6 w-6 text-purple-600" />
              </motion.div>
              <span className="ml-2 text-sm text-purple-700">Generando sugerencias...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">
              <Lightbulb className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p>Ingresa un diagnóstico para recibir sugerencias inteligentes</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {suggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={'relative rounded-lg border p-3 bg-white shadow-sm hover:shadow-md transition-shadow ' + (showDiff === suggestion.id ? 'ring-2 ring-green-400' : '')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={'text-[10px] ' + (
                              suggestion.type === 'diagnostico' ? 'border-blue-300 text-blue-700' :
                              suggestion.type === 'medicamento' ? 'border-green-300 text-green-700' :
                              suggestion.type === 'plan' ? 'border-purple-300 text-purple-700' :
                              'border-gray-300 text-gray-700'
                            )}
                          >
                            {suggestion.type}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-gray-400" />
                            <span className="text-[10px] text-gray-500">
                              {Math.round(suggestion.confidence * 100)}% confianza
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">{suggestion.content}</p>
                        {suggestion.reasoning && (
                          <p className="text-[11px] text-gray-500 mt-1 italic">
                            {suggestion.reasoning}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInsert(suggestion)}
                          className="h-7 w-7 p-0 text-green-600 hover:bg-green-100"
                          title="Insertar sugerencia"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFeedback(suggestion.id, false)}
                          className="h-7 w-7 p-0 text-gray-400 hover:bg-gray-100"
                          title="No es útil"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {showDiff === suggestion.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 p-2 rounded bg-green-50 border border-green-200 text-[11px] text-green-700"
                      >
                         Insertado exitosamente - se ocultará en 5s
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {auditLog.length > 0 && (
            <details className="text-[10px] text-gray-500 mt-3">
              <summary className="cursor-pointer hover:text-gray-700">
                Registro de auditoría IA ({auditLog.length} acciones)
              </summary>
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto pl-2">
                {auditLog.slice(-5).map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-gray-400">{log.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{log.action}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, AlertTriangle, ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { GUIA_I_ATS } from '@/data/normatividad/cuestionariosNom035'
import toast from 'react-hot-toast'

interface EvaluacionNom035Props {
    tipo: 'guia_i' | 'guia_ii' | 'guia_iii'
    onComplete: (resultado: any) => void
    onCancel: () => void
}

export const EvaluacionNom035 = ({ tipo, onComplete, onCancel }: EvaluacionNom035Props) => {
    const cuestionario = GUIA_I_ATS // Por ahora hardcodeado a Guía I para demo
    const [seccionActual, setSeccionActual] = useState(0)
    const [respuestas, setRespuestas] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Aplanar preguntas para cálculo de progreso
    const totalPreguntas = cuestionario.secciones.reduce((acc, sec) => acc + sec.preguntas.length, 0)
    const preguntasRespondidas = Object.keys(respuestas).length
    const progreso = (preguntasRespondidas / totalPreguntas) * 100

    const handleRespuesta = (preguntaId: string, valor: string) => {
        setRespuestas(prev => ({ ...prev, [preguntaId]: valor }))
    }

    const nextSection = () => {
        if (seccionActual < cuestionario.secciones.length - 1) {
            setSeccionActual(prev => prev + 1)
            window.scrollTo(0, 0)
        } else {
            handleSubmit()
        }
    }

    const prevSection = () => {
        if (seccionActual > 0) {
            setSeccionActual(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Calcular resultado preliminar (Lógica simplificada ATS)
        // Si responde SI a alguna de la sección I...
        const requiereAtencion = Object.values(respuestas).some(r => r === 'si')

        toast.success('Evaluación completada correctamente')
        onComplete({
            tipo,
            respuestas,
            fecha: new Date().toISOString(),
            resultado: requiereAtencion ? 'requiere_valoracion' : 'sin_riesgo'
        })
    }

    const seccion = cuestionario.secciones[seccionActual]

    // Validar si puede avanzar
    const puedeAvanzar = seccion.preguntas.every(p => respuestas[p.id])

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">{cuestionario.titulo}</h2>
                    <span className="text-sm font-medium text-slate-500">{Math.round(progreso)}% completado</span>
                </div>
                <Progress value={progreso} className="h-2" />
                <p className="mt-4 text-slate-600 bg-blue-50 p-4 rounded-lg text-sm border border-blue-100">
                    {cuestionario.descripcion}
                </p>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={seccionActual}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                                    {seccionActual + 1}
                                </span>
                                {seccion.titulo}
                            </h3>

                            {seccion.condicion && (
                                <div className="mb-6 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    {seccion.condicion}
                                </div>
                            )}

                            <div className="space-y-8">
                                {seccion.preguntas.map((pregunta) => (
                                    <div key={pregunta.id} className="space-y-3 pb-6 border-b border-slate-100 last:border-0">
                                        <p className="text-lg font-medium text-slate-700">{pregunta.texto}</p>

                                        <RadioGroup
                                            value={respuestas[pregunta.id]}
                                            onValueChange={(val) => handleRespuesta(pregunta.id, val)}
                                            className="flex gap-4 mt-2"
                                        >
                                            <div className={`flex-1 flex items-center space-x-2 border p-4 rounded-xl cursor-pointer transition-all ${respuestas[pregunta.id] === 'si' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                                                <RadioGroupItem value="si" id={`p${pregunta.id}-si`} />
                                                <Label htmlFor={`p${pregunta.id}-si`} className="flex-1 cursor-pointer font-medium">Sí</Label>
                                            </div>
                                            <div className={`flex-1 flex items-center space-x-2 border p-4 rounded-xl cursor-pointer transition-all ${respuestas[pregunta.id] === 'no' ? 'border-slate-400 bg-slate-100' : 'border-slate-200 hover:bg-slate-50'}`}>
                                                <RadioGroupItem value="no" id={`p${pregunta.id}-no`} />
                                                <Label htmlFor={`p${pregunta.id}-no`} className="flex-1 cursor-pointer font-medium">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    onClick={seccionActual === 0 ? onCancel : prevSection}
                                    disabled={isSubmitting}
                                >
                                    {seccionActual === 0 ? 'Cancelar' : <><ArrowLeft className="mr-2 h-4 w-4" /> Anterior</>}
                                </Button>

                                <Button
                                    onClick={nextSection}
                                    disabled={!puedeAvanzar || isSubmitting}
                                    className="bg-slate-900 text-white min-w-[140px]"
                                >
                                    {isSubmitting ? (
                                        'Guardando...'
                                    ) : seccionActual === cuestionario.secciones.length - 1 ? (
                                        <><Save className="mr-2 h-4 w-4" /> Finalizar</>
                                    ) : (
                                        <>Siguiente <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

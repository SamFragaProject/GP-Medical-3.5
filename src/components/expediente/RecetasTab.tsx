/**
 * RecetasTab — Prescripciones médicas con historial y detalle de medicamentos
 */
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Pill, CheckCircle, Clock, ChevronDown, ChevronUp,
    Calendar, User, AlertTriangle, Download, Printer,
    FileText, ArrowRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'

const ESTADO_STYLES: Record<string, { bg: string; text: string; border: string; label: string; icon: any }> = {
    vigente: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Vigente', icon: CheckCircle },
    completada: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Completada', icon: Clock },
    cancelada: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Cancelada', icon: AlertTriangle },
}

interface RecetasTabProps {
    pacienteId?: string
}

export default function RecetasTab({ pacienteId }: RecetasTabProps) {
    const [recetas, setRecetas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    React.useEffect(() => {
        if (!pacienteId) return
        async function fetchRecetas() {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('examenes_recetas') // Verificar nombre de tabla
                    .select('*')
                    .eq('paciente_id', pacienteId)
                    .order('fecha', { ascending: false })

                if (data && data.length > 0) {
                    setRecetas(data)
                    setExpandedId(data[0].id)
                } else if (pacienteId?.startsWith('demo')) {
                    const demoData = getExpedienteDemoCompleto()
                    setRecetas(demoData.recetas)
                    if (demoData.recetas.length > 0) setExpandedId(demoData.recetas[0].id)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchRecetas()
    }, [pacienteId])

    const vigentes = recetas.filter(r => r.estado === 'vigente').length

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
                <Clock className="w-10 h-10 animate-spin text-teal-500 mb-4" />
                <p className="text-sm font-semibold text-slate-500">Cargando recetas...</p>
            </div>
        )
    }

    if (recetas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Pill className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Sin recetas emitidas</h3>
                <p className="text-sm text-slate-400 max-w-sm text-center mt-2">
                    No hay recetas registradas. Es probable que no apliquen o no se requiera tratamiento por el tipo de puesto del trabajador.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center shadow-lg shadow-teal-200">
                            <Pill className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Recetas Médicas</h3>
                            <p className="text-xs text-slate-400 font-medium">{recetas.length} receta{recetas.length !== 1 ? 's' : ''} en historial</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className={`px-4 py-2 rounded-xl border text-center ${vigentes > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vigentes</p>
                            <p className={`text-sm font-bold ${vigentes > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>{vigentes}</p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
                            <p className="text-sm font-bold text-slate-700">{recetas.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recetas list */}
            <div className="space-y-4">
                {recetas.map((receta, index) => {
                    const isExpanded = expandedId === receta.id
                    const estado = ESTADO_STYLES[receta.estado] || ESTADO_STYLES.completada
                    const EstadoIcon = estado.icon
                    const isVigente = receta.estado === 'vigente'

                    return (
                        <Card key={receta.id} className={`border-slate-100 shadow-sm overflow-hidden ${isVigente ? 'ring-2 ring-emerald-200' : ''}`}>
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : receta.id)}
                                className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${estado.bg} border ${estado.border}`}>
                                        <Pill className={`w-5 h-5 ${estado.text}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-sm font-bold text-slate-800">{receta.diagnostico}</h4>
                                            <Badge className={`${estado.bg} ${estado.text} border-0 text-[9px] font-black px-2 py-0.5`}>
                                                <EstadoIcon className="w-3 h-3 mr-0.5" />
                                                {estado.label}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(receta.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {receta.medico}
                                            </span>
                                            <span className="text-slate-300">|</span>
                                            <span>{receta.medicamentos?.length || 0} medicamento{receta.medicamentos?.length !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-4">
                                            {/* Medications */}
                                            {receta.medicamentos && (
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Medicamentos prescritos</p>
                                                    {receta.medicamentos.map((med: any, i: number) => (
                                                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center">
                                                                    <Pill className="w-3 h-3 text-teal-600" />
                                                                </div>
                                                                <h5 className="text-sm font-black text-slate-800">{med.nombre}</h5>
                                                                <Badge className="bg-teal-100 text-teal-700 border-0 text-[9px] font-bold">{med.dosis}</Badge>
                                                            </div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                                                <div>
                                                                    <p className="text-[10px] text-slate-400 font-bold">Vía</p>
                                                                    <p className="text-slate-700 font-medium">{med.via}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-slate-400 font-bold">Frecuencia</p>
                                                                    <p className="text-slate-700 font-medium">{med.frecuencia}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-slate-400 font-bold">Duración</p>
                                                                    <p className="text-slate-700 font-medium">{med.duracion}</p>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <p className="text-[10px] text-slate-400 font-bold">Indicaciones</p>
                                                                    <p className="text-slate-700 font-medium">{med.indicaciones}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* General instructions */}
                                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Indicaciones generales</p>
                                                <p className="text-sm text-blue-700 font-medium">{receta.indicaciones_generales}</p>
                                            </div>

                                            {/* Meta */}
                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <span>Cédula: <b className="text-slate-600 font-mono">{receta.cedula}</b></span>
                                                <span>Vigencia: <b className="text-slate-600">{receta.vigencia && new Date(receta.vigencia).toLocaleDateString('es-MX')}</b></span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

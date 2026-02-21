/**
 * IncapacidadesTab — Certificados de incapacidad con historial
 */
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileBarChart, CheckCircle, Clock, ChevronDown, ChevronUp,
    Calendar, User, AlertTriangle, Shield, ArrowRight, Download, Printer
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'

const TIPO_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    'Enfermedad General': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    'Riesgo de Trabajo': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    'Maternidad': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', dot: 'bg-pink-500' },
}

function generateIncapacidadPDF(incap: any) {
    // Generate a simple text-based PDF export
    const content = `
═══════════════════════════════════════════════
CERTIFICADO DE INCAPACIDAD
GPMedical ERP — Sistema de Expediente Electrónico
═══════════════════════════════════════════════

Folio: ${incap.folio}
Tipo: ${incap.tipo}

PERÍODO DE INCAPACIDAD
─────────────────────────
Fecha inicio: ${new Date(incap.fecha_inicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
Fecha fin: ${new Date(incap.fecha_fin).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
Días totales: ${incap.dias}

INFORMACIÓN CLÍNICA
─────────────────────────
Diagnóstico: ${incap.diagnostico}
Descripción: ${incap.descripcion}

Médico: ${incap.medico}
Cédula: ${incap.cedula}
Estatus IMSS: ${incap.estatus_imss}

Observaciones: ${incap.observaciones}

═══════════════════════════════════════════════
Generado el ${new Date().toLocaleString('es-MX')}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `incapacidad_${incap.folio}_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Certificado ${incap.folio} exportado`)
}

interface IncapacidadesTabProps {
    pacienteId?: string
}

export default function IncapacidadesTab({ pacienteId }: IncapacidadesTabProps) {
    const [incapacidades, setIncapacidades] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    React.useEffect(() => {
        if (!pacienteId) return
        async function fetchIncapacidades() {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('examenes_incapacidades') // Verificar nombre de tabla
                    .select('*')
                    .eq('paciente_id', pacienteId)
                    .order('fecha_inicio', { ascending: false })

                if (data && data.length > 0) {
                    setIncapacidades(data)
                } else if (pacienteId?.startsWith('demo')) {
                    const demoData = getExpedienteDemoCompleto()
                    setIncapacidades(demoData.incapacidades)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchIncapacidades()
    }, [pacienteId])

    const totalDias = incapacidades.reduce((sum, i) => sum + i.dias, 0)
    const riesgoTrabajo = incapacidades.filter(i => i.tipo === 'Riesgo de Trabajo').length

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
                <Clock className="w-10 h-10 animate-spin text-rose-500 mb-4" />
                <p className="text-sm font-semibold text-slate-500">Cargando incapacidades...</p>
            </div>
        )
    }

    if (incapacidades.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FileBarChart className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Sin incapacidades registradas</h3>
                <p className="text-sm text-slate-400 max-w-xs text-center mt-2">
                    Este trabajador no cuenta con registros de incapacidad en el sistema.
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
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-200">
                            <FileBarChart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Incapacidades</h3>
                            <p className="text-xs text-slate-400 font-medium">{incapacidades.length} certificado{incapacidades.length !== 1 ? 's' : ''} en historial</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total días</p>
                            <p className="text-sm font-bold text-slate-700">{totalDias}</p>
                        </div>
                        {riesgoTrabajo > 0 && (
                            <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Riesgo Trabajo</p>
                                <p className="text-sm font-bold text-amber-700">{riesgoTrabajo}</p>
                            </div>
                        )}
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Certificados</p>
                            <p className="text-sm font-bold text-slate-700">{incapacidades.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Incapacidades list */}
            <div className="space-y-4">
                {incapacidades.map((incap) => {
                    const isExpanded = expandedId === incap.id
                    const tipoStyle = TIPO_STYLES[incap.tipo] || TIPO_STYLES['Enfermedad General']

                    return (
                        <Card key={incap.id} className="border-slate-100 shadow-sm overflow-hidden">
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : incap.id)}
                                className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tipoStyle.bg} border ${tipoStyle.border}`}>
                                        <FileBarChart className={`w-5 h-5 ${tipoStyle.text}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-sm font-bold text-slate-800">{incap.diagnostico}</h4>
                                            <Badge className={`${tipoStyle.bg} ${tipoStyle.text} border-0 text-[9px] font-black px-2 py-0.5`}>
                                                {incap.tipo}
                                            </Badge>
                                            <Badge className="bg-slate-100 text-slate-600 border-0 text-[9px] font-black px-2 py-0.5">
                                                {incap.dias} día{incap.dias !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(incap.fecha_inicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                {' — '}
                                                {new Date(incap.fecha_fin).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="text-slate-300">|</span>
                                            <span className="font-mono">{incap.folio}</span>
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
                                            {/* Description */}
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Descripción</p>
                                                <p className="text-sm text-slate-700 font-medium">{incap.descripcion}</p>
                                            </div>

                                            {/* Details grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Médico</p>
                                                    <p className="text-xs text-slate-700 font-medium mt-0.5">{incap.medico}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cédula</p>
                                                    <p className="text-xs text-slate-700 font-mono font-medium mt-0.5">{incap.cedula}</p>
                                                </div>
                                                <div className={`p-3 rounded-xl border ${incap.estatus_imss === 'Aceptada' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IMSS</p>
                                                    <p className={`text-xs font-bold mt-0.5 ${incap.estatus_imss === 'Aceptada' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                        {incap.estatus_imss}
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Folio</p>
                                                    <p className="text-xs text-slate-700 font-mono font-medium mt-0.5">{incap.folio}</p>
                                                </div>
                                            </div>

                                            {/* Observations */}
                                            {incap.observaciones && (
                                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Observaciones</p>
                                                    <p className="text-sm text-blue-700 font-medium">{incap.observaciones}</p>
                                                </div>
                                            )}

                                            {/* Export button */}
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => generateIncapacidadPDF(incap)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> Exportar Certificado
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    )
                })}
            </div>

            {/* Summary footer */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Shield className="w-4 h-4 text-slate-400" />
                <p className="text-[11px] text-slate-500 font-medium">
                    Resumen: {totalDias} días de incapacidad en {incapacidades.length} certificado{incapacidades.length !== 1 ? 's' : ''}
                    ({riesgoTrabajo} por riesgo de trabajo, {incapacidades.length - riesgoTrabajo} por enfermedad general).
                </p>
            </div>
        </div>
    )
}

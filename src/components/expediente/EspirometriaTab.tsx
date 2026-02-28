/**
 * EspirometriaTab — Resultados de espirometría con curva, predichos y comparación
 */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Wind, CheckCircle, AlertTriangle, ChevronDown, ChevronUp,
    ArrowRight, Shield, Clock, BarChart3, Activity, TrendingUp, TrendingDown
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { Loader2, Inbox } from 'lucide-react'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import EstudioUploadReview from '@/components/expediente/EstudioUploadReview'

const CLASIF_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
    normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Normal' },
    restriccion_leve: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Restricción Leve' },
    restriccion_moderada: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Restricción Moderada' },
    obstruccion_leve: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Obstrucción Leve' },
    obstruccion_moderada: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Obstrucción Moderada' },
    obstruccion_severa: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Obstrucción Severa' },
}

function GaugeBar({ label, value, predicted, percentage, unit }: {
    label: string; value: number; predicted: number; percentage: number; unit: string
}) {
    const color = percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
    const colorText = percentage >= 80 ? 'text-emerald-700' : percentage >= 60 ? 'text-amber-700' : 'text-red-700'
    const colorBg = percentage >= 80 ? 'bg-emerald-50' : percentage >= 60 ? 'bg-amber-50' : 'bg-red-50'

    return (
        <div className={`p-4 rounded-xl ${colorBg} border ${percentage >= 80 ? 'border-emerald-200' : percentage >= 60 ? 'border-amber-200' : 'border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
                <span className={`text-lg font-black tabular-nums ${colorText}`}>{percentage}%</span>
            </div>
            <div className="w-full h-3 bg-white rounded-full overflow-hidden mb-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>Medido: <b className="text-slate-700">{value} {unit}</b></span>
                <span>Predicho: <b className="text-slate-700">{predicted} {unit}</b></span>
            </div>
        </div>
    )
}

function SpiroCurve({ fvc, fev1, pef }: { fvc: number; fev1: number; pef: number }) {
    // Simplified flow-volume curve representation
    const W = 300
    const H = 160
    const PAD = 30

    const maxFlow = pef * 1.1
    const maxVol = fvc * 1.1

    const xScale = (v: number) => PAD + (v / maxVol) * (W - 2 * PAD)
    const yScale = (f: number) => H - PAD - (f / maxFlow) * (H - 2 * PAD)

    // Simplified curve points
    const points = [
        [0, 0],
        [fvc * 0.05, pef * 0.6],
        [fvc * 0.1, pef],
        [fvc * 0.2, pef * 0.9],
        [fvc * 0.35, pef * 0.65],
        [fvc * 0.5, pef * 0.45],
        [fvc * 0.65, pef * 0.3],
        [fvc * 0.8, pef * 0.15],
        [fvc * 0.95, pef * 0.05],
        [fvc, 0],
    ]

    const pathD = points.map((p, i) =>
        `${i === 0 ? 'M' : 'L'}${xScale(p[0]).toFixed(1)},${yScale(p[1]).toFixed(1)}`
    ).join(' ')

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">
                Curva Flujo-Volumen (Simplificada)
            </p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                {/* Grid */}
                {[0, 2, 4, 6, 8, 10].map(v => {
                    const x = xScale(v)
                    if (x > W - PAD) return null
                    return (
                        <g key={`v-${v}`}>
                            <line x1={x} y1={PAD} x2={x} y2={H - PAD} stroke="#e2e8f0" strokeWidth="0.5" />
                            <text x={x} y={H - PAD + 12} textAnchor="middle" className="fill-slate-400" fontSize="7" fontWeight="700">{v}</text>
                        </g>
                    )
                })}
                {[0, 2, 4, 6, 8, 10].map(f => {
                    const y = yScale(f)
                    if (y < PAD) return null
                    return (
                        <g key={`f-${f}`}>
                            <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
                            <text x={PAD - 5} y={y + 3} textAnchor="end" className="fill-slate-400" fontSize="7" fontWeight="700">{f}</text>
                        </g>
                    )
                })}

                {/* Curve */}
                <path d={pathD} fill="none" stroke="url(#spiroGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                    <linearGradient id="spiroGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>

                {/* Labels */}
                <text x={W / 2} y={H - 2} textAnchor="middle" className="fill-slate-400" fontSize="7" fontWeight="800">VOLUMEN (L)</text>
                <text x={8} y={H / 2} textAnchor="middle" className="fill-slate-400" fontSize="7" fontWeight="800"
                    transform={`rotate(-90, 8, ${H / 2})`}>FLUJO (L/s)</text>

                {/* PEF marker */}
                <circle cx={xScale(fvc * 0.1)} cy={yScale(pef)} r="4" fill="#8b5cf6" stroke="white" strokeWidth="1.5" />
                <text x={xScale(fvc * 0.1) + 8} y={yScale(pef) + 3} className="fill-violet-600" fontSize="7" fontWeight="800">PEF</text>
            </svg>
        </div>
    )
}

/** Transform flat DB or JSONB espirometry data to component format */
function transformSpiroData(d: any): any {
    const recomendaciones = d.recomendaciones
        ? (typeof d.recomendaciones === 'string' ? d.recomendaciones.split('. ').filter(Boolean) : d.recomendaciones)
        : ['Control espirométrico anual']

    // Determine clasificacion from fev1_fvc ratio
    let clasificacion = d.clasificacion || d.patron || 'normal'
    if (clasificacion === 'Normal' || clasificacion === 'normal') clasificacion = 'normal'
    else if (clasificacion.toLowerCase().includes('obstruc')) {
        if (d.fev1_porcentaje >= 60) clasificacion = 'obstruccion_leve'
        else if (d.fev1_porcentaje >= 40) clasificacion = 'obstruccion_moderada'
        else clasificacion = 'obstruccion_severa'
    }

    return {
        ...d,
        fecha: d.fecha_estudio || d.fecha || new Date().toISOString(),
        fvc: d.fvc || d.fvc_litros || 0,
        fev1: d.fev1 || d.fev1_litros || 0,
        fvc_predicho: d.fvc_predicho || 0,
        fev1_predicho: d.fev1_predicho || 0,
        fvc_porcentaje: d.fvc_porcentaje || 0,
        fev1_porcentaje: d.fev1_porcentaje || 0,
        fev1_fvc: d.fev1_fvc || (d.fev1 && d.fvc ? Math.round((d.fev1 / d.fvc) * 100 * 10) / 10 : 0),
        pef: d.pef || 0,
        clasificacion,
        calidad_prueba: d.calidad_prueba || d.calidad || 'A',
        tecnico: d.medico_responsable || d.tecnico || 'Médico ocupacional',
        equipo: d.equipo || 'Espirómetro clínico',
        interpretacion: d.interpretacion || d.diagnostico || 'Evaluación espirométrica',
        recomendaciones,
        edad: d.edad || 50,
        sexo: d.sexo || 'masculino',
        talla_cm: d.talla_cm || 175,
        peso_kg: d.peso_kg || 80,
    }
}

export default function EspirometriaTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = React.useState(true)
    const [data, setData] = React.useState<any>(null)
    const [prev, setPrev] = React.useState<any>(null)
    const [showPrev, setShowPrev] = React.useState(false)

    React.useEffect(() => {
        if (pacienteId) loadData()
    }, [pacienteId])

    const loadData = async () => {
        try {
            setLoading(true)

            // FUENTE 1: Nuevas tablas unificadas
            const { data: estudios } = await supabase
                .from('estudios_clinicos')
                .select('*')
                .eq('paciente_id', pacienteId)
                .eq('tipo_estudio', 'espirometria')
                .order('fecha_estudio', { ascending: false })
                .limit(2)

            if (estudios && estudios.length > 0) {
                for (let idx = 0; idx < estudios.length; idx++) {
                    const { data: resultados } = await supabase
                        .from('resultados_estudio')
                        .select('*')
                        .eq('estudio_id', estudios[idx].id)
                    if (resultados && resultados.length > 0) {
                        const flat: Record<string, any> = {
                            fecha_estudio: estudios[idx].fecha_estudio,
                            diagnostico: estudios[idx].diagnostico,
                            interpretacion: estudios[idx].interpretacion,
                            calidad: estudios[idx].calidad,
                            medico_responsable: estudios[idx].medico_responsable,
                            equipo: estudios[idx].equipo,
                        }
                        resultados.forEach(r => { flat[r.parametro_nombre] = r.resultado_numerico ?? r.resultado })
                        const transformed = transformSpiroData(flat)
                        if (idx === 0) setData(transformed)
                        else setPrev(transformed)
                    }
                }
                return
            }

            // FUENTE 2: espirometrias (tabla legacy)
            const { data: legacyRecords } = await supabase
                .from('espirometrias')
                .select('*')
                .eq('paciente_id', pacienteId)
                .order('created_at', { ascending: false })
                .limit(2)

            if (legacyRecords && legacyRecords.length > 0) {
                setData(transformSpiroData(legacyRecords[0]))
                if (legacyRecords.length > 1) setPrev(transformSpiroData(legacyRecords[1]))
                return
            }

            // FUENTE 3: pacientes.espirometria JSONB
            const { data: pac } = await supabase
                .from('pacientes')
                .select('espirometria, peso_kg, talla_cm, genero, fecha_nacimiento')
                .eq('id', pacienteId)
                .single()

            if (pac?.espirometria && typeof pac.espirometria === 'object') {
                const sp = pac.espirometria as Record<string, any>
                const age = pac.fecha_nacimiento ? Math.floor((Date.now() - new Date(pac.fecha_nacimiento).getTime()) / 31557600000) : 50
                setData(transformSpiroData({ ...sp, edad: age, sexo: pac.genero || 'masculino', talla_cm: pac.talla_cm || 175, peso_kg: pac.peso_kg || 80 }))
                return
            }

            // Demo fallback
            if (pacienteId?.startsWith('demo')) {
                const demoData = getExpedienteDemoCompleto()
                setData(demoData.espirometria)
                setPrev(demoData.espirometriaPrevia)
            }
        } catch (err) {
            console.error('Error loading spirometry:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                <p className="text-slate-500 text-xs font-medium">Cargando estudios respiratorios...</p>
            </div>
        )
    }

    if (!data) {
        return (
            <Card className="border-0 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-bold">Sin registros de espirometría</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 mb-4">
                    Este paciente aún no cuenta con estudios de espirometría realizados.
                </p>
                <div className="max-w-lg mx-auto">
                    <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="espirometria" onSaved={() => loadData()} />
                </div>
            </Card>
        )
    }

    const clasifStyle = CLASIF_STYLES[data.clasificacion] || CLASIF_STYLES.normal

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-200">
                            <Wind className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Espirometría</h3>
                            <p className="text-xs text-slate-400 font-medium">{data.tecnico} — {data.equipo}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="espirometria" onSaved={() => loadData()} />
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</p>
                            <p className="text-sm font-bold text-slate-700">
                                {new Date(data.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calidad</p>
                            <p className="text-sm font-bold text-slate-700">Grado {data.calidad_prueba}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl ${clasifStyle.bg} border ${clasifStyle.border} text-center`}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resultado</p>
                            <p className={`text-sm font-bold ${clasifStyle.text}`}>{clasifStyle.label}</p>
                        </div>
                    </div>
                </div>

                {/* Interpretation banner */}
                <div className={`flex items-center gap-3 p-4 rounded-xl ${clasifStyle.bg} border ${clasifStyle.border}`}>
                    <CheckCircle className={`w-5 h-5 ${clasifStyle.text} flex-shrink-0`} />
                    <p className={`text-sm font-medium ${clasifStyle.text}`}>{data.interpretacion}</p>
                </div>
            </div>

            {/* Curve + Gauges */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                    <SpiroCurve fvc={data.fvc} fev1={data.fev1} pef={data.pef} />
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <GaugeBar label="FVC" value={data.fvc} predicted={data.fvc_predicho} percentage={data.fvc_porcentaje} unit="L" />
                    <GaugeBar label="FEV1" value={data.fev1} predicted={data.fev1_predicho} percentage={data.fev1_porcentaje} unit="L" />
                    <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">FEV1/FVC</span>
                            <span className={`text-lg font-black tabular-nums ${data.fev1_fvc >= 70 ? 'text-emerald-700' : 'text-red-700'}`}>
                                {data.fev1_fvc}%
                            </span>
                        </div>
                        <p className="text-[10px] text-violet-600 font-medium">
                            {data.fev1_fvc >= 70 ? 'Relación normal — sin patrón obstructivo' : 'Relación disminuida — posible obstrucción'}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">PEF</span>
                            <span className="text-lg font-black tabular-nums text-blue-700">{data.pef} L/s</span>
                        </div>
                        <p className="text-[10px] text-blue-600 font-medium">
                            Flujo espiratorio máximo (Peak Expiratory Flow)
                        </p>
                    </div>
                </div>
            </div>

            {/* Patient data summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Edad', value: `${data.edad} años` },
                    { label: 'Sexo', value: data.sexo === 'masculino' ? 'Masculino' : 'Femenino' },
                    { label: 'Talla', value: `${data.talla_cm} cm` },
                    { label: 'Peso', value: `${data.peso_kg} kg` },
                ].map((item, i) => (
                    <div key={i} className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                        <p className="text-sm font-bold text-slate-700">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Recommendations */}
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Recomendaciones</h4>
                    </div>
                    <ul className="space-y-2.5">
                        {data.recomendaciones && data.recomendaciones.map((rec: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                                <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Previous comparison */}
            {prev && (
                <button
                    onClick={() => setShowPrev(!showPrev)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">
                            Comparar con estudio previo ({new Date(prev.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })})
                        </span>
                    </div>
                    {showPrev ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
            )}
            {showPrev && prev && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">FVC</p>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-sm">{prev.fvc}L ({prev.fvc_porcentaje}%)</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-800 font-bold text-sm">{data.fvc}L ({data.fvc_porcentaje}%)</span>
                                {data.fvc > prev.fvc
                                    ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                    : <TrendingDown className="w-3.5 h-3.5 text-amber-500" />}
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">FEV1</p>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-sm">{prev.fev1}L ({prev.fev1_porcentaje}%)</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-800 font-bold text-sm">{data.fev1}L ({data.fev1_porcentaje}%)</span>
                                {data.fev1 > prev.fev1
                                    ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                    : <TrendingDown className="w-3.5 h-3.5 text-amber-500" />}
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">FEV1/FVC</p>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-sm">{prev.fev1_fvc}%</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-800 font-bold text-sm">{data.fev1_fvc}%</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Documentos adjuntos de espirometría */}
            <DocumentosAdjuntos
                pacienteId={pacienteId}
                categoria="espirometria"
                titulo="Documentos de Espirometría"
            />
        </div>
    )
}

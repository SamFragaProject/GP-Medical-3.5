/**
 * AudiometriaTab — Audiograma visual + semáforo NOM-011
 */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Ear, AlertTriangle, CheckCircle, Clock, Shield, RefreshCw,
    ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { Loader2, Inbox } from 'lucide-react'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import EstudioUploadReview from '@/components/expediente/EstudioUploadReview'

const FREQUENCIES = ['250', '500', '1000', '2000', '3000', '4000', '6000', '8000']
const FREQ_LABELS = ['250', '500', '1K', '2K', '3K', '4K', '6K', '8K']

const SEMAFORO_STYLES = {
    verde: { bg: 'bg-emerald-500', ring: 'ring-emerald-200', text: 'text-emerald-700', label: 'Normal', bgLight: 'bg-emerald-50', border: 'border-emerald-200' },
    amarillo: { bg: 'bg-amber-500', ring: 'ring-amber-200', text: 'text-amber-700', label: 'Vigilancia', bgLight: 'bg-amber-50', border: 'border-amber-200' },
    rojo: { bg: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700', label: 'Riesgo', bgLight: 'bg-red-50', border: 'border-red-200' },
}

// SVG audiogram chart
function AudiogramChart({ od, oi, title }: {
    od: Record<string, number>;
    oi: Record<string, number>;
    title: string
}) {
    const W = 380
    const H = 220
    const PAD_L = 40
    const PAD_R = 15
    const PAD_T = 25
    const PAD_B = 30
    const chartW = W - PAD_L - PAD_R
    const chartH = H - PAD_T - PAD_B

    const dbMin = -10
    const dbMax = 110
    const dbRange = dbMax - dbMin

    const xForFreq = (i: number) => PAD_L + (i / (FREQUENCIES.length - 1)) * chartW
    const yForDb = (db: number) => PAD_T + ((db - dbMin) / dbRange) * chartH

    // Zone backgrounds (NOM-011)
    const zones = [
        { from: -10, to: 25, color: 'rgba(16,185,129,0.08)', label: 'Normal' },
        { from: 25, to: 40, color: 'rgba(251,191,36,0.08)', label: 'Leve' },
        { from: 40, to: 55, color: 'rgba(249,115,22,0.08)', label: 'Moderada' },
        { from: 55, to: 110, color: 'rgba(239,68,68,0.08)', label: 'Severa' },
    ]

    const odPoints = FREQUENCIES.map((f, i) => `${xForFreq(i)},${yForDb(od[f] ?? 0)}`)
    const oiPoints = FREQUENCIES.map((f, i) => `${xForFreq(i)},${yForDb(oi[f] ?? 0)}`)

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">{title}</p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                {/* Zone backgrounds */}
                {zones.map((z, i) => (
                    <rect key={i} x={PAD_L} y={yForDb(z.from)} width={chartW} height={yForDb(z.to) - yForDb(z.from)}
                        fill={z.color} />
                ))}

                {/* Grid lines */}
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(db => (
                    <g key={db}>
                        <line x1={PAD_L} y1={yForDb(db)} x2={W - PAD_R} y2={yForDb(db)}
                            stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray={db % 20 === 0 ? 'none' : '2,3'} />
                        {db % 20 === 0 && (
                            <text x={PAD_L - 5} y={yForDb(db) + 3} textAnchor="end"
                                className="fill-slate-400" fontSize="8" fontWeight="700">{db}</text>
                        )}
                    </g>
                ))}
                {FREQUENCIES.map((f, i) => (
                    <g key={f}>
                        <line x1={xForFreq(i)} y1={PAD_T} x2={xForFreq(i)} y2={H - PAD_B}
                            stroke="#e2e8f0" strokeWidth="0.5" />
                        <text x={xForFreq(i)} y={H - PAD_B + 14} textAnchor="middle"
                            className="fill-slate-500" fontSize="8" fontWeight="800">{FREQ_LABELS[i]}</text>
                    </g>
                ))}

                {/* OD Line (Red — right ear) */}
                <polyline points={odPoints.join(' ')} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" />
                {FREQUENCIES.map((f, i) => (
                    <circle key={`od-${f}`} cx={xForFreq(i)} cy={yForDb(od[f] ?? 0)} r="4"
                        fill="#ef4444" stroke="white" strokeWidth="1.5" />
                ))}

                {/* OI Line (Blue — left ear) */}
                <polyline points={oiPoints.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeDasharray="6,3" />
                {FREQUENCIES.map((f, i) => (
                    <g key={`oi-${f}`}>
                        <line x1={xForFreq(i) - 4} y1={yForDb(oi[f] ?? 0) - 4} x2={xForFreq(i) + 4} y2={yForDb(oi[f] ?? 0) + 4}
                            stroke="#3b82f6" strokeWidth="2" />
                        <line x1={xForFreq(i) + 4} y1={yForDb(oi[f] ?? 0) - 4} x2={xForFreq(i) - 4} y2={yForDb(oi[f] ?? 0) + 4}
                            stroke="#3b82f6" strokeWidth="2" />
                    </g>
                ))}

                {/* Axis labels */}
                <text x={W / 2} y={H - 2} textAnchor="middle" className="fill-slate-400" fontSize="7" fontWeight="800">
                    FRECUENCIA (Hz)
                </text>
                <text x={8} y={H / 2} textAnchor="middle" className="fill-slate-400" fontSize="7" fontWeight="800"
                    transform={`rotate(-90, 8, ${H / 2})`}>dB HL</text>

                {/* Legend */}
                <circle cx={PAD_L + 5} cy={PAD_T - 10} r="3" fill="#ef4444" />
                <text x={PAD_L + 12} y={PAD_T - 7} className="fill-slate-600" fontSize="7" fontWeight="700">OD (Der.)</text>
                <line x1={PAD_L + 65} y1={PAD_T - 13} x2={PAD_L + 73} y2={PAD_T - 7} stroke="#3b82f6" strokeWidth="2" />
                <line x1={PAD_L + 73} y1={PAD_T - 13} x2={PAD_L + 65} y2={PAD_T - 7} stroke="#3b82f6" strokeWidth="2" />
                <text x={PAD_L + 80} y={PAD_T - 7} className="fill-slate-600" fontSize="7" fontWeight="700">OI (Izq.)</text>
            </svg>
        </div>
    )
}

function SemaforoIndicator({ label, semaforo, ptaDb }: { label: string; semaforo: string; ptaDb: number }) {
    const style = SEMAFORO_STYLES[semaforo as keyof typeof SEMAFORO_STYLES] || SEMAFORO_STYLES.verde
    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${style.bgLight} border ${style.border}`}>
            <div className={`w-5 h-5 rounded-full ${style.bg} ring-4 ${style.ring} flex-shrink-0`} />
            <div className="flex-1">
                <p className="text-xs font-black text-slate-800">{label}</p>
                <p className={`text-[10px] font-bold ${style.text}`}>PTA: {ptaDb} dB — {style.label}</p>
            </div>
        </div>
    )
}

/** Transform flat audiometry data to component format */
function transformAudioData(d: any): any {
    // If already in component format (has oido_derecho object), return as-is
    if (d.oido_derecho && typeof d.oido_derecho === 'object') return d

    const od: Record<string, number> = {}
    const oi: Record<string, number> = {}
    for (const f of FREQUENCIES) {
        od[f] = d[`od_${f}`] ?? d[`oido_derecho_${f}`] ?? 0
        oi[f] = d[`oi_${f}`] ?? d[`oido_izquierdo_${f}`] ?? 0
    }

    // PTA (500, 1000, 2000, 4000 Hz)
    const ptaOd = Math.round(((od['500'] || 0) + (od['1000'] || 0) + (od['2000'] || 0) + (od['4000'] || 0)) / 4)
    const ptaOi = Math.round(((oi['500'] || 0) + (oi['1000'] || 0) + (oi['2000'] || 0) + (oi['4000'] || 0)) / 4)

    const getSemaforo = (pta: number) => pta <= 25 ? 'verde' : pta <= 40 ? 'amarillo' : 'rojo'

    const recomendaciones = d.recomendaciones
        ? (typeof d.recomendaciones === 'string' ? d.recomendaciones.split('. ').filter(Boolean) : d.recomendaciones)
        : ['Control audiométrico anual']

    return {
        ...d,
        fecha: d.fecha_estudio || d.fecha || new Date().toISOString(),
        oido_derecho: od,
        oido_izquierdo: oi,
        promedio_tonal_od: ptaOd,
        promedio_tonal_oi: ptaOi,
        semaforo_od: getSemaforo(ptaOd),
        semaforo_oi: getSemaforo(ptaOi),
        semaforo_general: getSemaforo(Math.max(ptaOd, ptaOi)),
        diagnostico: d.diagnostico || (ptaOd <= 25 && ptaOi <= 25 ? 'Audición normal bilateral' : 'Hipoacusia detectada'),
        interpretacion_nom011: d.interpretacion || 'Evaluación según NOM-011-STPS-2001',
        tecnico: d.medico_responsable || d.tecnico || 'Médico ocupacional',
        equipo: d.equipo || 'Audiómetro clínico',
        recomendaciones,
        requiere_reevaluacion: ptaOd > 25 || ptaOi > 25,
        tiempo_reevaluacion_meses: ptaOd > 25 || ptaOi > 25 ? 6 : 12,
    }
}

export default function AudiometriaTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = React.useState(true)
    const [audio, setAudio] = React.useState<any>(null)
    const [prev, setPrev] = React.useState<any>(null)
    const [showPrev, setShowPrev] = useState(false)

    React.useEffect(() => {
        if (pacienteId) loadData()
    }, [pacienteId])

    const loadData = async () => {
        try {
            setLoading(true)

            // FUENTE 1: Nuevas tablas unificadas (estudios_clinicos + resultados_estudio)
            const { data: estudios } = await supabase
                .from('estudios_clinicos')
                .select('*')
                .eq('paciente_id', pacienteId)
                .eq('tipo_estudio', 'audiometria')
                .order('fecha_estudio', { ascending: false })
                .limit(2)

            if (estudios && estudios.length > 0) {
                for (let idx = 0; idx < estudios.length; idx++) {
                    const { data: resultados } = await supabase
                        .from('resultados_estudio')
                        .select('*')
                        .eq('estudio_id', estudios[idx].id)
                    if (resultados && resultados.length > 0) {
                        // Convert resultados to flat object for transformAudioData
                        const flat: Record<string, any> = {
                            fecha_estudio: estudios[idx].fecha_estudio,
                            diagnostico: estudios[idx].diagnostico,
                            interpretacion: estudios[idx].interpretacion,
                            medico_responsable: estudios[idx].medico_responsable,
                            equipo: estudios[idx].equipo,
                        }
                        resultados.forEach(r => {
                            flat[r.parametro_nombre] = r.resultado_numerico ?? r.resultado
                        })
                        const transformed = transformAudioData(flat)
                        if (idx === 0) setAudio(transformed)
                        else setPrev(transformed)
                    }
                }
                if (estudios.length > 0) return
            }

            // FUENTE 2: audiometrias (tabla legacy)
            const { data: legacyData } = await supabase
                .from('audiometrias')
                .select('*')
                .eq('paciente_id', pacienteId)
                .order('created_at', { ascending: false })
                .limit(2)

            if (legacyData && legacyData.length > 0) {
                const transformed = legacyData.map(transformAudioData)
                setAudio(transformed[0])
                if (transformed.length > 1) setPrev(transformed[1])
                return
            }

            // FUENTE 3: pacientes.audiometria JSONB
            const { data: pac } = await supabase
                .from('pacientes')
                .select('audiometria')
                .eq('id', pacienteId)
                .single()

            if (pac?.audiometria && typeof pac.audiometria === 'object') {
                const a = pac.audiometria as Record<string, any>
                setAudio(transformAudioData(a))
                return
            }

            // Demo fallback
            if (pacienteId?.startsWith('demo')) {
                const demoData = getExpedienteDemoCompleto()
                setAudio(demoData.audiometria)
                setPrev(demoData.audiometriaPrevio)
            }
        } catch (err) {
            console.error('Error loading audiometry:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                <p className="text-slate-500 text-xs font-medium">Cargando estudios auditivos...</p>
            </div>
        )
    }

    if (!audio) {
        return (
            <Card className="border-0 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-bold">Sin registros de audiometría</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 mb-4">
                    Este paciente aún no cuenta con estudios de audiometría tonal realizados.
                </p>
                <div className="max-w-lg mx-auto">
                    <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="audiometria" onSaved={() => loadData()} />
                </div>
            </Card>
        )
    }

    const semStyle = SEMAFORO_STYLES[audio.semaforo_general as keyof typeof SEMAFORO_STYLES] || SEMAFORO_STYLES.verde

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200`}>
                            <Ear className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Audiometría Tonal</h3>
                            <p className="text-xs text-slate-400 font-medium">{audio.tecnico} — {audio.equipo}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="audiometria" onSaved={() => loadData()} />
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</p>
                            <p className="text-sm font-bold text-slate-700">
                                {new Date(audio.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl ${semStyle.bgLight} border ${semStyle.border} text-center`}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Semáforo</p>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-3 h-3 rounded-full ${semStyle.bg}`} />
                                <p className={`text-sm font-bold ${semStyle.text}`}>{semStyle.label}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diagnosis banner */}
                <div className={`flex items-center gap-3 p-4 rounded-xl ${semStyle.bgLight} border ${semStyle.border}`}>
                    <AlertTriangle className={`w-5 h-5 ${semStyle.text} flex-shrink-0`} />
                    <div>
                        <p className={`text-sm font-bold ${semStyle.text}`}>{audio.diagnostico}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{audio.interpretacion_nom011}</p>
                    </div>
                </div>
            </div>

            {/* Audiogram + Semáforos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <AudiogramChart od={audio.oido_derecho || {}} oi={audio.oido_izquierdo || {}} title="Audiograma — Estudio Actual" />
                </div>
                <div className="space-y-3">
                    <SemaforoIndicator label="Oído Derecho" semaforo={audio.semaforo_od} ptaDb={audio.promedio_tonal_od} />
                    <SemaforoIndicator label="Oído Izquierdo" semaforo={audio.semaforo_oi} ptaDb={audio.promedio_tonal_oi} />

                    {/* Re-evaluation badge */}
                    {audio.requiere_reevaluacion && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <RefreshCw className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-blue-700">Reevaluación requerida</p>
                                <p className="text-[10px] text-blue-600">En {audio.tiempo_reevaluacion_meses} meses</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Data table */}
            <Card className="border-slate-100 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Frecuencia</th>
                                {FREQ_LABELS.map(f => (
                                    <th key={f} className="px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">{f}</th>
                                ))}
                                <th className="px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">PTA</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-50">
                                <td className="px-4 py-2.5 font-bold text-red-600 flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> OD (Der.)
                                </td>
                                {FREQUENCIES.map(f => {
                                    const val = audio.oido_derecho?.[f] ?? 0
                                    return (
                                        <td key={f} className={`px-3 py-2.5 text-center font-bold tabular-nums ${val > 25 ? 'text-amber-600 bg-amber-50/50' : 'text-slate-700'}`}>
                                            {val}
                                        </td>
                                    )
                                })}
                                <td className="px-3 py-2.5 text-center font-black text-red-600 bg-red-50/50">{audio.promedio_tonal_od}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2.5 font-bold text-blue-600 flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> OI (Izq.)
                                </td>
                                {FREQUENCIES.map(f => {
                                    const val = audio.oido_izquierdo?.[f] ?? 0
                                    return (
                                        <td key={f} className={`px-3 py-2.5 text-center font-bold tabular-nums ${val > 25 ? 'text-amber-600 bg-amber-50/50' : 'text-slate-700'}`}>
                                            {val}
                                        </td>
                                    )
                                })}
                                <td className="px-3 py-2.5 text-center font-black text-blue-600 bg-blue-50/50">{audio.promedio_tonal_oi}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Recommendations */}
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Recomendaciones Audiológicas</h4>
                    </div>
                    <ul className="space-y-2.5">
                        {(Array.isArray(audio.recomendaciones) ? audio.recomendaciones : [audio.recomendaciones || 'Control audiométrico anual']).map((rec: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                                <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

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
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <AudiogramChart od={prev.oido_derecho} oi={prev.oido_izquierdo} title={`Audiograma — ${prev.fecha}`} />
                    <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-700 font-medium">
                            <strong>Comparación:</strong> PTA OD: {prev.promedio_tonal_od}→{audio.promedio_tonal_od} dB
                            ({audio.promedio_tonal_od - prev.promedio_tonal_od > 0 ? '+' : ''}{audio.promedio_tonal_od - prev.promedio_tonal_od} dB) |
                            PTA OI: {prev.promedio_tonal_oi}→{audio.promedio_tonal_oi} dB
                            ({audio.promedio_tonal_oi - prev.promedio_tonal_oi > 0 ? '+' : ''}{audio.promedio_tonal_oi - prev.promedio_tonal_oi} dB)
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Documentos adjuntos de audiometría */}
            <DocumentosAdjuntos
                pacienteId={pacienteId}
                categoria="audiometria"
                titulo="Documentos de Audiometría"
            />
        </div>
    )
}

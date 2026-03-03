/**
 * EstudiosVisualesTab (Optometría) — Scanner fiel + Análisis IA
 * Sección 1: AV con/sin corrección, refracción, Ishihara, tonometría, diagnóstico
 * Sección 2: Gráficas animadas, semáforos visuales, interpretación oftalmológica
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Eye, CheckCircle, AlertTriangle, Shield, Brain, Zap,
    ArrowRight, Glasses, Loader2, Inbox
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import EstudioUploadReview from '@/components/expediente/EstudioUploadReview'

// ── Tabla Snellen ──
const SNELLEN_SCORE: Record<string, number> = {
    '20/15': 100, '20/20': 100, '20/25': 92, '20/30': 85,
    '20/40': 75, '20/50': 60, '20/70': 45, '20/100': 30, '20/200': 15,
}
const SNELLEN_LABEL: Record<string, { label: string; color: string; border: string; bg: string }> = {
    '20/15': { label: 'Superior', color: 'text-emerald-700', border: 'border-emerald-300', bg: 'bg-emerald-50' },
    '20/20': { label: 'Normal', color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
    '20/25': { label: 'Casi Normal', color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50' },
    '20/30': { label: 'Leve', color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50' },
    '20/40': { label: 'Moderada', color: 'text-orange-600', border: 'border-orange-200', bg: 'bg-orange-50' },
    '20/50': { label: 'Deficiente', color: 'text-red-600', border: 'border-red-200', bg: 'bg-red-50' },
    '20/70': { label: 'Baja visión', color: 'text-red-700', border: 'border-red-200', bg: 'bg-red-50' },
    '20/100': { label: 'Severa', color: 'text-red-800', border: 'border-red-300', bg: 'bg-red-100' },
    '20/200': { label: 'Ceguera legal', color: 'text-red-900', border: 'border-red-400', bg: 'bg-red-200' },
}
const snellenInfo = (v: string) => SNELLEN_LABEL[v] || { label: v || '—', color: 'text-slate-600', border: 'border-slate-200', bg: 'bg-slate-50' }

// ── Transformer ──
function buildFromResultados(estudio: any, resultados: any[]): any {
    const get = (name: string): any => {
        const r = resultados.find(r => r.parametro_nombre === name)
        return r?.resultado ?? r?.resultado_numerico ?? null
    }
    return {
        id: estudio.id,
        fecha: estudio.fecha_estudio,
        medico: get('MEDICO_RESPONSABLE') || estudio.medico_responsable || '',
        equipo: get('EQUIPO') || '',
        // AV
        av_od_sc: get('AV_OD_SC') || get('AV_OD'),
        av_oi_sc: get('AV_OI_SC') || get('AV_OI'),
        av_od_cc: get('AV_OD_CC'),
        av_oi_cc: get('AV_OI_CC'),
        // Refracción
        ref_od_esfera: get('REF_OD_ESFERA') || get('ESFERA_OD'),
        ref_od_cilindro: get('REF_OD_CILINDRO') || get('CILINDRO_OD'),
        ref_od_eje: get('REF_OD_EJE') || get('EJE_OD'),
        ref_oi_esfera: get('REF_OI_ESFERA') || get('ESFERA_OI'),
        ref_oi_cilindro: get('REF_OI_CILINDRO') || get('CILINDRO_OI'),
        ref_oi_eje: get('REF_OI_EJE') || get('EJE_OI'),
        // Ishihara
        ishihara_correctas: get('ISHIHARA_CORRECTAS'),
        ishihara_total: get('ISHIHARA_TOTAL') || 17,
        ishihara_resultado: get('ISHIHARA_RESULTADO') || get('COLOR_VISION'),
        // Tonometría
        tension_od: get('TENSION_OD') || get('PIO_OD'),
        tension_oi: get('TENSION_OI') || get('PIO_OI'),
        // Diagnóstico
        diagnostico: get('DIAGNOSTICO_OPTOMETRICO') || estudio.diagnostico || '',
        diagnostico_od: get('DIAGNOSTICO_OD'),
        diagnostico_oi: get('DIAGNOSTICO_OI'),
        recomendacion: get('RECOMENDACION') || '',
        rawResults: resultados,
    }
}

// ─────────────────────────────────────────────
// COMPONENTE: AV Chart SVG — Tabla optotipo simplificada
// ─────────────────────────────────────────────
function AVChart({ av_sc, av_cc, side, color }: {
    av_sc: string; av_cc?: string; side: 'OD' | 'OI'; color: 'blue' | 'emerald'
}) {
    const rows = ['20/200', '20/100', '20/70', '20/50', '20/40', '20/30', '20/25', '20/20', '20/15']
    const sc = av_sc || ''
    const cc = av_cc || ''
    const dotColor = color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'
    const textColor = color === 'blue' ? 'text-blue-700' : 'text-emerald-700'

    return (
        <div className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                <p className={`text-xs font-black uppercase tracking-widest ${textColor}`}>{side}</p>
            </div>
            <div className="space-y-1">
                {rows.map((row, i) => {
                    const rowFontSize = `${Math.max(6, 12 - i * 0.8)}px`
                    const isSC = row === sc
                    const isCC = row === cc
                    return (
                        <div key={row} className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${isSC ? (color === 'blue' ? 'bg-blue-50 border border-blue-200' : 'bg-emerald-50 border border-emerald-200') : isCC ? 'bg-amber-50 border border-amber-200' : ''}`}>
                            <span className="text-[9px] font-mono text-slate-400 w-14">{row}</span>
                            <div className="flex-1 flex justify-center items-center">
                                <span className="font-black text-slate-700 tracking-widest select-none"
                                    style={{ fontSize: rowFontSize }}>
                                    {'EZHDPCF HK'.charAt(i % 10)} {'LCNA'.charAt((i + 3) % 4)} {'OHD'.charAt(i % 3)}
                                </span>
                            </div>
                            {isSC && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${color === 'blue' ? 'bg-blue-200 text-blue-700' : 'bg-emerald-200 text-emerald-700'}`}>SC</span>}
                            {isCC && <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-700">CC</span>}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Gauge visual AV (semicírculo)
// ─────────────────────────────────────────────
function AVGauge({ label, value, color }: { label: string; value: string; color: 'blue' | 'emerald' }) {
    const info = snellenInfo(value)
    const score = SNELLEN_SCORE[value] || 50
    const r = 44, cx = 55, cy = 55
    const circ = Math.PI * r // semicírculo
    const strokeColor = color === 'blue' ? '#3b82f6' : '#10b981'
    const warnScore = score < 80

    return (
        <div className={`p-4 rounded-2xl border text-center ${warnScore ? 'bg-amber-50 border-amber-200' : (color === 'blue' ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200')}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
            <div className="relative mx-auto" style={{ width: 110, height: 64 }}>
                <svg viewBox="0 0 110 64" className="w-full h-full">
                    <path d="M 11 55 A 44 44 0 0 1 99 55" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
                    <motion.path d="M 11 55 A 44 44 0 0 1 99 55" fill="none"
                        stroke={warnScore ? '#f59e0b' : strokeColor} strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ * (1 - score / 100) }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
                    />
                </svg>
                <div className="absolute inset-x-0 bottom-0 text-center">
                    <p className={`text-xl font-black ${warnScore ? 'text-amber-700' : (color === 'blue' ? 'text-blue-700' : 'text-emerald-700')}`}>
                        {value || '—'}
                    </p>
                </div>
            </div>
            <p className={`text-xs font-bold mt-1 ${info.color}`}>{info.label}</p>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function EstudiosVisualesTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [activeSection, setActiveSection] = useState<'scanner' | 'analisis'>('scanner')

    useEffect(() => { if (pacienteId) loadData() }, [pacienteId])

    const loadData = async () => {
        try {
            setLoading(true)
            const { data: estudios } = await supabase
                .from('estudios_clinicos').select('*')
                .eq('paciente_id', pacienteId)
                .in('tipo_estudio', ['optometria', 'visual', 'vision'])
                .order('fecha_estudio', { ascending: false }).limit(1)
            if (estudios && estudios.length > 0) {
                const { data: res } = await supabase.from('resultados_estudio').select('*').eq('estudio_id', estudios[0].id)
                if (res && res.length > 0) { setData(buildFromResultados(estudios[0], res)); return }
            }
            // Legacy
            const { data: pac } = await supabase.from('pacientes').select('optometria, agudeza_visual').eq('id', pacienteId).single()
            if (pac?.optometria || pac?.agudeza_visual) {
                const d = pac.optometria || {}
                const av = pac.agudeza_visual || {}
                setData({
                    id: 'legacy', fecha: null,
                    av_od_sc: d.av_od || av.od_sc || '', av_oi_sc: d.av_oi || av.oi_sc || '',
                    av_od_cc: d.av_od_cc || av.od_cc || '', av_oi_cc: d.av_oi_cc || av.oi_cc || '',
                    ishihara_correctas: d.ishihara_correctas, ishihara_total: d.ishihara_total || 17,
                    diagnostico: d.diagnostico || '', recomendacion: d.recomendacion || '',
                })
                return
            }
            if (pacienteId?.startsWith('demo')) {
                const demo = getExpedienteDemoCompleto()
                setData((demo as any).optometria || (demo as any).visual)
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <Eye className="w-8 h-8 text-cyan-500" />
            </motion.div>
            <p className="text-slate-400 text-xs font-medium">Cargando optometría...</p>
        </div>
    )

    if (!data) return (
        <Card className="border-0 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-cyan-300" />
            </div>
            <h3 className="text-slate-800 font-bold">Sin resultados de optometría</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 mb-6">
                Sube el PDF o imagen del estudio visual para extracción automática.
            </p>
            <div className="max-w-lg mx-auto">
                <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="optometria" onSaved={loadData} />
            </div>
        </Card>
    )

    const avOdOk = !data.av_od_sc || (SNELLEN_SCORE[data.av_od_sc] || 100) >= 80
    const avOiOk = !data.av_oi_sc || (SNELLEN_SCORE[data.av_oi_sc] || 100) >= 80
    const ishiharaOk = !data.ishihara_correctas || data.ishihara_correctas >= (data.ishihara_total * 0.9)
    const pio_alta = (data.tension_od && Number(data.tension_od) > 21) || (data.tension_oi && Number(data.tension_oi) > 21)
    const allOk = avOdOk && avOiOk && ishiharaOk && !pio_alta

    const alertas: string[] = []
    if (!avOdOk) alertas.push(`AV OD ${data.av_od_sc} — ${snellenInfo(data.av_od_sc).label}`)
    if (!avOiOk) alertas.push(`AV OI ${data.av_oi_sc} — ${snellenInfo(data.av_oi_sc).label}`)
    if (!ishiharaOk) alertas.push(`Visión del color alterada: ${data.ishihara_correctas}/${data.ishihara_total} láminas`)
    if (pio_alta) alertas.push(`Presión intraocular elevada — riesgo de glaucoma`)

    return (
        <div className="space-y-5">

            {/* HEADER */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-200">
                            <Eye className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Optometría</h3>
                            <p className="text-xs text-slate-400 font-medium">{data.medico || 'GP Medical Health'}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="optometria" onSaved={loadData} />
                        <div className={`px-4 py-2 rounded-xl border ${allOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resultado</p>
                            <div className="flex items-center gap-1.5">
                                {allOk ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                <p className={`text-sm font-bold ${allOk ? 'text-emerald-700' : 'text-amber-700'}`}>{allOk ? 'Normal' : 'Con Hallazgos'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {data.diagnostico && (
                    <div className={`mt-4 p-3 rounded-xl ${allOk ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                        <p className={`text-sm font-medium ${allOk ? 'text-emerald-700' : 'text-amber-700'}`}>{data.diagnostico}</p>
                    </div>
                )}
                {alertas.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                        {alertas.map((a, i) => (
                            <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}
                                className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                                <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-700">{a}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* TABS */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {(['scanner', 'analisis'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSection(s)}
                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSection === s ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {s === 'scanner' ? '📋 Vista Escáner' : '🧠 Análisis IA'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ESCÁNER */}
                {activeSection === 'scanner' && (
                    <motion.div key="sc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">

                        {/* Tabla optotipos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AVChart av_sc={data.av_od_sc} av_cc={data.av_od_cc} side="OD" color="blue" />
                            <AVChart av_sc={data.av_oi_sc} av_cc={data.av_oi_cc} side="OI" color="emerald" />
                        </div>

                        {/* Refracción */}
                        {(data.ref_od_esfera || data.ref_oi_esfera) && (
                            <Card className="border-slate-100 shadow-sm overflow-hidden">
                                <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Refracción</p>
                                </div>
                                <div className="p-5 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="text-left py-2 text-[10px] font-black uppercase text-slate-400">Ojo</th>
                                                <th className="py-2 text-center text-[10px] font-black uppercase text-slate-400">Esfera</th>
                                                <th className="py-2 text-center text-[10px] font-black uppercase text-slate-400">Cilindro</th>
                                                <th className="py-2 text-center text-[10px] font-black uppercase text-slate-400">Eje</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { label: 'OD', esfera: data.ref_od_esfera, cilindro: data.ref_od_cilindro, eje: data.ref_od_eje, color: 'text-blue-700' },
                                                { label: 'OI', esfera: data.ref_oi_esfera, cilindro: data.ref_oi_cilindro, eje: data.ref_oi_eje, color: 'text-emerald-700' },
                                            ].map(({ label, esfera, cilindro, eje, color }) => (
                                                <tr key={label} className="border-b border-slate-50 last:border-0">
                                                    <td className={`py-3 font-black text-xs ${color}`}>{label}</td>
                                                    <td className="py-3 text-center font-bold text-slate-700">{esfera || '—'}</td>
                                                    <td className="py-3 text-center font-bold text-slate-700">{cilindro || '—'}</td>
                                                    <td className="py-3 text-center font-bold text-slate-700">{eje ? `${eje}°` : '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {/* Tonometría e Ishihara */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'PIO OD', val: data.tension_od, unit: 'mmHg', warn: Number(data.tension_od) > 21 },
                                { label: 'PIO OI', val: data.tension_oi, unit: 'mmHg', warn: Number(data.tension_oi) > 21 },
                                { label: 'Ishihara', val: data.ishihara_correctas != null ? `${data.ishihara_correctas}/${data.ishihara_total || 17}` : null, unit: '', warn: data.ishihara_correctas != null && data.ishihara_correctas < (data.ishihara_total || 17) * 0.9 },
                                { label: 'Diagnóstico OD', val: data.diagnostico_od, unit: '', warn: !!data.diagnostico_od && data.diagnostico_od.toLowerCase() !== 'normal' },
                                { label: 'Diagnóstico OI', val: data.diagnostico_oi, unit: '', warn: !!data.diagnostico_oi && data.diagnostico_oi.toLowerCase() !== 'normal' },
                            ].filter(d => d.val !== null && d.val !== undefined && d.val !== '').map(({ label, val, unit, warn }) => (
                                <div key={label} className={`p-3 rounded-xl border ${warn ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                                    <p className={`text-sm font-bold mt-0.5 ${warn ? 'text-amber-700' : 'text-slate-700'}`}>{val}{unit ? ` ${unit}` : ''}</p>
                                </div>
                            ))}
                        </div>

                        {data.recomendacion && (
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">Recomendación</p>
                                <p className="text-sm text-slate-700">{data.recomendacion}</p>
                            </div>
                        )}

                        <DocumentosAdjuntos pacienteId={pacienteId} categoria="optometria" titulo="Archivo Original Optometría" collapsedByDefault={false} />
                    </motion.div>
                )}

                {/* ANÁLISIS IA */}
                {activeSection === 'analisis' && (
                    <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">

                        {/* Header IA */}
                        <div className="bg-gradient-to-br from-cyan-900 via-sky-900 to-blue-900 rounded-2xl p-5 text-white">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Brain className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-black text-sm">Análisis Oftalmológico IA</p>
                                    <p className="text-cyan-200 text-xs">Evaluación visual completa — función binocular</p>
                                </div>
                            </div>
                            <p className="text-sm text-cyan-100 leading-relaxed">{data.diagnostico || `AV OD: ${data.av_od_sc || '—'} • AV OI: ${data.av_oi_sc || '—'}. ${allOk ? 'Agudeza visual dentro de límites normales.' : 'Alteraciones visuales detectadas.'}`}</p>
                        </div>

                        {/* Gauges AV */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Agudeza Visual — Sin Corrección</p>
                            <div className="grid grid-cols-2 gap-4">
                                <AVGauge label="OD — Oído Derecho" value={data.av_od_sc || ''} color="blue" />
                                <AVGauge label="OI — Oído Izquierdo" value={data.av_oi_sc || ''} color="emerald" />
                            </div>
                        </div>

                        {(data.av_od_cc || data.av_oi_cc) && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Agudeza Visual — Con Corrección</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {data.av_od_cc && <AVGauge label="OD — Con corrección" value={data.av_od_cc} color="blue" />}
                                    {data.av_oi_cc && <AVGauge label="OI — Con corrección" value={data.av_oi_cc} color="emerald" />}
                                </div>
                            </div>
                        )}

                        {/* Interpretación */}
                        <Card className="border-cyan-100 shadow-sm bg-gradient-to-br from-cyan-50 to-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="w-4 h-4 text-cyan-600" />
                                    <p className="text-sm font-black text-slate-800 uppercase">Interpretación Oftalmológica</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3 bg-white rounded-xl border border-cyan-100">
                                        <p className="font-black text-cyan-700 text-xs uppercase mb-1">Agudeza Visual Binocular</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            OD: <strong>{data.av_od_sc || '—'}</strong> ({snellenInfo(data.av_od_sc).label}) —
                                            OI: <strong>{data.av_oi_sc || '—'}</strong> ({snellenInfo(data.av_oi_sc).label}).
                                            {avOdOk && avOiOk ? ' Agudeza visual bilateral dentro de límites normales.'
                                                : ' Se detecta déficit visual que puede afectar el desempeño laboral.'}
                                        </p>
                                    </div>
                                    {data.tension_od && (
                                        <div className={`p-3 rounded-xl border ${pio_alta ? 'bg-amber-50 border-amber-200' : 'bg-white border-cyan-100'}`}>
                                            <p className="font-black text-xs uppercase mb-1 text-cyan-700">Presión Intraocular</p>
                                            <p className="text-sm text-slate-700">OD: {data.tension_od} mmHg — OI: {data.tension_oi} mmHg (Ref: ≤21 mmHg). {pio_alta ? 'PIO elevada — descartar glaucoma.' : 'PIO normal.'}</p>
                                        </div>
                                    )}
                                    {alertas.length > 0 && (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                            <p className="font-black text-amber-700 text-xs uppercase mb-2">Hallazgos</p>
                                            <ul className="space-y-1">{alertas.map((a, i) => <li key={i} className="flex items-start gap-2"><Zap className="w-3 h-3 text-amber-500 mt-0.5" /><span className="text-xs text-amber-700">{a}</span></li>)}</ul>
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-xl border ${allOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                        <p className="font-black text-xs uppercase mb-1 text-slate-600">Aptitud Laboral Visual</p>
                                        <p className="text-sm text-slate-700">{allOk ? 'Sin restricción laboral de origen visual. Próximo control según protocolo.' : 'Se recomienda valoración por oftalmólogo. Considerar restricciones para trabajos que requieran agudeza visual alta.'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-emerald-100 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-emerald-500" /><p className="text-sm font-black text-slate-800 uppercase">Recomendaciones</p></div>
                                <ul className="space-y-2">
                                    {[
                                        !avOdOk || !avOiOk ? 'Valoración por oftalmólogo para prescripción de corrección óptica' : 'Control visual anual preventivo',
                                        pio_alta && 'Evaluación por glaucomatólogo',
                                        data.recomendacion,
                                    ].filter(Boolean).map((r, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                            <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /><span>{r as string}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/**
 * ElectrocardiogramaTab — Scanner fiel + Análisis IA sin límite
 * Sección 1: Replica del reporte ECG (trazado imagen, tabla parámetros, interpretación)
 * Sección 2: Análisis cardiológico IA — gauges animados, ritmo visual, alertas clínicas
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    HeartPulse, Activity, Zap, FileText, AlertTriangle, CheckCircle,
    Clock, Shield, Download, Brain, TrendingUp, TrendingDown, Minus,
    Calendar, ChevronDown, ChevronUp, Image as ImageIcon, Info
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import EstudioUploadReview from '@/components/expediente/EstudioUploadReview'
import { printSeccionPDF } from '@/components/expediente/ExportarPDFPaciente'

// ── Rangos de referencia ECG ──
const ECG_REFS: Record<string, { min?: number; max?: number; unit: string; label: string; warn: string }> = {
    FC: { min: 60, max: 100, unit: 'lpm', label: 'Frecuencia Cardiaca', warn: 'FC anormal' },
    ONDA_P: { min: 80, max: 120, unit: 'ms', label: 'Onda P', warn: 'Onda P fuera de rango' },
    INTERVALO_PR: { min: 120, max: 200, unit: 'ms', label: 'Intervalo PR', warn: 'PR prolongado >200ms — Bloqueo 1° grado' },
    COMPLEJO_QRS: { min: 60, max: 100, unit: 'ms', label: 'Complejo QRS', warn: 'QRS ancho >100ms — descartar bloqueo de rama' },
    INTERVALO_QT: { min: 350, max: 450, unit: 'ms', label: 'Intervalo QT', warn: 'QT fuera de rango' },
    INTERVALO_QTC: { max: 450, unit: 'ms', label: 'QTc (Bazett)', warn: 'QTc prolongado >450ms — riesgo arrítmico' },
    EJE_QRS: { min: -30, max: 90, unit: '°', label: 'Eje QRS', warn: 'Desviación axial' },
}

const getParamStatus = (key: string, value: number | null): 'normal' | 'warn' | 'unknown' => {
    if (value === null || value === undefined) return 'unknown'
    const ref = ECG_REFS[key]
    if (!ref) return 'normal'
    if (ref.min !== undefined && value < ref.min) return 'warn'
    if (ref.max !== undefined && value > ref.max) return 'warn'
    return 'normal'
}

// ── Transformer: de resultados_estudio → objeto interno ──
function buildFromResultados(estudio: any, resultados: any[]): any {
    const get = (name: string): any => {
        const r = resultados.find(r => r.parametro_nombre === name)
        return r?.resultado_numerico ?? r?.resultado ?? null
    }
    const num = (name: string): number | null => {
        const v = get(name)
        return v !== null ? Number(v) : null
    }

    return {
        id: estudio.id,
        fecha: estudio.fecha_estudio,
        archivo_url: estudio.archivo_origen || null,
        // Parámetros numéricos
        fc: num('FC'),
        rr: num('RR'),
        onda_p: num('ONDA_P'),
        intervalo_pr: num('INTERVALO_PR'),
        complejo_qrs: num('COMPLEJO_QRS'),
        intervalo_qt: num('INTERVALO_QT'),
        intervalo_qtc: num('INTERVALO_QTC'),
        spo2: num('SPO2'),
        pa: get('PA'),
        // Ejes
        eje_p: num('EJE_P'),
        eje_qrs: num('EJE_QRS'),
        eje_t: num('EJE_T'),
        // Interpretación
        ritmo_automatico: get('RITMO_AUTOMATICO') || get('RITMO') || '',
        resultado_global: get('RESULTADO_GLOBAL') || estudio.diagnostico || '',
        descripcion_ritmo: get('DESCRIPCION_RITMO') || get('RITMO_DESCRIPCION') || '',
        analisis_morfologico: get('ANALISIS_MORFOLOGICO') || '',
        segmento_st: get('SEGMENTO_ST') || '',
        onda_t_desc: get('ONDA_T_DESC') || '',
        conclusion: get('CONCLUSION_ECG') || estudio.interpretacion || '',
        // Metadatos
        tipo_estudio: get('TIPO_ESTUDIO') || 'ECG en reposo',
        equipo: get('EQUIPO_ECG') || estudio.equipo || '',
        medico: get('MEDICO_RESPONSABLE') || estudio.medico_responsable || '',
        tiene_trazado: get('TIENE_TRAZADO_IMAGEN') === 'true' || get('TIENE_TRAZADO_IMAGEN') === true,
        clasificacion: estudio.clasificacion ||
            ((get('RESULTADO_GLOBAL') || '').toLowerCase().includes('normal') ? 'normal' : 'con_hallazgos'),
        rawResults: resultados,
    }
}

// ─────────────────────────────────────────────
// COMPONENTE: Simulación visual del ritmo cardiaco
// ─────────────────────────────────────────────
function RhythmVisualizer({ fc }: { fc: number | null }) {
    const bpm = fc || 75
    const period = 60000 / bpm // ms per beat

    // Genera una tira de ECG sintética (representación visual, no datos reales)
    const W = 500, H = 80
    const beats = 4
    const beatW = W / beats

    const ecgPath = (startX: number) => {
        const mid = H / 2
        return [
            `M ${startX} ${mid}`,
            `L ${startX + beatW * 0.2} ${mid}`,
            `L ${startX + beatW * 0.25} ${mid + 8}`,   // P wave
            `L ${startX + beatW * 0.35} ${mid - 2}`,
            `L ${startX + beatW * 0.4} ${mid - 40}`,   // QRS spike up
            `L ${startX + beatW * 0.43} ${mid + 15}`,  // S wave down
            `L ${startX + beatW * 0.48} ${mid}`,
            `L ${startX + beatW * 0.55} ${mid - 8}`,   // T wave
            `L ${startX + beatW * 0.65} ${mid}`,
            `L ${startX + beatW} ${mid}`,
        ].join(' ')
    }

    return (
        <div className="bg-slate-900 rounded-xl p-4 overflow-hidden relative">
            <div className="absolute top-3 left-3 flex items-center gap-2">
                <motion.div className="w-2 h-2 rounded-full bg-rose-500"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: period / 1000, repeat: Infinity }} />
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                    {bpm} lpm
                </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                <defs>
                    <linearGradient id="ecg-line" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="60%" stopColor="#10b981" stopOpacity="1" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                    </linearGradient>
                </defs>
                {/* Grid de fondo estilo papel ECG */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 25} y1={0} x2={i * 25} y2={H}
                        stroke="#1e293b" strokeWidth="0.5" />
                ))}
                {Array.from({ length: 5 }).map((_, i) => (
                    <line key={`h${i}`} x1={0} y1={i * 20} x2={W} y2={i * 20}
                        stroke="#1e293b" strokeWidth="0.5" />
                ))}
                {/* Tira de ritmo */}
                {Array.from({ length: beats }).map((_, i) => (
                    <motion.path key={i} d={ecgPath(i * beatW)}
                        fill="none" stroke="url(#ecg-line)" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: i * 0.2, duration: 0.4, ease: 'easeOut' }}
                    />
                ))}
            </svg>
            <p className="text-[9px] text-slate-600 text-right mt-1 font-medium">
                Representación visual del ritmo — 25 mm/s
            </p>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Gauge ECG parámetro
// ─────────────────────────────────────────────
function ECGParamGauge({ label, value, unit, min, max, decimals = 0 }: {
    label: string; value: number | null; unit: string; min: number; max: number; decimals?: number
}) {
    if (value === null) return (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className="text-slate-300 font-bold">—</p>
        </div>
    )
    const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
    const isWarn = value < min || value > max
    const color = isWarn ? '#f59e0b' : '#10b981'
    const r = 34, cx = 44, cy = 44, circ = 2 * Math.PI * r

    return (
        <div className={`p-4 rounded-xl border text-center ${isWarn ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-100'}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
            <div className="relative mx-auto w-22 h-22" style={{ width: 88, height: 88 }}>
                <svg viewBox="0 0 88 88" className="-rotate-90 w-full h-full">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <motion.circle cx={cx} cy={cy} r={r} fill="none"
                        stroke={color} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
                        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={`text-lg font-black ${isWarn ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {value.toFixed(decimals)}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold">{unit}</p>
                </div>
            </div>
            <p className={`text-[10px] font-bold mt-1 ${isWarn ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isWarn ? '⚠ Fuera de rango' : '✓ Normal'}
            </p>
            <p className="text-[9px] text-slate-400">Ref: {min}–{max}</p>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Eje eléctrico SVG
// ─────────────────────────────────────────────
function EjesElectricos({ ejeP, ejeQRS, ejeT }: { ejeP: number | null; ejeQRS: number | null; ejeT: number | null }) {
    const cx = 80, cy = 80, r = 60

    const toXY = (deg: number) => ({
        x: cx + r * Math.cos((deg - 90) * Math.PI / 180),
        y: cy + r * Math.sin((deg - 90) * Math.PI / 180),
    })

    const axes = [
        { deg: ejeP, color: '#a855f7', label: 'P' },
        { deg: ejeQRS, color: '#ef4444', label: 'QRS' },
        { deg: ejeT, color: '#3b82f6', label: 'T' },
    ]

    const getZona = (deg: number | null): string => {
        if (deg === null) return '—'
        if (deg >= -30 && deg <= 90) return 'Normal'
        if (deg > 90 && deg <= 180) return 'Desviación Derecha'
        return 'Desviación Izquierda'
    }

    return (
        <div className="bg-white rounded-xl border border-slate-100 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Ejes Eléctricos</p>
            <div className="flex gap-4 items-center">
                <svg viewBox="0 0 160 160" className="w-36 h-36 flex-shrink-0">
                    {/* Círculo de referencia */}
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                    {/* Cuadrantes */}
                    <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#e2e8f0" strokeWidth="0.8" />
                    <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#e2e8f0" strokeWidth="0.8" />
                    {/* Zona normal (−30° a +90°) */}
                    <path d={`M ${cx} ${cy} L ${toXY(-30).x} ${toXY(-30).y} A ${r} ${r} 0 0 1 ${toXY(90).x} ${toXY(90).y} Z`}
                        fill="rgba(16,185,129,0.08)" />
                    {/* Vectores */}
                    {axes.map(({ deg, color, label }) => {
                        if (deg === null) return null
                        const pt = toXY(deg)
                        return (
                            <motion.g key={label}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}>
                                <motion.line x1={cx} y1={cy} x2={pt.x} y2={pt.y}
                                    stroke={color} strokeWidth="2.5" strokeLinecap="round"
                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.6 }} />
                                <circle cx={pt.x} cy={pt.y} r="4" fill={color} />
                                <text x={pt.x + (pt.x > cx ? 4 : -12)} y={pt.y + 4}
                                    fontSize="9" fontWeight="800" fill={color}>{label}</text>
                            </motion.g>
                        )
                    })}
                    {/* Labels de orientación */}
                    <text x={cx} y={12} textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="700">−90°</text>
                    <text x={cx} y={cy + r + 12} textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="700">+90°</text>
                    <text x={4} y={cy + 4} fontSize="8" fill="#94a3b8" fontWeight="700">±180°</text>
                    <text x={cx + r - 4} y={cy + 4} fontSize="8" fill="#94a3b8" fontWeight="700">0°</text>
                </svg>
                <div className="space-y-2 flex-1">
                    {axes.map(({ deg, color, label }) => (
                        <div key={label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                                <span className="text-xs font-bold text-slate-600">Eje {label}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-black text-slate-800">
                                    {deg !== null ? `${deg}°` : '—'}
                                </span>
                                <p className={`text-[9px] font-bold ${getZona(deg) === 'Normal' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {getZona(deg)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function ElectrocardiogramaTab({ pacienteId, paciente }: { pacienteId: string; paciente?: any }) {
    const [loading, setLoading] = useState(true)
    const [estudios, setEstudios] = useState<any[]>([])
    const [activeSection, setActiveSection] = useState<'scanner' | 'analisis'>('scanner')
    const [selectedIdx, setSelectedIdx] = useState(0)

    useEffect(() => { if (pacienteId) loadECG() }, [pacienteId])

    const loadECG = async () => {
        setLoading(true)
        try {
            const all: any[] = []

            // FUENTE 1: Nueva arquitectura unificada
            const { data: estudiosDB } = await supabase
                .from('estudios_clinicos').select('*')
                .eq('paciente_id', pacienteId)
                .in('tipo_estudio', ['ecg', 'electrocardiograma'])
                .order('fecha_estudio', { ascending: false }).limit(5)

            if (estudiosDB && estudiosDB.length > 0) {
                for (const est of estudiosDB) {
                    const { data: resultados } = await supabase
                        .from('resultados_estudio').select('*').eq('estudio_id', est.id)
                    if (resultados && resultados.length > 0) {
                        all.push(buildFromResultados(est, resultados))
                    }
                }
            }

            // FUENTE 2: servicio legacy
            if (all.length === 0) {
                const { electrocardiogramaService } = await import('@/services/electrocardiogramaService')
                const legacyData = await electrocardiogramaService.listar({ paciente_id: pacienteId })
                for (const ecg of legacyData) {
                    all.push({
                        id: ecg.id,
                        fecha: ecg.fecha_estudio,
                        fc: ecg.frecuencia_cardiaca,
                        rr: null,
                        onda_p: null,
                        intervalo_pr: ecg.intervalo_pr,
                        complejo_qrs: ecg.complejo_qrs,
                        intervalo_qt: ecg.intervalo_qt,
                        intervalo_qtc: ecg.intervalo_qtc,
                        eje_p: null,
                        eje_qrs: ecg.eje_qrs,
                        eje_t: null,
                        ritmo_automatico: ecg.ritmo,
                        resultado_global: ecg.clasificacion,
                        conclusión: ecg.hallazgos,
                        analisis_morfologico: ecg.onda_t ? `Onda T: ${ecg.onda_t}. ST: ${ecg.segmento_st || 'sin alteraciones'}` : '',
                        segmento_st: ecg.segmento_st,
                        medico: ecg.realizado_por,
                        clasificacion: ecg.clasificacion,
                        tiene_trazado: false,
                    })
                }
            }

            setEstudios(all)
        } catch (e) { console.error('ECG loadError:', e) }
        finally { setLoading(false) }
    }

    if (loading) return (
        <div className="py-20 flex flex-col items-center gap-3">
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                <HeartPulse className="w-8 h-8 text-rose-500" />
            </motion.div>
            <p className="text-slate-400 text-xs font-medium">Cargando electrocardiograma...</p>
        </div>
    )

    if (estudios.length === 0) return (
        <Card className="border-0 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HeartPulse className="w-8 h-8 text-rose-300" />
            </div>
            <h3 className="text-slate-800 font-bold">Sin electrocardiogramas</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-6">
                Sube el trazado ECG (PDF) o el reporte de interpretación para análisis automático.
            </p>
            <div className="max-w-lg mx-auto">
                <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="ecg" onSaved={loadECG} />
            </div>
        </Card>
    )

    const ecg = estudios[selectedIdx] || estudios[0]
    const isNormal = (ecg.clasificacion || '').includes('normal') ||
        (ecg.resultado_global || '').toLowerCase().includes('normal')

    // Alertas automáticas
    const alertas: { msg: string; level: 'warn' | 'info' }[] = []
    if (ecg.intervalo_qtc && ecg.intervalo_qtc > 450)
        alertas.push({ msg: `QTc prolongado (${ecg.intervalo_qtc} ms) — Riesgo de Torsades de Pointes`, level: 'warn' })
    if (ecg.fc && (ecg.fc < 60 || ecg.fc > 100))
        alertas.push({ msg: `FC ${ecg.fc < 60 ? 'Bradicardia' : 'Taquicardia'} (${ecg.fc} lpm)`, level: 'warn' })
    if (ecg.intervalo_pr && ecg.intervalo_pr > 200)
        alertas.push({ msg: `PR prolongado (${ecg.intervalo_pr} ms) — Bloqueo AV 1° grado`, level: 'warn' })
    if (ecg.complejo_qrs && ecg.complejo_qrs > 120)
        alertas.push({ msg: `QRS ancho (${ecg.complejo_qrs} ms) — Descartar bloqueo de rama`, level: 'warn' })
    if (ecg.eje_qrs !== null && ecg.eje_qrs !== undefined && (ecg.eje_qrs < -30 || ecg.eje_qrs > 90))
        alertas.push({ msg: `Eje QRS desviado (${ecg.eje_qrs}°) — ${ecg.eje_qrs > 90 ? 'Desviación Derecha' : 'Desviación Izquierda'}`, level: 'warn' })

    return (
        <div className="space-y-5">

            {/* ── HEADER ── */}
            <div className={`bg-white rounded-2xl border shadow-sm p-5 ${isNormal ? 'border-slate-100' : 'border-rose-100'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isNormal ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-200' : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200'}`}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}>
                            <HeartPulse className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Electrocardiograma</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                {ecg.tipo_estudio || 'ECG en reposo'} — {ecg.medico || 'GP Medical Health'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="ecg" onSaved={loadECG} />
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fecha</p>
                            <p className="text-sm font-bold text-slate-700">
                                {ecg.fecha ? new Date(ecg.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border ${isNormal ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resultado</p>
                            <div className="flex items-center gap-1.5">
                                {isNormal
                                    ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                    : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                <p className={`text-sm font-bold ${isNormal ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {ecg.resultado_global || (isNormal ? 'ECG Normal' : 'Con Hallazgos')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ritmo banner */}
                {ecg.ritmo_automatico && (
                    <div className={`mt-4 flex items-center gap-3 p-3 rounded-xl ${isNormal ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                        <Activity className={`w-4 h-4 ${isNormal ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <p className={`text-sm font-bold ${isNormal ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {ecg.ritmo_automatico}
                        </p>
                    </div>
                )}

                {/* Alertas */}
                {alertas.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                        {alertas.map((a, i) => (
                            <motion.div key={i}
                                initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.07 }}
                                className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                                <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-700">{a.msg}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Selector de estudio si hay múltiples */}
                {estudios.length > 1 && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                        {estudios.map((e, i) => (
                            <button key={e.id} onClick={() => setSelectedIdx(i)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${i === selectedIdx
                                    ? 'bg-rose-500 text-white border-rose-500'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300'
                                    }`}>
                                {e.fecha ? new Date(e.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : `ECG ${i + 1}`}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── TABS ── */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {(['scanner', 'analisis'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSection(s)}
                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSection === s
                            ? 'bg-white text-rose-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}>
                        {s === 'scanner' ? '📋 Vista Escáner' : '🧠 Análisis IA'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ══════════════════════════════════════
                    SECCIÓN 1: ESCÁNER — Replica del reporte
                ══════════════════════════════════════ */}
                {activeSection === 'scanner' && (
                    <motion.div key="scanner" initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-5">

                        {/* Trazado ECG — si hay imagen se muestra, si no un aviso */}
                        {ecg.tiene_trazado ? (
                            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-500">Trazado ECG — Ver archivo adjunto</p>
                                <p className="text-xs text-slate-400 mt-1">El trazado de 12 derivaciones está disponible en el archivo original</p>
                            </div>
                        ) : null}

                        {/* Tabla de parámetros — igual que formato BTL */}
                        <Card className="border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Parámetros del ECG — {ecg.equipo || 'BTL CardioPoint'}
                                </p>
                            </div>
                            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { key: 'FC', label: 'FC', value: ecg.fc, unit: 'lpm', ref: '60–100' },
                                    { key: 'RR', label: 'RR', value: ecg.rr, unit: 'ms', ref: '600–1000' },
                                    { key: 'ONDA_P', label: 'Onda P', value: ecg.onda_p, unit: 'ms', ref: '80–120' },
                                    { key: 'INTERVALO_PR', label: 'PR', value: ecg.intervalo_pr, unit: 'ms', ref: '120–200' },
                                    { key: 'COMPLEJO_QRS', label: 'QRS', value: ecg.complejo_qrs, unit: 'ms', ref: '60–100' },
                                    { key: 'INTERVALO_QT', label: 'QT', value: ecg.intervalo_qt, unit: 'ms', ref: '350–450' },
                                    { key: 'INTERVALO_QTC', label: 'QTc', value: ecg.intervalo_qtc, unit: 'ms', ref: '<450' },
                                    { key: 'EJE_P', label: 'Eje P', value: ecg.eje_p, unit: '°', ref: '0–75' },
                                    { key: 'EJE_QRS', label: 'Eje QRS', value: ecg.eje_qrs, unit: '°', ref: '−30/+90' },
                                    { key: 'EJE_T', label: 'Eje T', value: ecg.eje_t, unit: '°', ref: '—' },
                                    { key: '', label: 'SpO2', value: ecg.spo2, unit: '%', ref: '95–100' },
                                    { key: '', label: 'PA', value: ecg.pa, unit: 'mmHg', ref: '<120/80' },
                                ].map(({ key, label, value, unit, ref }) => {
                                    const numVal = typeof value === 'number' ? value : null
                                    const status = key ? getParamStatus(key, numVal) : 'normal'
                                    return (
                                        <div key={label} className={`p-3 rounded-xl border ${status === 'warn' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                                            <p className={`text-lg font-black mt-0.5 ${status === 'warn' ? 'text-amber-700' : 'text-slate-800'}`}>
                                                {value !== null && value !== undefined ? `${value}` : '—'}
                                                <span className="text-xs font-bold text-slate-400 ml-1">{value !== null && value !== undefined ? unit : ''}</span>
                                            </p>
                                            <p className="text-[9px] text-slate-400">Ref: {ref}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>

                        {/* Interpretación narrativa — texto completo */}
                        {(ecg.descripcion_ritmo || ecg.analisis_morfologico || ecg.conclusion) && (
                            <Card className="border-slate-100 shadow-sm">
                                <CardContent className="p-5 space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reporte de Interpretación Médica</p>
                                    {ecg.descripcion_ritmo && (
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Ritmo Cardiaco</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">{ecg.descripcion_ritmo}</p>
                                        </div>
                                    )}
                                    {ecg.analisis_morfologico && (
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Análisis Morfológico</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">{ecg.analisis_morfologico}</p>
                                        </div>
                                    )}
                                    {ecg.segmento_st && (
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Segmento ST</p>
                                            <p className="text-sm text-slate-700">{ecg.segmento_st}</p>
                                        </div>
                                    )}
                                    {ecg.conclusion && (
                                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">Conclusión / Diagnóstico</p>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{ecg.conclusion}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Datos del estudio */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                { label: 'Médico / Operador', value: ecg.medico || '—' },
                                { label: 'Equipo', value: ecg.equipo || '—' },
                                { label: 'Tipo de Estudio', value: ecg.tipo_estudio || '—' },
                                { label: 'Fecha', value: ecg.fecha ? new Date(ecg.fecha).toLocaleString('es-MX') : '—' },
                            ].map(({ label, value }) => (
                                <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5">{value}</p>
                                </div>
                            ))}
                        </div>

                        <DocumentosAdjuntos pacienteId={pacienteId} categoria="ecg" titulo="Archivo ECG Original (Trazado / Reporte)" collapsedByDefault={false} />
                    </motion.div>
                )}

                {/* ══════════════════════════════════════
                    SECCIÓN 2: ANÁLISIS IA SIN LÍMITE
                ══════════════════════════════════════ */}
                {activeSection === 'analisis' && (
                    <motion.div key="analisis" initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-5">

                        {/* Header IA */}
                        <div className="bg-gradient-to-br from-rose-900 via-red-900 to-orange-900 rounded-2xl p-5 text-white relative overflow-hidden">
                            <div className="absolute inset-0">
                                <RhythmVisualizer fc={ecg.fc} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Brain className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm">Análisis Cardiológico IA</p>
                                        <p className="text-rose-200 text-xs">Interpretación avanzada sin límite de argumentación</p>
                                    </div>
                                </div>
                                <p className="text-sm text-rose-100 leading-relaxed">
                                    {ecg.conclusion || ecg.resultado_global || `${ecg.ritmo_automatico || 'Ritmo sinusal'}. ${isNormal ? 'Sin hallazgos patológicos significativos.' : 'Requiere correlación clínica.'}`}
                                </p>
                            </div>
                        </div>

                        {/* Gauges de los parámetros principales */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                Parámetros Temporales — Análisis Visual
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                <ECGParamGauge label="FC" value={ecg.fc} unit="lpm" min={60} max={100} />
                                <ECGParamGauge label="PR" value={ecg.intervalo_pr} unit="ms" min={120} max={200} />
                                <ECGParamGauge label="QRS" value={ecg.complejo_qrs} unit="ms" min={60} max={100} />
                                <ECGParamGauge label="QTc" value={ecg.intervalo_qtc} unit="ms" min={350} max={450} />
                            </div>
                        </div>

                        {/* Ejes eléctricos */}
                        {(ecg.eje_p !== null || ecg.eje_qrs !== null || ecg.eje_t !== null) && (
                            <EjesElectricos ejeP={ecg.eje_p} ejeQRS={ecg.eje_qrs} ejeT={ecg.eje_t} />
                        )}

                        {/* Análisis por componente */}
                        <Card className="border-rose-100 shadow-sm bg-gradient-to-br from-rose-50 to-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="w-4 h-4 text-rose-600" />
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Interpretación Cardiológica Completa</p>
                                </div>
                                <div className="space-y-3">
                                    {/* FC */}
                                    {ecg.fc !== null && (
                                        <div className="p-3 bg-white rounded-xl border border-rose-100">
                                            <p className="font-black text-rose-700 text-xs uppercase tracking-widest mb-1">Frecuencia Cardiaca</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                FC: <strong>{ecg.fc} lpm</strong> —{' '}
                                                {ecg.fc < 60 ? 'Bradicardia: frecuencia cardiaca por debajo de 60 lpm.' :
                                                    ecg.fc > 100 ? 'Taquicardia: frecuencia cardiaca por encima de 100 lpm.' :
                                                        'Frecuencia cardiaca dentro del rango normal (60-100 lpm).'}
                                                {ecg.rr && ` Intervalo RR: ${ecg.rr} ms.`}
                                            </p>
                                        </div>
                                    )}
                                    {/* Conducción */}
                                    {(ecg.intervalo_pr !== null || ecg.complejo_qrs !== null) && (
                                        <div className="p-3 bg-white rounded-xl border border-rose-100">
                                            <p className="font-black text-rose-700 text-xs uppercase tracking-widest mb-1">Sistema de Conducción</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                {ecg.intervalo_pr && `PR: ${ecg.intervalo_pr} ms ${ecg.intervalo_pr > 200 ? '— PROLONGADO (bloqueo AV 1° grado)' : '— normal'}. `}
                                                {ecg.complejo_qrs && `QRS: ${ecg.complejo_qrs} ms ${ecg.complejo_qrs > 120 ? '— ANCHO (bloqueo de rama)' : '— normal'}. `}
                                                {ecg.intervalo_qtc && `QTc: ${ecg.intervalo_qtc} ms ${ecg.intervalo_qtc > 450 ? '— PROLONGADO — riesgo arrítmico' : '— normal'}.`}
                                            </p>
                                        </div>
                                    )}
                                    {/* Conclusión IA */}
                                    <div className={`p-4 rounded-xl border ${isNormal ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                        <p className={`font-black text-xs uppercase tracking-widest mb-2 ${isNormal ? 'text-emerald-700' : 'text-amber-700'}`}>
                                            Conclusión Clínica
                                        </p>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {ecg.conclusion || (isNormal
                                                ? 'Electrocardiograma dentro de límites normales. Sin alteraciones en el ritmo, conducción ni morfología. Sin contraindicación cardiológica para actividad laboral habitual.'
                                                : 'Se detectaron hallazgos que requieren correlación clínica. Se recomienda valoración por cardiólogo.'
                                            )}
                                        </p>
                                    </div>
                                    {/* Alertas detalladas */}
                                    {alertas.length > 0 && (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                            <p className="font-black text-amber-700 text-xs uppercase tracking-widest mb-2">Hallazgos que requieren atención</p>
                                            <ul className="space-y-1.5">
                                                {alertas.map((a, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-xs text-amber-700 font-medium">{a.msg}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Relevancia laboral */}
                        <Card className="border-emerald-100 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Aptitud Laboral Cardiovascular</p>
                                </div>
                                <div className={`p-3 rounded-xl ${isNormal && alertas.length === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {isNormal && alertas.length === 0
                                            ? 'Sin contraindicación cardiológica para puesto actual. Seguimiento según protocolo de revisión periódica.'
                                            : alertas.length > 0
                                                ? 'Se recomienda valoración cardiológica especializada antes de determinar aptitud laboral definitiva. Correlacionar con historial clínico y factores de riesgo cardiovascular.'
                                                : 'Correlacionar con factores de riesgo y sintomatología del paciente.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

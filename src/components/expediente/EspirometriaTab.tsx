/**
 * EspirometriaTab — Scanner fiel + Análisis IA sin límite
 * Sección 1: Tabla completa de parámetros (Pred/LLN/Mejor/%) + curvas
 * Sección 2: Gráficas SVG animadas, gauges, interpretación neumológica completa
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Wind, CheckCircle, AlertTriangle, ChevronDown, ChevronUp,
    ArrowRight, Shield, Clock, Brain, TrendingUp, TrendingDown, Minus, Zap
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Loader2, Inbox } from 'lucide-react'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import EstudioUploadReview from '@/components/expediente/EstudioUploadReview'
import { SpirometryReport } from './SpirometryReport'

// ── Clasificación patrón ventilatorio ──
const PATRON_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
    normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Normal' },
    obstructivo_leve: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Obstructivo Leve' },
    obstructivo_moderado: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Obstructivo Moderado' },
    obstructivo_severo: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Obstructivo Severo' },
    restrictivo: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Restrictivo' },
    mixto: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Mixto' },
}

// ── Extrae color según %predicho ──
const pctColor = (pct: number) =>
    pct >= 80 ? 'text-emerald-700' : pct >= 60 ? 'text-amber-700' : 'text-red-700'
const pctBg = (pct: number) =>
    pct >= 80 ? 'bg-emerald-50 border-emerald-200' : pct >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

// ─────────────────────────────────────────────
// Transformer: resultados_estudio → interno
// ─────────────────────────────────────────────
function buildFromResultados(estudio: any, resultados: any[]): any {
    const get = (name: string): any => {
        const r = resultados.find(r => r.parametro_nombre === name)
        return r?.resultado_numerico ?? r?.resultado ?? null
    }
    const num = (name: string): number | null => {
        const v = get(name); return v !== null ? Number(v) : null
    }
    const jsonVal = (name: string): any => {
        const v = get(name)
        if (!v) return null
        try { return typeof v === 'string' ? JSON.parse(v) : v } catch { return null }
    }

    const fvc = jsonVal('FVC') || {}
    const fev1 = jsonVal('FEV1') || {}
    const fev1fvc = jsonVal('FEV1/FVC') || {}
    const fef = jsonVal('FEF25-75') || {}
    const pef = jsonVal('PEF') || {}
    const fev6 = jsonVal('FEV6') || {}
    const fet = jsonVal('FET') || {}

    // Curvas
    const curvaFV = jsonVal('CURVA_FLUJO_VOLUMEN')
    const curvaVT = jsonVal('CURVA_VOLUMEN_TIEMPO')
    const zscoreBarras = jsonVal('ZSCORE_BARRAS')

    const patron_raw = (get('PATRON_VENTILATORIO') || get('PATRON_VENTILATORO') || get('INTERPRETACION_SISTEMA') || estudio.diagnostico || 'normal').toLowerCase()
    let patron = 'normal'
    if (patron_raw.includes('obstruc')) {
        const pct = fev1.pct_pred ?? 80
        patron = pct >= 70 ? 'obstructivo_leve' : pct >= 50 ? 'obstructivo_moderado' : pct >= 35 ? 'obstructivo_severo' : 'obstructivo_muy_severo'
    } else if (patron_raw.includes('restric')) patron = 'restrictivo'
    else if (patron_raw.includes('mixto')) patron = 'mixto'

    // Helper para construir objeto de parámetro con pruebas individuales
    const buildParam = (obj: any) => ({
        pred: obj.pred ?? 0, mejor: obj.mejor ?? 0, pct: obj.pct_pred ?? 0,
        lln: obj.lln ?? 0, z_score: obj.z_score ?? null,
        pruebas: obj.pruebas ?? [], fuera_rango: obj.fuera_rango ?? false,
    })

    // Calidad detallada
    const calidadDesc = get('CALIDAD_SESION')
    const calidadObs = resultados.find(r => r.parametro_nombre === 'CALIDAD_SESION')?.observacion || ''

    return {
        id: estudio.id,
        fecha: estudio.fecha_estudio,
        patron,
        calidad: calidadDesc || estudio.calidad || 'A',
        calidad_detalle: calidadObs, // "C (FEV1 Var=0.14L 4.4%; FVC Var=0.19L 4.7%)"
        variabilidad_fev1: get('VARIABILIDAD_FEV1'),
        variabilidad_fvc: get('VARIABILIDAD_FVC'),
        interpretacion_sistema: get('INTERPRETACION_SISTEMA') || estudio.interpretacion || '',
        medico: get('MEDICO_RESPONSABLE') || estudio.medico_responsable || '',
        equipo: get('EQUIPO') || estudio.equipo || '',
        // Config del estudio
        criterio: get('CRITERIO_INTERPRETACION') || estudio.datos_extra?.criterio || '',
        ecuacion_predicho: get('ECUACION_PREDICHO') || estudio.datos_extra?.ecuacion_predicho || '',
        tipo_prueba: get('TIPO_PRUEBA') || '',
        // Parámetros con todas las columnas incluyendo pruebas individuales y Z-score
        fvc: buildParam(fvc),
        fev1: buildParam(fev1),
        fev1_fvc: buildParam(fev1fvc),
        fef: buildParam(fef),
        pef: buildParam(pef),
        fev6: buildParam(fev6),
        fet: { pred: fet.pred ?? 0, mejor: fet.mejor ?? 0, pruebas: fet.pruebas ?? [] },
        // Gráficas
        curvaFV,
        curvaVT,
        zscoreBarras,
        // Antropometría
        altura: num('ALTURA'),
        peso: num('PESO'),
        imc: num('IMC'),
        fumador: get('FUMADOR'),
        asma: get('ASMA'),
        epoc: get('EPOC'),
        etnia: get('ETNIA'),
        rawResults: resultados,
    }
}

// ─────────────────────────────────────────────
// COMPONENTE: Curva Flujo-Volumen SVG animada
// ─────────────────────────────────────────────
function FlowVolumeCurve({ curva, fvc, pef }: { curva: any; fvc: number; pef: number }) {
    const W = 340, H = 200, PAD = 32

    // Genera curva sintética representativa si no hay puntos
    const fvcVal = fvc || 3.5
    const pefVal = pef || 7.0

    const defaultPts = [
        [0, 0], [fvcVal * 0.06, pefVal * 0.7], [fvcVal * 0.10, pefVal],
        [fvcVal * 0.18, pefVal * 0.88], [fvcVal * 0.28, pefVal * 0.72],
        [fvcVal * 0.40, pefVal * 0.55], [fvcVal * 0.55, pefVal * 0.38],
        [fvcVal * 0.70, pefVal * 0.22], [fvcVal * 0.85, pefVal * 0.10],
        [fvcVal, 0],
    ]

    let pts: [number, number][] = defaultPts as [number, number][]
    if (curva?.medido && Array.isArray(curva.medido) && curva.medido.length > 3) {
        pts = curva.medido.map((p: any) => [p.x ?? p.volumen ?? 0, p.y ?? p.flujo ?? 0])
    }

    const maxX = Math.max(...pts.map(p => p[0]), fvcVal * 1.1)
    const maxY = Math.max(...pts.map(p => p[1]), pefVal * 1.1)

    const xS = (v: number) => PAD + (v / maxX) * (W - 2 * PAD)
    const yS = (f: number) => (H - PAD) - (f / maxY) * (H - 2 * PAD)

    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xS(p[0])} ${yS(p[1])}`).join(' ')

    // Predicha (línea discontinua)
    let predPts: [number, number][] = [
        [0, 0], [fvcVal * 1.05 * 0.10, pefVal * 1.05],
        [fvcVal * 1.05 * 0.3, pefVal * 1.05 * 0.7],
        [fvcVal * 1.05 * 0.6, pefVal * 1.05 * 0.35],
        [fvcVal * 1.05, 0]
    ]
    if (curva?.predicho && Array.isArray(curva.predicho) && curva.predicho.length > 2) {
        predPts = curva.predicho.map((p: any) => [p.x ?? 0, p.y ?? 0])
    }
    const predD = predPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xS(p[0])} ${yS(p[1])}`).join(' ')

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">
                Curva Flujo-Volumen (L/s vs L)
            </p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                {/* Grid */}
                {[0, 2, 4, 6, 8].map(f => (
                    <line key={f} x1={PAD} y1={yS(f)} x2={W - PAD} y2={yS(f)} stroke="#f1f5f9" strokeWidth="0.8" />
                ))}
                {[0, 1, 2, 3, 4].map(v => (
                    <line key={v} x1={xS(v)} y1={PAD / 2} x2={xS(v)} y2={H - PAD} stroke="#f1f5f9" strokeWidth="0.8" />
                ))}
                {/* Ejes */}
                <line x1={PAD} y1={H - PAD} x2={W - PAD / 2} y2={H - PAD} stroke="#cbd5e1" strokeWidth="1" />
                <line x1={PAD} y1={PAD / 2} x2={PAD} y2={H - PAD} stroke="#cbd5e1" strokeWidth="1" />
                {/* Labels */}
                <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="7" fontWeight="800" fill="#94a3b8">Volumen (L)</text>
                <text x={10} y={H / 2} textAnchor="middle" fontSize="7" fontWeight="800" fill="#94a3b8" transform={`rotate(-90,10,${H / 2})`}>Flujo (L/s)</text>
                {/* Predicha */}
                <path d={predD} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5,3" />
                {/* Medida */}
                <motion.path d={pathD} fill="rgba(6,182,212,0.08)" stroke="#06b6d4" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />
                {/* PEF label */}
                <text x={xS(pts[2]?.[0] || fvcVal * 0.1) + 6} y={yS(pefVal) - 4}
                    fontSize="7" fontWeight="800" fill="#0891b2">PEF {pefVal.toFixed(1)}</text>
                {/* Leyenda */}
                <line x1={PAD + 5} y1={PAD - 8} x2={PAD + 25} y2={PAD - 8} stroke="#06b6d4" strokeWidth="2" />
                <text x={PAD + 28} y={PAD - 5} fontSize="7" fontWeight="700" fill="#64748b">Medida</text>
                <line x1={PAD + 75} y1={PAD - 8} x2={PAD + 95} y2={PAD - 8} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,2" />
                <text x={PAD + 98} y={PAD - 5} fontSize="7" fontWeight="700" fill="#94a3b8">Predicha</text>
            </svg>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Curva Volumen-Tiempo SVG
// ─────────────────────────────────────────────
function VolTimeCurve({ curva, fvc, fev1 }: { curva: any; fvc: number; fev1: number }) {
    const W = 280, H = 160, PAD = 28
    const fvcVal = fvc || 3.5, fev1Val = fev1 || 2.8

    let pts: [number, number][] = [
        [0, 0], [0.5, fev1Val * 0.55], [1.0, fev1Val],
        [1.5, fev1Val * 1.15], [2.0, fvcVal * 0.9],
        [3.0, fvcVal * 0.97], [4.0, fvcVal], [6.0, fvcVal]
    ]
    if (curva?.medido && Array.isArray(curva.medido) && curva.medido.length > 2) {
        pts = curva.medido.map((p: any) => [p.x ?? p.tiempo ?? 0, p.y ?? p.volumen ?? 0])
    }

    const maxX = 6, maxY = Math.max(fvcVal * 1.1, 0.5)
    const xS = (t: number) => PAD + (t / maxX) * (W - PAD * 1.5)
    const yS = (v: number) => (H - PAD) - (v / maxY) * (H - PAD * 1.5)
    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xS(p[0])} ${yS(p[1])}`).join(' ')

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">
                Curva Volumen-Tiempo (L vs s)
            </p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                {[0, 1, 2, 3].map(v => <line key={v} x1={PAD} y1={yS(v)} x2={W - PAD / 2} y2={yS(v)} stroke="#f1f5f9" strokeWidth="0.8" />)}
                {[0, 1, 2, 3, 4, 6].map(t => <line key={t} x1={xS(t)} y1={H - PAD} x2={xS(t)} y2={PAD / 2} stroke="#f1f5f9" strokeWidth="0.8" />)}
                <line x1={PAD} y1={H - PAD} x2={W - PAD / 2} y2={H - PAD} stroke="#cbd5e1" strokeWidth="1" />
                <line x1={PAD} y1={PAD / 2} x2={PAD} y2={H - PAD} stroke="#cbd5e1" strokeWidth="1" />
                {/* FEV1 marker */}
                <line x1={xS(1)} y1={yS(fev1Val)} x2={xS(1)} y2={H - PAD} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2" />
                <text x={xS(1) + 3} y={H - PAD - 4} fontSize="6" fontWeight="800" fill="#f59e0b">FEV1</text>
                <motion.path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
                />
                <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="7" fontWeight="800" fill="#94a3b8">Tiempo (s)</text>
                <text x={10} y={H / 2} textAnchor="middle" fontSize="7" fontWeight="800" fill="#94a3b8" transform={`rotate(-90,10,${H / 2})`}>Vol (L)</text>
            </svg>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Gráfica Z-Score barras horizontales
// ─────────────────────────────────────────────
function ZScoreChart({ data, zscoreData }: { data: any; zscoreData?: any }) {
    const W = 340, H = 180, PAD = 80, RPAD = 30
    const params: { label: string; z: number }[] = []

    // Primero intentar datos directos del JSON de Z-score barras
    if (zscoreData) {
        if (zscoreData.FVC != null) params.push({ label: 'FVC', z: zscoreData.FVC })
        if (zscoreData.FEV1 != null) params.push({ label: 'FEV1', z: zscoreData.FEV1 })
        if (zscoreData['FEF25-75'] != null) params.push({ label: 'FEF25-75', z: zscoreData['FEF25-75'] })
        if (zscoreData.PEF != null) params.push({ label: 'PEF', z: zscoreData.PEF })
        if (zscoreData.FEV1_FVC != null) params.push({ label: 'FEV1/FVC', z: zscoreData.FEV1_FVC })
    }

    // Fallback: sacar Z-score de los parámetros individuales
    if (params.length === 0) {
        if (data.fvc?.z_score != null) params.push({ label: 'FVC', z: data.fvc.z_score })
        if (data.fev1?.z_score != null) params.push({ label: 'FEV1', z: data.fev1.z_score })
        if (data.fef?.z_score != null) params.push({ label: 'FEF25-75', z: data.fef.z_score })
        if (data.pef?.z_score != null) params.push({ label: 'PEF', z: data.pef.z_score })
        if (data.fev1_fvc?.z_score != null) params.push({ label: 'FEV1/FVC', z: data.fev1_fvc.z_score })
    }

    if (params.length === 0) return null

    const minZ = -5, maxZ = 3
    const barH = 18, gap = 6
    const totalH = params.length * (barH + gap) + 40
    const xScale = (z: number) => PAD + ((z - minZ) / (maxZ - minZ)) * (W - PAD - RPAD)
    const zeroX = xScale(0)

    const barColor = (z: number) =>
        Math.abs(z) <= 1.5 ? '#10b981' : Math.abs(z) <= 2.5 ? '#f59e0b' : '#ef4444'

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">
                Puntuación Z por Parámetro
            </p>
            <svg viewBox={`0 0 ${W} ${totalH}`} className="w-full h-auto">
                {/* Grid vertical lines */}
                {[-4, -3, -2, -1, 0, 1, 2, 3].map(z => (
                    <g key={z}>
                        <line x1={xScale(z)} y1={10} x2={xScale(z)} y2={totalH - 20} stroke={z === 0 ? '#94a3b8' : '#f1f5f9'} strokeWidth={z === 0 ? 1.5 : 0.8} />
                        <text x={xScale(z)} y={totalH - 8} textAnchor="middle" fontSize="7" fontWeight="700" fill="#94a3b8">{z}</text>
                    </g>
                ))}
                {/* LLN zone shading */}
                <rect x={xScale(-1.645)} y={10} width={xScale(0) - xScale(-1.645)} height={totalH - 30} fill="#fef3c7" opacity={0.3} rx={2} />
                {/* Bars */}
                {params.map((p, i) => {
                    const y = 16 + i * (barH + gap)
                    const bw = Math.abs(xScale(p.z) - zeroX)
                    const bx = p.z >= 0 ? zeroX : zeroX - bw
                    return (
                        <g key={p.label}>
                            <text x={PAD - 5} y={y + barH / 2 + 3} textAnchor="end" fontSize="8" fontWeight="800" fill="#475569">{p.label}</text>
                            <motion.rect x={bx} y={y} width={0} height={barH} rx={3} fill={barColor(p.z)}
                                animate={{ width: bw }} transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }} />
                            <text x={xScale(p.z) + (p.z >= 0 ? 4 : -4)} y={y + barH / 2 + 3} textAnchor={p.z >= 0 ? 'start' : 'end'}
                                fontSize="7" fontWeight="800" fill={barColor(p.z)}>
                                {p.z > 0 ? '+' : ''}{p.z.toFixed(2)}
                            </text>
                        </g>
                    )
                })}
                {/* LLN label */}
                <text x={xScale(-1.645)} y={8} textAnchor="middle" fontSize="6" fontWeight="700" fill="#f59e0b">LLN</text>
            </svg>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Gauge barra animada por parámetro
// ─────────────────────────────────────────────
function ParamGauge({ label, mejor, pred, pct, unit }: {
    label: string; mejor: number; pred: number; pct: number; unit: string
}) {
    const colorBar = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
    const cls = pct >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
        : pct >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200'
            : 'text-red-700 bg-red-50 border-red-200'

    return (
        <div className={`p-4 rounded-xl border ${cls}`}>
            <div className="flex justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                <span className={`text-lg font-black tabular-nums ${pct >= 80 ? 'text-emerald-700' : pct >= 60 ? 'text-amber-700' : 'text-red-700'}`}>
                    {pct > 0 ? `${Math.round(pct)}%` : '—'}
                </span>
            </div>
            <div className="w-full h-2.5 bg-white rounded-full overflow-hidden mb-2">
                <motion.div className={`h-full rounded-full ${colorBar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                <span>Mejor: <b className="text-slate-700">{mejor > 0 ? `${mejor} ${unit}` : '—'}</b></span>
                <span>Pred: <b className="text-slate-700">{pred > 0 ? `${pred} ${unit}` : '—'}</b></span>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function EspirometriaTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [prev, setPrev] = useState<any>(null)
    const [activeSection, setActiveSection] = useState<'scanner' | 'analisis'>('scanner')
    const [showPrev, setShowPrev] = useState(false)

    const [patientData, setPatientData] = useState<any>(null)
    const [directSpiroData, setDirectSpiroData] = useState<any>(null) // SpiroClone direct data

    useEffect(() => { if (pacienteId) loadData() }, [pacienteId])

    const loadData = async () => {
        try {
            setLoading(true)

            // Obtener info del paciente para el reporte
            const { data: pData } = await supabase
                .from('pacientes').select('*').eq('id', pacienteId).single()
            if (pData) setPatientData(pData)

            // FUENTE 1: Nueva arquitectura
            const { data: estudios } = await supabase
                .from('estudios_clinicos').select('*')
                .eq('paciente_id', pacienteId)
                .in('tipo_estudio', ['espirometria', 'spirometry'])
                .order('fecha_estudio', { ascending: false }).limit(2)

            if (estudios && estudios.length > 0) {
                for (let idx = 0; idx < estudios.length; idx++) {
                    const est = estudios[idx]

                    // ══ PRIORIDAD: SpiroClone directo (si existe) ══
                    if (est.datos_extra?.spiroclone_data) {
                        if (idx === 0) {
                            setDirectSpiroData(est.datos_extra.spiroclone_data)
                            // También setear data para que la UI no muestre "Sin registros"
                            setData({
                                id: est.id,
                                fecha: est.fecha_estudio,
                                patron: 'normal',
                                medico: est.datos_extra.spiroclone_data?.doctor?.name || '',
                                equipo: 'EasyOne Connect',
                                interpretacion_sistema: est.datos_extra.spiroclone_data?.session?.interpretation || est.interpretacion || '',
                                fvc: { pred: 0, mejor: 0, pct: 0 },
                                fev1: { pred: 0, mejor: 0, pct: 0 },
                                fev1_fvc: { pred: 0, mejor: 0, pct: 0 },
                                fef: { pred: 0, mejor: 0, pct: 0 },
                                pef: { pred: 0, mejor: 0, pct: 0 },
                                calidad: est.datos_extra.spiroclone_data?.session?.quality?.charAt(est.datos_extra.spiroclone_data?.session?.quality?.lastIndexOf(' ') + 1) || 'A',
                            })
                        }
                        continue
                    }

                    // Fallback: Pipeline genérico (legacy)
                    const { data: res } = await supabase
                        .from('resultados_estudio').select('*').eq('estudio_id', est.id)
                    if (res && res.length > 0) {
                        const built = buildFromResultados(est, res)
                        if (idx === 0) setData(built)
                        else setPrev(built)
                    }
                }
                setLoading(false)
                return
            }

            // FUENTE 2: tabla legacy espirometrias
            const { data: legacy } = await supabase
                .from('espirometrias').select('*')
                .eq('paciente_id', pacienteId)
                .order('created_at', { ascending: false }).limit(2)

            if (legacy && legacy.length > 0) {
                const map = (d: any): any => ({
                    ...d, fecha: d.fecha_estudio || d.fecha,
                    patron: d.clasificacion || 'normal',
                    calidad: d.calidad_prueba || 'A',
                    medico: d.medico_responsable || '',
                    fvc: { pred: d.fvc_predicho || 0, mejor: d.fvc || 0, pct: d.fvc_porcentaje || 0 },
                    fev1: { pred: d.fev1_predicho || 0, mejor: d.fev1 || 0, pct: d.fev1_porcentaje || 0 },
                    fev1_fvc: { pred: 70, mejor: d.fev1_fvc || 0, pct: d.fev1_fvc || 0 },
                    pef: { pred: 0, mejor: d.pef || 0, pct: 0 },
                    fef: { pred: 0, mejor: 0, pct: 0 },
                    curvaFV: null, curvaVT: null,
                    interpretacion_sistema: d.interpretacion || d.diagnostico || '',
                })
                setData(map(legacy[0]))
                if (legacy[1]) setPrev(map(legacy[1]))
                return
            }

            // Demo
            if (pacienteId?.startsWith('demo')) {
                const demo = getExpedienteDemoCompleto()
                setData(demo.espirometria)
                setPrev(demo.espirometriaPrevia)
            }
        } catch (err) { console.error('Espirometria err:', err) }
        finally { setLoading(false) }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <Wind className="w-8 h-8 text-cyan-500" />
            </motion.div>
            <p className="text-slate-400 text-xs font-medium">Cargando espirometría...</p>
        </div>
    )

    if (!data) return (
        <Card className="border-0 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wind className="w-8 h-8 text-cyan-300" />
            </div>
            <h3 className="text-slate-800 font-bold">Sin registros de espirometría</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 mb-6">
                Sube el PDF del reporte espirométrico para extracción automática de parámetros y curvas.
            </p>
            <div className="max-w-lg mx-auto">
                <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="espirometria" onSaved={loadData} />
            </div>
        </Card>
    )

    const patronStyle = PATRON_STYLES[data.patron] || PATRON_STYLES.normal
    const isNormal = data.patron === 'normal'

    // Alertas automáticas
    const alertas: string[] = []
    if (data.fev1?.pct < 80) alertas.push(`FEV1 ${Math.round(data.fev1.pct)}% del predicho — ${data.fev1.pct < 60 ? 'Limitación severa' : 'Limitación moderada'}`)
    if (data.fvc?.pct < 80) alertas.push(`FVC ${Math.round(data.fvc.pct)}% del predicho — posible patrón restrictivo`)
    if (data.fev1_fvc?.mejor > 0 && data.fev1_fvc.mejor < 70) alertas.push(`FEV1/FVC ${data.fev1_fvc.mejor}% — Relación disminuida, patrón obstructivo`)
    if (data.fef?.pct > 0 && data.fef?.pct < 60) alertas.push('FEF 25-75% reducido — Obstrucción de vías aéreas pequeñas')

    // Mapper a SpirometryData (para el reporte tipo Clon de PDF)
    const mapToSpirometryData = (): any => {
        if (!patientData || !data) return null;

        const age = patientData.fecha_nacimiento
            ? Math.floor((new Date().getTime() - new Date(patientData.fecha_nacimiento).getTime()) / 31557600000)
            : 0;

        // Limpiar strings
        const pName = `${patientData.apellido_paterno || ''} ${patientData.apellido_materno || ''}, ${patientData.nombre || ''}`.replace(/^ , /, '');

        // Generar arreglos de puntos sintéticos si no están completos, o usar los extraídos
        const flowVolumeCurve = [];
        if (data.curvaFV && Array.isArray(data.curvaFV.medido)) {
            let predPts = Array.isArray(data.curvaFV.predicho) ? data.curvaFV.predicho : [];
            let pr2 = Array.isArray(data.curvaFV.prueba2) ? data.curvaFV.prueba2 : [];
            let pr5 = Array.isArray(data.curvaFV.prueba5) ? data.curvaFV.prueba5 : [];
            let pr6 = Array.isArray(data.curvaFV.prueba6) ? data.curvaFV.prueba6 : [];

            // Obtenemos la longitud máxima para iterar y emparejar puntos
            const len = Math.max(
                data.curvaFV.medido.length,
                predPts.length,
                pr2.length,
                pr5.length,
                pr6.length
            );

            for (let i = 0; i < len; i++) {
                const med = data.curvaFV.medido[i] || { x: null, y: null };
                const prd = predPts[i] || { x: null, y: null };
                const p2 = pr2[i] || { x: null, y: null };
                const p5 = pr5[i] || { x: null, y: null };
                const p6 = pr6[i] || { x: null, y: null };

                // Usamos el X dominante para agrupar, típicamente el X medido. Si no, el de otra prueba
                const domX = med.x ?? prd.x ?? p2.x ?? p5.x ?? p6.x ?? 0;

                flowVolumeCurve.push({
                    volume: domX,
                    flowMejor: med.y ?? null,
                    flowPred: prd.y ?? null,
                    flowPrueba2: p2.y ?? null,
                    flowPrueba5: p5.y ?? null,
                    flowPrueba6: p6.y ?? null,
                });
            }
        } else {
            // Sintético base de rescate absoluto si falla extracción
            flowVolumeCurve.push(
                { volume: 0, flowPred: 0, flowMejor: 0 },
                { volume: (data.fvc?.mejor || 3.5) * 0.1, flowPred: (data.pef?.pred || 8), flowMejor: (data.pef?.mejor || 7) },
                { volume: (data.fvc?.mejor || 3.5) * 0.5, flowPred: (data.pef?.pred || 8) * 0.5, flowMejor: (data.pef?.mejor || 7) * 0.4 },
                { volume: (data.fvc?.mejor || 3.5), flowPred: 0, flowMejor: 0 }
            );
        }

        const volumeTimeCurve = [];
        if (data.curvaVT && Array.isArray(data.curvaVT.medido)) {
            let predPtsVT = Array.isArray(data.curvaVT.predicho) ? data.curvaVT.predicho : [];
            let pr2VT = Array.isArray(data.curvaVT.prueba2) ? data.curvaVT.prueba2 : [];
            let pr5VT = Array.isArray(data.curvaVT.prueba5) ? data.curvaVT.prueba5 : [];
            let pr6VT = Array.isArray(data.curvaVT.prueba6) ? data.curvaVT.prueba6 : [];

            const lenVT = Math.max(
                data.curvaVT.medido.length,
                predPtsVT.length,
                pr2VT.length,
                pr5VT.length,
                pr6VT.length
            );

            for (let i = 0; i < lenVT; i++) {
                const med = data.curvaVT.medido[i] || { x: null, y: null };
                const prd = predPtsVT[i] || { x: null, y: null };
                const p2 = pr2VT[i] || { x: null, y: null };
                const p5 = pr5VT[i] || { x: null, y: null };
                const p6 = pr6VT[i] || { x: null, y: null };

                const domX = med.x ?? med.tiempo ?? prd.x ?? p2.x ?? p5.x ?? p6.x ?? 0;

                volumeTimeCurve.push({
                    time: domX,
                    volumeMejor: med.y ?? med.volumen ?? null,
                    volumePred: prd.y ?? null,
                    volumePrueba2: p2.y ?? null,
                    volumePrueba5: p5.y ?? null,
                    volumePrueba6: p6.y ?? null,
                });
            }
        } else {
            volumeTimeCurve.push(
                { time: 0, volumeMejor: 0 },
                { time: 1, volumeMejor: data.fev1?.mejor || 2.5 },
                { time: 6, volumeMejor: data.fvc?.mejor || 3.5 }
            );
        }

        return {
            patient: {
                name: pName,
                id: patientData.numero_empleado || pacienteId.slice(0, 6).toUpperCase(),
                age: age.toString(),
                dob: patientData.fecha_nacimiento || '-',
                sex: patientData.genero === 'masculino' ? 'Masculino' : patientData.genero === 'femenino' ? 'Femenino' : '-',
                height: data.altura ? `${data.altura} cm` : '-',
                weight: data.peso ? `${data.peso} kg` : '-',
                origin: data.etnia || '-',
                smoker: data.fumador || 'No',
                asthma: data.asma || 'No',
                copd: data.epoc || 'No',
                bmi: data.imc ? `${data.imc}` : '-',
            },
            testDetails: {
                date: data.fecha || '-',
                interpretation: data.criterio || '-',
                predicted: data.ecuacion_predicho || '-',
                selection: data.tipo_prueba || '-',
                bestValue: data.variabilidad_fev1 || '-',
                fev1PredPercent: data.fev1?.pct ? `${Math.round(data.fev1.pct)} %` : '-',
            },
            results: [
                {
                    parameter: 'FVC [L]', pred: data.fvc?.pred || '', lln: data.fvc?.lln || '', mejor: `${data.fvc?.mejor || ''}${data.fvc?.fuera_rango ? '*' : ''}`, prueba2: data.fvc?.pruebas?.[1] || '', prueba6: data.fvc?.pruebas?.[5] || '', prueba5: data.fvc?.pruebas?.[4] || '', percentPred: data.fvc?.pct
                        ? Math.round(data.fvc.pct) : '', zScore: data.fvc?.z_score || ''
                },
                { parameter: 'FEV1 [L]', pred: data.fev1?.pred || '', lln: data.fev1?.lln || '', mejor: `${data.fev1?.mejor || ''}${data.fev1?.fuera_rango ? '*' : ''}`, prueba2: data.fev1?.pruebas?.[1] || '', prueba6: data.fev1?.pruebas?.[5] || '', prueba5: data.fev1?.pruebas?.[4] || '', percentPred: data.fev1?.pct ? Math.round(data.fev1.pct) : '', zScore: data.fev1?.z_score || '' },
                { parameter: 'FEV1/FVC', pred: data.fev1_fvc?.pred || '', lln: data.fev1_fvc?.lln || '', mejor: `${data.fev1_fvc?.mejor || ''}${data.fev1_fvc?.fuera_rango ? '*' : ''}`, prueba2: data.fev1_fvc?.pruebas?.[1] || '', prueba6: '', prueba5: '', percentPred: data.fev1_fvc?.pct ? Math.round(data.fev1_fvc.pct) : '', zScore: data.fev1_fvc?.z_score || '' },
                { parameter: 'FEF25-75 [L/s]', pred: data.fef?.pred || '', lln: data.fef?.lln || '', mejor: `${data.fef?.mejor || ''}${data.fef?.fuera_rango ? '*' : ''}`, prueba2: data.fef?.pruebas?.[1] || '', prueba6: '', prueba5: '', percentPred: data.fef?.pct ? Math.round(data.fef.pct) : '', zScore: data.fef?.z_score || '' },
                { parameter: 'PEF [L/s]', pred: data.pef?.pred || '', lln: data.pef?.lln || '', mejor: `${data.pef?.mejor || ''}${data.pef?.fuera_rango ? '*' : ''}`, prueba2: data.pef?.pruebas?.[1] || '', prueba6: '', prueba5: '', percentPred: data.pef?.pct ? Math.round(data.pef.pct) : '', zScore: data.pef?.z_score || '' },
                { parameter: 'FET [s]', pred: data.fet?.pred || '', lln: '', mejor: data.fet?.mejor || '', prueba2: data.fet?.pruebas?.[1] || '', prueba6: '', prueba5: '', percentPred: '', zScore: '' },
            ],
            session: {
                quality: data.calidad_detalle || `Grado ${data.calidad || 'A'}`,
                interpretation: data.interpretacion_sistema || PATRON_STYLES[data.patron]?.label || '-',
            },
            doctor: {
                name: data.medico || 'GP Medical Health',
                date: data.fecha?.slice(0, 10) || '',
                notes: data.interpretacion_sistema || PATRON_STYLES[data.patron]?.label || 'ESPIROMETRÍA',
            },
            graphs: {
                flowVolume: flowVolumeCurve,
                volumeTime: volumeTimeCurve
            }
        };
    };

    const spiroReportData = mapToSpirometryData();

    return (
        <div className="space-y-5">

            {/* ── HEADER ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-200">
                            <Wind className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Espirometría</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                {data.medico || 'GP Medical Health'} — {data.equipo || 'Espirómetro clínico'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="espirometria" onSaved={loadData} />
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Calidad</p>
                            <p className="text-sm font-bold text-slate-700">Grado {data.calidad || 'A'}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl ${patronStyle.bg} border ${patronStyle.border}`}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Patrón</p>
                            <p className={`text-sm font-bold ${patronStyle.text}`}>{patronStyle.label}</p>
                        </div>
                    </div>
                </div>

                {data.interpretacion_sistema && (
                    <div className={`mt-4 flex items-start gap-3 p-3 rounded-xl ${patronStyle.bg} border ${patronStyle.border}`}>
                        {isNormal
                            ? <CheckCircle className={`w-4 h-4 ${patronStyle.text} flex-shrink-0 mt-0.5`} />
                            : <AlertTriangle className={`w-4 h-4 ${patronStyle.text} flex-shrink-0 mt-0.5`} />}
                        <p className={`text-sm font-medium ${patronStyle.text}`}>{data.interpretacion_sistema}</p>
                    </div>
                )}

                {alertas.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                        {alertas.map((a, i) => (
                            <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.07 }}
                                className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                                <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-700">{a}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── TABS ── */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {(['scanner', 'analisis'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSection(s)}
                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSection === s ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {s === 'scanner' ? '📋 Vista Escáner' : '🧠 Análisis IA'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ══ SECCIÓN 1: ESCÁNER (CLON DEL PDF) ══ */}
                {activeSection === 'scanner' && (
                    <motion.div key="scanner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        <div className="overflow-x-auto bg-slate-50/50 p-2 md:p-6 rounded-2xl border border-slate-200 shadow-inner">
                            {/* PRIORIDAD 1: SpiroClone directo (datos perfectos) */}
                            {directSpiroData ? (
                                <div className="min-w-[800px]">
                                    <SpirometryReport data={directSpiroData} />
                                </div>
                            ) : spiroReportData ? (
                                <div className="min-w-[800px]">
                                    <SpirometryReport data={spiroReportData} />
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-600" />
                                    Preparando formato original...
                                </div>
                            )}
                        </div>

                        <DocumentosAdjuntos pacienteId={pacienteId} categoria="espirometria" titulo="Reporte Original" collapsedByDefault={false} />
                    </motion.div>
                )}

                {/* ══ SECCIÓN 2: ANÁLISIS IA ══ */}
                {activeSection === 'analisis' && (
                    <motion.div key="analisis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">

                        {/* Header IA */}
                        <div className="bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 rounded-2xl p-5 text-white relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <motion.div key={i} className="absolute bottom-0 bg-cyan-300 rounded-t-sm"
                                        style={{ left: `${i * 8 + 2}%`, width: '4%' }}
                                        animate={{ height: [`${20 + Math.random() * 60}%`, `${20 + Math.random() * 60}%`] }}
                                        transition={{ duration: 1.2 + Math.random(), repeat: Infinity, delay: Math.random() }} />
                                ))}
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Brain className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm">Análisis Neumológico IA</p>
                                        <p className="text-cyan-200 text-xs">Interpretación clínica avanzada — función pulmonar completa</p>
                                    </div>
                                </div>
                                <p className="text-sm text-cyan-100 leading-relaxed">
                                    {data.interpretacion_sistema || `Patrón ventilatorio: ${patronStyle.label}. FVC ${Math.round(data.fvc?.pct || 0)}% — FEV1 ${Math.round(data.fev1?.pct || 0)}% del predicho.`}
                                </p>
                            </div>
                        </div>

                        {/* Curvas en análisis también */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FlowVolumeCurve curva={data.curvaFV} fvc={data.fvc?.mejor || 0} pef={data.pef?.mejor || 0} />
                            <VolTimeCurve curva={data.curvaVT} fvc={data.fvc?.mejor || 0} fev1={data.fev1?.mejor || 0} />
                        </div>

                        {/* Gauges de parámetros principales */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">% del Predicho — Parámetros Principales</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <ParamGauge label="FVC" mejor={data.fvc?.mejor || 0} pred={data.fvc?.pred || 0} pct={data.fvc?.pct || 0} unit="L" />
                                <ParamGauge label="FEV1" mejor={data.fev1?.mejor || 0} pred={data.fev1?.pred || 0} pct={data.fev1?.pct || 0} unit="L" />
                                {data.fef?.pred > 0 && <ParamGauge label="FEF 25-75%" mejor={data.fef?.mejor || 0} pred={data.fef?.pred || 0} pct={data.fef?.pct || 0} unit="L/s" />}
                                {data.pef?.pred > 0 && <ParamGauge label="PEF" mejor={data.pef?.mejor || 0} pred={data.pef?.pred || 0} pct={data.pef?.pct || 0} unit="L/s" />}
                            </div>
                        </div>

                        {/* FEV1/FVC ratio especial */}
                        {data.fev1_fvc?.mejor > 0 && (
                            <div className={`p-5 rounded-2xl border ${data.fev1_fvc.mejor >= 70 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Relación FEV1/FVC — Índice de Tiffeneau</p>
                                    <p className={`text-3xl font-black ${data.fev1_fvc.mejor >= 70 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                        {data.fev1_fvc.mejor}%
                                    </p>
                                </div>
                                <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                                    <motion.div className={`h-full rounded-full ${data.fev1_fvc.mejor >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(data.fev1_fvc.mejor, 100)}%` }}
                                        transition={{ duration: 1.0, ease: 'easeOut' }} />
                                </div>
                                <p className={`text-xs font-medium mt-2 ${data.fev1_fvc.mejor >= 70 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {data.fev1_fvc.mejor >= 70 ? 'Sin patrón obstructivo — relación normal (≥70%)' : 'Relación disminuida (<70%) — compatible con patrón obstructivo'}
                                </p>
                            </div>
                        )}

                        {/* Interpretación neumológica completa */}
                        <Card className="border-cyan-100 shadow-sm bg-gradient-to-br from-cyan-50 to-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="w-4 h-4 text-cyan-600" />
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Interpretación Neumológica Completa</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3 bg-white rounded-xl border border-cyan-100">
                                        <p className="font-black text-cyan-700 text-xs uppercase tracking-widest mb-1">Patrón Ventilatorio</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            <strong>{patronStyle.label}</strong> —{' '}
                                            {isNormal ? 'Función pulmonar dentro de límites normales. Sin restricción ni obstrucción significativa.'
                                                : data.patron.includes('obstruc') ? `Limitación al flujo espiratorio. FEV1/FVC reducido (${data.fev1_fvc?.mejor}%). FEV1 al ${Math.round(data.fev1?.pct || 0)}% del predicho.`
                                                    : data.patron === 'restrictivo' ? `Reducción de volúmenes pulmonares. FVC al ${Math.round(data.fvc?.pct || 0)}% del predicho con FEV1/FVC conservado.`
                                                        : 'Patrón mixto: coexisten componentes obstructivo y restrictivo.'}
                                        </p>
                                    </div>
                                    {data.fef?.pct > 0 && (
                                        <div className="p-3 bg-white rounded-xl border border-cyan-100">
                                            <p className="font-black text-cyan-700 text-xs uppercase tracking-widest mb-1">Vías Aéreas Pequeñas</p>
                                            <p className="text-sm text-slate-700">
                                                FEF 25-75%: <strong>{data.fef.mejor} L/s</strong> ({Math.round(data.fef.pct)}% del predicho).{' '}
                                                {data.fef.pct < 60 ? 'Obstrucción de vías aéreas pequeñas — hallazgo temprano de enfermedad bronquial.' : 'Flujo en vías pequeñas conservado.'}
                                            </p>
                                        </div>
                                    )}
                                    {alertas.length > 0 && (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                            <p className="font-black text-amber-700 text-xs uppercase tracking-widest mb-2">Hallazgos Significativos</p>
                                            <ul className="space-y-1">
                                                {alertas.map((a, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <Zap className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-xs text-amber-700">{a}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {/* vs previo */}
                                    {prev && (
                                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="font-black text-blue-700 text-xs uppercase tracking-widest mb-2">Evolución vs Estudio Previo</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { label: 'FVC', curr: data.fvc?.pct, prevV: prev.fvc?.pct },
                                                    { label: 'FEV1', curr: data.fev1?.pct, prevV: prev.fev1?.pct },
                                                    { label: 'FEV1/FVC', curr: data.fev1_fvc?.mejor, prevV: prev.fev1_fvc?.mejor },
                                                ].map(({ label, curr, prevV }) => {
                                                    const diff = (curr || 0) - (prevV || 0)
                                                    return (
                                                        <div key={label}>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs font-black text-slate-700">
                                                                    {Math.round(prevV || 0)} → {Math.round(curr || 0)}%
                                                                </span>
                                                                <span className={`text-[10px] ${diff > 3 ? 'text-emerald-600' : diff < -3 ? 'text-red-600' : 'text-slate-400'}`}>
                                                                    {diff > 3 ? <TrendingUp className="w-3 h-3 inline" /> : diff < -3 ? <TrendingDown className="w-3 h-3 inline" /> : <Minus className="w-3 h-3 inline" />}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Aptitud laboral */}
                        <Card className="border-emerald-100 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Aptitud Laboral Respiratoria</p>
                                </div>
                                <div className={`p-3 rounded-xl ${isNormal ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {isNormal
                                            ? 'Función pulmonar normal. Sin restricción laboral de origen respiratorio. Control espirométrico periódico según NOM-047-SSA1.'
                                            : data.fev1?.pct < 50
                                                ? 'Limitación funcional respiratoria severa. Evaluar restricción de exposición a agentes irritantes y valoración por neumólogo para determinación de aptitud.'
                                                : 'Función pulmonar con alteraciones moderadas. Uso de EPP respiratorio recomendado. Seguimiento espirométrico semestral. Correlacionar con historia de exposición laboral.'}
                                    </p>
                                </div>
                                <ul className="mt-3 space-y-2">
                                    {[
                                        isNormal ? 'Control espirométrico anual (NOM-047-SSA1)' : 'Control espirométrico cada 6 meses',
                                        !isNormal && 'Evaluación por neumólogo para diagnóstico diferencial',
                                        !isNormal && 'Uso obligatorio de EPP respiratorio en exposición a polvos/gases',
                                        data.fumador === 'Sí' && 'Intervención para cesación tabáquica — factor de riesgo modificable',
                                    ].filter(Boolean).map((r, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                            <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span>{r as string}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    )
}
